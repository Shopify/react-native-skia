// Host-side checks of RNSkia::RNSkPresentHold, which holds a window's present
// for the GPU, gives it one frame a tick and, for a window that latches on its
// draw, one frame per frame it took (see run.sh).

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

/** A window's hold, and whether it latches on its draw. */
struct WindowKind {
  PresentHold hold;
  bool latches;
};

constexpr WindowKind kWindowKinds[] = {
    {PresentHold::kNone, false},
    {PresentHold::kOncePerTickAfterPreviousFrame, false},
    {PresentHold::kNone, true},
    {PresentHold::kOncePerTickAfterPreviousFrame, true}};

/**
 A window's side of the hold, as RNSkWindowSurface drives it: the frames it
 replays, presents and drops, the GPU they run on and, for a window that
 latches on its draw, the frames its draws take.
 */
class Window {
public:
  explicit Window(PresentHold hold, bool latches = false)
      : _gpu(std::make_shared<GpuQueue>()), _presentHold(hold, FakeGpu(_gpu)) {
    _presentHold.setLatchesOnWindowDraw(latches);
  }

  explicit Window(WindowKind kind) : Window(kind.hold, kind.latches) {}

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

  /** The window's draw takes the frame presented last, if one waits for it. */
  bool windowTakesFrame() {
    if (!_frameForWindow) {
      return false;
    }
    _frameForWindow = std::nullopt;
    _presentHold.windowTookFrame();
    return true;
  }

  /** The window stops latching on its draw, as a new window may. */
  void stopLatching() {
    _presentHold.setLatchesOnWindowDraw(false);
    _frameForWindow = std::nullopt;
  }

  /**
   The window's surface is replaced, as when its GPU device is: a held frame
   goes with it, since nothing can present it anymore.
   */
  void replaceSurface() {
    if (_presentHold.hasHeldFrame()) {
      _dropped.push_back(_frame);
    }
    _presentHold.dropFrames();
    _lastPresented = std::nullopt;
    _presentedSinceTick = 0;
    _frameForWindow = std::nullopt;
  }

  /**
   The swapchain is reconfigured for a new size: its held frame is presented
   into it first, whatever the GPU and the tick.
   */
  void reconfigure() { release(); }

  /**
   The window goes away: its held frame is presented into it before the
   swapchain goes, whatever the GPU and the tick, and the next window starts
   afresh.
   */
  void detach() { release(); }

  bool hasHeldFrame() const { return _presentHold.hasHeldFrame(); }
  int tracked() const { return _gpu->tracked; }
  const std::vector<int> &replayed() const { return _replayed; }
  const std::vector<int> &presented() const { return _presented; }
  const std::vector<int> &dropped() const { return _dropped; }
  /** The frames presented into a swapchain about to change. */
  const std::vector<int> &released() const { return _released; }
  /**
   Whether a frame was ever presented while the GPU was still on the frame
   presented before it, on the same swapchain.
   */
  bool presentedOverBusyGpu() const { return _presentedOverBusyGpu; }
  /** The most frames ever presented on one swapchain between two ticks. */
  int mostPresentedInATick() const { return _mostPresentedInATick; }
  /**
   Whether a frame was ever presented before the window took the frame
   presented before it, on the same swapchain.
   */
  bool presentedOverUntakenFrame() const { return _presentedOverUntakenFrame; }

private:
  void present() {
    _presentedOverBusyGpu =
        _presentedOverBusyGpu ||
        (_lastPresented && _gpu->finished < *_lastPresented);
    _presentedOverUntakenFrame =
        _presentedOverUntakenFrame || _frameForWindow.has_value();
    _lastPresented = _frame;
    _frameForWindow = _frame;
    _presented.push_back(_frame);
    _mostPresentedInATick =
        std::max(_mostPresentedInATick, ++_presentedSinceTick);
  }

  void release() {
    _presentHold.releaseFrames([this] { _released.push_back(_frame); });
    _lastPresented = std::nullopt;
    _presentedSinceTick = 0;
    _frameForWindow = std::nullopt;
  }

