// Host-side checks of RNSkia::RNSkPresentHold, which holds a window's present
// for the GPU and gives it one frame a tick (see run.sh).

#include <algorithm>
#include <cstddef>
#include <functional>
#include <memory>
#include <numeric>
#include <optional>
#include <type_traits>
#include <utility>
#include <vector>

#include "Expect.h"

#include "rnskia/RNSkPresentHold.h"

namespace RNSkia {
namespace {

/** The work a window's frames gave the GPU: frame n is work n. */
struct GpuQueue {
  int submitted = 0;
  int finished = 0;
  int tracked = 0;
};

/** The GPU as RNSkPresentHold sees it, over a queue the test drives. */
class FakeGpu {
public:
  using Work = int;

  explicit FakeGpu(std::shared_ptr<GpuQueue> queue)
      : _queue(std::move(queue)) {}

  int track() {
    _queue->tracked++;
    return _queue->submitted;
  }

  bool isDone(const int &work) const { return _queue->finished >= work; }

private:
  std::shared_ptr<GpuQueue> _queue;
};

using Hold = RNSkPresentHold<FakeGpu>;

static_assert(!std::is_default_constructible_v<Hold>,
              "a window's hold is chosen when the window is made");

constexpr PresentHold kHolds[] = {PresentHold::kNone,
                                  PresentHold::kOncePerTickAfterPreviousFrame};

/**
 A window's side of the hold, as RNSkWindowSurface drives it: the frames it
 replays, presents and drops, and the GPU they run on.
 */
class Window {
public:
  explicit Window(PresentHold hold)
      : _gpu(std::make_shared<GpuQueue>()), _presentHold(hold, FakeGpu(_gpu)) {}

  Window(const Window &) = delete;
  Window &operator=(const Window &) = delete;

  /** The window replays a frame; it takes none while it holds one. */
  bool replay() {
    if (_presentHold.hasHeldFrame()) {
      return false;
    }
    _frame = ++_gpu->submitted;
    _replayed.push_back(_frame);
    _presentHold.presentOrHold([this] { present(); });
    return true;
  }

  HeldFrame presentHeldFrame() {
    return _presentHold.presentHeldFrame([this] { present(); });
  }

  /** A frame of the display asks the window to present. */
  void tick() {
    _presentHold.allowNextPresent();
    _presentedSinceTick = 0;
  }

  /** The GPU finishes the oldest frame it is on. */
  bool finishGpuFrame() {
    if (_gpu->finished == _gpu->submitted) {
      return false;
    }
    _gpu->finished++;
    return true;
  }

  /** The swapchain is reconfigured, and a held frame goes with it. */
  void reconfigure() {
    if (_presentHold.hasHeldFrame()) {
      _dropped.push_back(_frame);
    }
    _presentHold.dropFrames();
    _lastPresented = std::nullopt;
    _presentedSinceTick = 0;
  }

  bool hasHeldFrame() const { return _presentHold.hasHeldFrame(); }
  int tracked() const { return _gpu->tracked; }
  const std::vector<int> &replayed() const { return _replayed; }
  const std::vector<int> &presented() const { return _presented; }
  const std::vector<int> &dropped() const { return _dropped; }
  /**
   Whether a frame was ever presented while the GPU was still on the frame
   presented before it, on the same swapchain.
   */
  bool presentedOverBusyGpu() const { return _presentedOverBusyGpu; }
  /** The most frames ever presented on one swapchain between two ticks. */
  int mostPresentedInATick() const { return _mostPresentedInATick; }

private:
  void present() {
    _presentedOverBusyGpu =
        _presentedOverBusyGpu ||
        (_lastPresented && _gpu->finished < *_lastPresented);
    _lastPresented = _frame;
    _presented.push_back(_frame);
    _mostPresentedInATick =
        std::max(_mostPresentedInATick, ++_presentedSinceTick);
  }