  std::shared_ptr<GpuQueue> _gpu;
  Hold _presentHold;
  int _frame = 0;
  std::optional<int> _lastPresented;
  // The frame presented last, until the window's draw takes it.
  std::optional<int> _frameForWindow;
  bool _presentedOverBusyGpu = false;
  bool _presentedOverUntakenFrame = false;
  int _presentedSinceTick = 0;
  int _mostPresentedInATick = 0;
  std::vector<int> _replayed;
  std::vector<int> _presented;
  std::vector<int> _dropped;
  std::vector<int> _released;
};

enum class Event {
  kReplay,
  kPresentHeldFrame,
  kFinishGpuFrame,
  kReconfigure,
  kReplaceSurface,
  kTick,
  kWindowTakesFrame,
  kDetach
};

constexpr Event kEvents[] = {Event::kReplay,         Event::kPresentHeldFrame,
                             Event::kFinishGpuFrame, Event::kReconfigure,
                             Event::kReplaceSurface, Event::kTick,
                             Event::kDetach};

constexpr Event kLatchingEvents[] = {
    Event::kReplay,           Event::kPresentHeldFrame,
    Event::kFinishGpuFrame,   Event::kReconfigure,
    Event::kReplaceSurface,   Event::kTick,
    Event::kWindowTakesFrame, Event::kDetach};

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
  case Event::kReplaceSurface:
    window.replaceSurface();
    return true;
  case Event::kTick:
    window.tick();
    return true;
  case Event::kWindowTakesFrame:
    return window.windowTakesFrame();
  case Event::kDetach:
    window.detach();
    return true;
  }
  return false;
}

/**
 A window of `kind` that took `sequence` from the start, or none if it could
 not take one of its events. A window shares its GPU with its hold, so it is
 made again rather than copied.
 */
std::unique_ptr<Window> windowAfter(WindowKind kind,
                                    const std::vector<Event> &sequence) {
  auto window = std::make_unique<Window>(kind);
  for (Event event : sequence) {
    if (!apply(*window, event)) {
      return nullptr;
    }
  }
  return window;
}

using Check =
    std::function<void(const std::vector<Event> &sequence, const Window &)>;

template <typename Events>
void forEachSequence(WindowKind kind, const Events &events, size_t depth,
                     const Check &check, std::vector<Event> &sequence) {
  if (sequence.size() == depth) {
    return;
  }
  for (Event event : events) {
    sequence.push_back(event);
    if (auto window = windowAfter(kind, sequence)) {
      check(sequence, *window);
      if (event != Event::kDetach) {
        forEachSequence(kind, events, depth, check, sequence);
      }
    }
    sequence.pop_back();
  }
}

/**
 Every sequence of events up to a depth a window of `kind` can take: `check`
 runs after each event. Only a window that latches on its draw sees its draws
 take frames; any other never waits for one. The extra event costs the
 latching window a level of depth, which still holds several frames taken in
 a row. A detach ends a sequence: the window that follows starts as one after
 a reconfigure does, which the sequences already cover.
 */
void forEachSequence(WindowKind kind, const Check &check) {
  std::vector<Event> sequence;
  if (kind.latches) {
    forEachSequence(kind, kLatchingEvents, 8, check, sequence);
  } else {
    forEachSequence(kind, kEvents, 9, check, sequence);
  }
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

TEST_CASE(DropsTheHeldFrameWithItsSurface) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  REQUIRE(window.replay());
  window.replaceSurface();
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.presentHeldFrame() == HeldFrame::kNone);
  window.replaceSurface();
  EXPECT(window.dropped() == (std::vector<int>{2}));
  REQUIRE(window.replay());
  EXPECT(window.presented() == (std::vector<int>{1, 3}));
}

TEST_CASE(PresentsTheHeldFrameBeforeItsSwapchainIsReconfigured) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  REQUIRE(window.replay());
  REQUIRE(window.hasHeldFrame());
  window.reconfigure();
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.released() == (std::vector<int>{2}));
  EXPECT(window.dropped().empty());
  window.reconfigure();
  EXPECT(window.released() == (std::vector<int>{2}));
  REQUIRE(window.replay());
  EXPECT(window.presented() == (std::vector<int>{1, 3}));
}

TEST_CASE(ALatchingWindowHoldsTheNextFrameUntilItTookTheLast) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame, true);
  REQUIRE(window.replay());
  REQUIRE(window.finishGpuFrame());
  window.tick();
  REQUIRE(window.replay());
  EXPECT(window.hasHeldFrame());
  EXPECT(window.replayed() == (std::vector<int>{1, 2}));
  REQUIRE(window.finishGpuFrame());
  window.tick();
  EXPECT(window.presentHeldFrame() == HeldFrame::kWaiting);
  EXPECT(window.presented() == (std::vector<int>{1}));

  REQUIRE(window.windowTakesFrame());
  EXPECT(window.presentHeldFrame() == HeldFrame::kPresented);
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
}

TEST_CASE(AFrameTheWindowTookStillWaitsForTheGpu) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame, true);
  REQUIRE(window.replay());
  window.tick();
  REQUIRE(window.replay());
  REQUIRE(window.windowTakesFrame());
  EXPECT(window.presentHeldFrame() == HeldFrame::kWaiting);
  REQUIRE(window.finishGpuFrame());
  EXPECT(window.presentHeldFrame() == HeldFrame::kPresented);
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
}

TEST_CASE(ALatchingWindowWithoutHoldingWaitsOnlyForItsDraw) {
  Window window(PresentHold::kNone, true);
  REQUIRE(window.replay());
  REQUIRE(window.replay());
  EXPECT(window.hasHeldFrame());
  EXPECT(window.tracked() == 0);
  REQUIRE(window.windowTakesFrame());
  EXPECT(window.presentHeldFrame() == HeldFrame::kPresented);
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
}

TEST_CASE(ANewSwapchainWaitsForNoFrameTheOldOneHad) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame, true);
  REQUIRE(window.replay());
  window.reconfigure();
  REQUIRE(window.replay());
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.presented() == (std::vector<int>{1, 2}));
}

TEST_CASE(AWindowThatStopsLatchingWaitsForNoDraw) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame, true);
  REQUIRE(window.replay());
  REQUIRE(window.finishGpuFrame());
  window.stopLatching();
  window.tick();
  REQUIRE(window.replay());
  REQUIRE(window.finishGpuFrame());
  window.tick();
  REQUIRE(window.replay());
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.presented() == (std::vector<int>{1, 2, 3}));
}

TEST_CASE(PresentsTheHeldFrameWhenItsWindowGoesAway) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame);
  REQUIRE(window.replay());
  window.tick();
  REQUIRE(window.replay());
  REQUIRE(window.hasHeldFrame());
  window.detach();
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.released() == (std::vector<int>{2}));
  EXPECT(window.dropped().empty());
  REQUIRE(window.replay());
  EXPECT(window.presented() == (std::vector<int>{1, 3}));
}

TEST_CASE(ALatchingWindowGoingAwayPresentsTheFrameHeldForItsDraw) {
  Window window(PresentHold::kOncePerTickAfterPreviousFrame, true);
  REQUIRE(window.replay());
  REQUIRE(window.finishGpuFrame());
  window.tick();
  REQUIRE(window.replay());
  REQUIRE(window.hasHeldFrame());
  window.detach();
  EXPECT(!window.hasHeldFrame());
  EXPECT(window.released() == (std::vector<int>{2}));
  REQUIRE(window.replay());
  EXPECT(window.presented() == (std::vector<int>{1, 3}));
}

TEST_CASE(PresentsNothingWhenAWindowHoldingNoFrameGoesAway) {
  for (WindowKind kind : kWindowKinds) {
    Window window(kind);
    window.detach();
    REQUIRE(window.replay());
    window.detach();
    EXPECT(window.released().empty());
    EXPECT(window.presented() == (std::vector<int>{1}));
  }
}