  std::shared_ptr<GpuQueue> _gpu;
  Hold _presentHold;
  int _frame = 0;
  std::optional<int> _lastPresented;
  bool _presentedOverBusyGpu = false;
  int _presentedSinceTick = 0;
  int _mostPresentedInATick = 0;
  std::vector<int> _replayed;
  std::vector<int> _presented;
  std::vector<int> _dropped;
};

enum class Event {
  kReplay,
  kPresentHeldFrame,
  kFinishGpuFrame,
  kReconfigure,
  kTick
};

constexpr Event kEvents[] = {Event::kReplay, Event::kPresentHeldFrame,
                             Event::kFinishGpuFrame, Event::kReconfigure,
                             Event::kTick};

/** Applies an event the window can take in its state. Returns whether it could.
 */
bool apply(Window &window, Event event) {
  switch (event) {
  case Event::kReplay:
    return window.replay();
  case Event::kPresentHeldFrame:
    return window.presentHeldFrame() != HeldFrame::kNone;
  case Event::kFinishGpuFrame:
    return window.finishGpuFrame();
  case Event::kReconfigure:
    window.reconfigure();
    return true;
  case Event::kTick:
    window.tick();
    return true;
  }
  return false;
}

/**
 A window with `hold` that took `sequence` from the start, or none if it could
 not take one of its events. A window shares its GPU with its hold, so it is
 made again rather than copied.
 */
std::unique_ptr<Window> windowAfter(PresentHold hold,
                                    const std::vector<Event> &sequence) {
  auto window = std::make_unique<Window>(hold);
  for (Event event : sequence) {
    if (!apply(*window, event)) {
      return nullptr;
    }
  }
  return window;
}

using Check =
    std::function<void(const std::vector<Event> &sequence, const Window &)>;

void forEachSequence(PresentHold hold, size_t depth, const Check &check,
                     std::vector<Event> &sequence) {
  if (sequence.size() == depth) {
    return;
  }
  for (Event event : kEvents) {
    sequence.push_back(event);
    if (auto window = windowAfter(hold, sequence)) {
      check(sequence, *window);
      forEachSequence(hold, depth, check, sequence);
    }
    sequence.pop_back();
  }
}

/**
 Every sequence of events up to a depth a window with `hold` can take: `check`
 runs after each event.
 */
void forEachSequence(PresentHold hold, const Check &check) {
  std::vector<Event> sequence;
  forEachSequence(hold, 10, check, sequence);
}

TEST_CASE(PresentsEveryFrameAtOnceWithoutHolding) {
  Window window(PresentHold::kNone);
  REQUIRE(window.replay());
  REQUIRE(window.replay());
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
  EXPECT(window.tracked() == 0);
}

TEST_CASE(TicksChangeNothingWithoutHolding) {
  Window window(PresentHold::kNone);
  REQUIRE(window.replay());
  window.tick();
  REQUIRE(window.replay());
  REQUIRE(window.replay());
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.presented() == (std::vector<int>{1, 2, 3}));
}

TEST_CASE(PresentsTheFirstFrameAtOnce) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.presented() == (std::vector<int>{1}));
}

TEST_CASE(HoldsAFrameWhileTheGpuIsOnThePreviousOne) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  window.tick();
  REQUIRE(window.replay());
  EXPECT(window.hasHeldFrame());
  EXPECT(!window.replay());
  EXPECT(window.presentHeldFrame() == HeldFrame::kWaiting);
  EXPECT(window.presented() == (std::vector<int>{1}));
}

TEST_CASE(PresentsTheHeldFrameOnceTheGpuIsDone) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  window.tick();
  REQUIRE(window.replay());
  REQUIRE(window.finishGpuFrame());
  EXPECT(window.presentHeldFrame() == HeldFrame::kPresented);
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
  EXPECT(window.presentHeldFrame() == HeldFrame::kNone);
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
}

TEST_CASE(PresentsAFrameAtOnceOnceTheGpuIsDoneAfterATick) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  REQUIRE(window.finishGpuFrame());
  window.tick();
  REQUIRE(window.replay());
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
}

TEST_CASE(HoldsASecondFrameInATickWhateverTheGpu) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  REQUIRE(window.finishGpuFrame());
  REQUIRE(window.replay());
  EXPECT(window.hasHeldFrame());
  REQUIRE(window.finishGpuFrame());
  EXPECT(window.presentHeldFrame() == HeldFrame::kWaiting);
  EXPECT(window.presented() == (std::vector<int>{1}));

  window.tick();
  EXPECT(window.presentHeldFrame() == HeldFrame::kPresented);
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
}

TEST_CASE(ATickPresentsTheHeldFrameOnlyOnceTheGpuIsDone) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  window.tick();
  REQUIRE(window.replay());
  window.tick();
  EXPECT(window.presentHeldFrame() == HeldFrame::kWaiting);
  REQUIRE(window.finishGpuFrame());
  EXPECT(window.presentHeldFrame() == HeldFrame::kPresented);
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
}

TEST_CASE(DropsTheHeldFrameWithItsSwapchain) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  REQUIRE(window.replay());
  window.reconfigure();
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.presentHeldFrame() == HeldFrame::kNone);
  window.reconfigure();
  EXPECT(window.dropped() == (std::vector<int>{2}));
  REQUIRE(window.replay());
  EXPECT(window.presented() == (std::vector<int>{1, 3}));
}

TEST_CASE(NeverPresentsOverABusyGpuInEverySequence) {
  for (PresentHold hold : kHolds) {
    bool presentedOverBusyGpu = false;
    forEachSequence(hold, [&presentedOverBusyGpu](const std::vector<Event> &,
                                                  const Window &window) {
      presentedOverBusyGpu =
          presentedOverBusyGpu || window.presentedOverBusyGpu();
    });
    EXPECT(presentedOverBusyGpu == (hold == PresentHold::kNone));
  }
}

TEST_CASE(PresentsOrDropsEveryFrameOnceInOrderInEverySequence) {
  for (PresentHold hold : kHolds) {
    size_t mostDropped = 0;
    forEachSequence(
        hold, [&mostDropped](const std::vector<Event> &, const Window &window) {
          const auto &presented = window.presented();
          EXPECT(std::is_sorted(presented.begin(), presented.end()));
          std::vector<int> settled = presented;
          settled.insert(settled.end(), window.dropped().begin(),
                         window.dropped().end());
          std::sort(settled.begin(), settled.end());
          std::vector<int> expected(window.replayed().size() -
                                    (window.hasHeldFrame() ? 1 : 0));
          std::iota(expected.begin(), expected.end(), 1);
          EXPECT(settled == expected);
          mostDropped = std::max(mostDropped, window.dropped().size());
        });
    EXPECT((mostDropped > 0) == (hold == PresentHold::kOncePerTickAfterPreviousFrame));
  }
}

TEST_CASE(PresentsAtMostOneFrameATickInEverySequence) {
  for (PresentHold hold : kHolds) {
    int mostPresentedInATick = 0;
    forEachSequence(hold, [&mostPresentedInATick](const std::vector<Event> &,
                                                  const Window &window) {
      mostPresentedInATick =
          std::max(mostPresentedInATick, window.mostPresentedInATick());
    });
    EXPECT((mostPresentedInATick > 1) == (hold == PresentHold::kNone));
  }
}

TEST_CASE(TakesAFrameAfterTheGpuAndATickInEverySequence) {
  for (PresentHold hold : kHolds) {
    size_t held = 0;
    forEachSequence(hold, [hold, &held](const std::vector<Event> &sequence,
                                        const Window &reached) {
      held += reached.hasHeldFrame() ? 1 : 0;
      auto window = windowAfter(hold, sequence);
      while (window->finishGpuFrame()) {
      }
      window->tick();
      EXPECT(window->presentHeldFrame() != HeldFrame::kWaiting);
      EXPECT(!window->hasHeldFrame());
      EXPECT(window->replay());
    });
    EXPECT((held > 0) == (hold == PresentHold::kOncePerTickAfterPreviousFrame));
  }
}

} // namespace
} // namespace RNSkia

int main() { return expect::runTestCases("RNSkPresentHoldTest"); }