TEST_CASE(LeavesNoFrameHeldWhenItsWindowGoesAwayInEverySequence) {
  for (WindowKind kind : kWindowKinds) {
    size_t released = 0;
    forEachSequence(kind, [kind, &released](const std::vector<Event> &sequence,
                                            const Window &window) {
      if (sequence.back() != Event::kDetach) {
        return;
      }
      EXPECT(!window.hasHeldFrame());
      std::vector<Event> beforeDetach(sequence.begin(), sequence.end() - 1);
      const auto attached = windowAfter(kind, beforeDetach);
      std::vector<int> expected = attached->released();
      if (attached->hasHeldFrame()) {
        expected.push_back(window.replayed().back());
      }
      EXPECT(window.released() == expected);
      released += window.released().size() - attached->released().size();
    });
    EXPECT((released > 0) ==
           (kind.hold == PresentHold::kOncePerTickAfterPreviousFrame ||
            kind.latches));
  }
}

TEST_CASE(NeverPresentsOverABusyGpuInEverySequence) {
  for (WindowKind kind : kWindowKinds) {
    bool presentedOverBusyGpu = false;
    forEachSequence(kind, [&presentedOverBusyGpu](const std::vector<Event> &,
                                                  const Window &window) {
      presentedOverBusyGpu =
          presentedOverBusyGpu || window.presentedOverBusyGpu();
    });
    EXPECT(presentedOverBusyGpu == (kind.hold == PresentHold::kNone));
  }
}

TEST_CASE(NeverPresentsBeforeTheWindowTookTheLastFrameInEverySequence) {
  for (WindowKind kind : kWindowKinds) {
    bool presentedOverUntakenFrame = false;
    forEachSequence(
        kind, [&presentedOverUntakenFrame](const std::vector<Event> &,
                                           const Window &window) {
          presentedOverUntakenFrame =
              presentedOverUntakenFrame || window.presentedOverUntakenFrame();
        });
    EXPECT(presentedOverUntakenFrame == !kind.latches);
  }
}

TEST_CASE(PresentsOrDropsEveryFrameOnceInOrderInEverySequence) {
  for (WindowKind kind : kWindowKinds) {
    size_t mostDropped = 0;
    forEachSequence(
        kind, [&mostDropped](const std::vector<Event> &, const Window &window) {
          const auto &presented = window.presented();
          EXPECT(std::is_sorted(presented.begin(), presented.end()));
          std::vector<int> settled = presented;
          settled.insert(settled.end(), window.dropped().begin(),
                         window.dropped().end());
          settled.insert(settled.end(), window.released().begin(),
                         window.released().end());
          std::sort(settled.begin(), settled.end());
          std::vector<int> expected(window.replayed().size() -
                                    (window.hasHeldFrame() ? 1 : 0));
          std::iota(expected.begin(), expected.end(), 1);
          EXPECT(settled == expected);
          mostDropped = std::max(mostDropped, window.dropped().size());
        });
    EXPECT((mostDropped > 0) ==
           (kind.hold == PresentHold::kOncePerTickAfterPreviousFrame ||
            kind.latches));
  }
}

TEST_CASE(PresentsAtMostOneFrameATickInEverySequence) {
  for (WindowKind kind : kWindowKinds) {
    int mostPresentedInATick = 0;
    forEachSequence(kind, [&mostPresentedInATick](const std::vector<Event> &,
                                                  const Window &window) {
      mostPresentedInATick =
          std::max(mostPresentedInATick, window.mostPresentedInATick());
    });
    EXPECT((mostPresentedInATick > 1) == (kind.hold == PresentHold::kNone));
  }
}

TEST_CASE(TakesAFrameAfterTheGpuATickAndTheWindowsDrawInEverySequence) {
  for (WindowKind kind : kWindowKinds) {
    size_t held = 0;
    forEachSequence(kind, [kind, &held](const std::vector<Event> &sequence,
                                        const Window &reached) {
      held += reached.hasHeldFrame() ? 1 : 0;
      auto window = windowAfter(kind, sequence);
      while (window->finishGpuFrame()) {
      }
      window->tick();
      if (kind.latches) {
        window->windowTakesFrame();
      }
      EXPECT(window->presentHeldFrame() != HeldFrame::kWaiting);
      EXPECT(!window->hasHeldFrame());
      EXPECT(window->replay());
    });
    EXPECT((held > 0) ==
           (kind.hold == PresentHold::kOncePerTickAfterPreviousFrame ||
            kind.latches));
  }
}

} // namespace
} // namespace RNSkia

int main() { return expect::runTestCases("RNSkPresentHoldTest"); }
