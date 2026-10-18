#include <algorithm>
#include <array>
#include <cstddef>
#include <optional>
#include <type_traits>

#include <gtest/gtest.h>

#include "RNSkReplaySchedule.h"

namespace RNSkia {
namespace {

using Schedule = RNSkReplaySchedule<int>;

static_assert(!std::is_default_constructible_v<Schedule>,
              "a view's pacing is chosen when the view is made");

constexpr ReplayPacing kPacings[] = {ReplayPacing::kAfterPresent,
                                     ReplayPacing::kPipelined};

/** A recording on the target that is not the view's (a client's). */
constexpr int kClientRecording = -1;

/**
 Recordings in order, at most kCapacity of them, held by value: the search
 below copies a view at every step. Going past the capacity throws.
 */
template <size_t kCapacity> class Recordings {
public:
  size_t size() const { return _size; }
  int at(size_t index) const { return _items.at(index); }
  void pushBack(int recording) { _items.at(_size++) = recording; }
  void clear() { _size = 0; }

  /** Appends the recordings of `other` from `from` on. */
  template <size_t kOther>
  void append(const Recordings<kOther> &other, size_t from = 0) {
    for (size_t index = from; index < other.size(); index++) {
      pushBack(other.at(index));
    }
  }

  /** Inserts the recordings of `other` from `from` on before these. */
  template <size_t kOther>
  void prepend(const Recordings<kOther> &other, size_t from) {
    Recordings<kCapacity> joined;
    joined.append(other, from);
    joined.append(*this);
    *this = joined;
  }

  size_t countOwn() const {
    return static_cast<size_t>(std::count_if(
        _items.begin(), _items.begin() + _size,
        [](int recording) { return recording != kClientRecording; }));
  }

  bool contains(int recording) const {
    return std::find(_items.begin(), _items.begin() + _size, recording) !=
           _items.begin() + _size;
  }

  bool startsWith(const Recordings &prefix) const {
    return prefix._size <= _size &&
           std::equal(prefix._items.begin(),
                      prefix._items.begin() + prefix._size, _items.begin());
  }

  bool operator==(const Recordings &other) const {
    return _size == other._size && startsWith(other);
  }

private:
  std::array<int, kCapacity> _items{};
  size_t _size = 0;
};

using Queue = Recordings<8>;
using History = Recordings<16>;

/**
 A view's side of the schedule, as RNSkGraphiteProducer and RNSkView drive it:
 the job it runs, its target's queue, the recordings it took off the queue to
 present, and every recording handed to a target, in the order they were
 handed over.
 */
class View {
public:
  explicit View(ReplayPacing pacing) : _pacing(pacing), _schedule(pacing) {}

  bool startJob() {
    if (!_schedule.tryStartJob()) {
      return false;
    }
    _overlappingJobs = _overlappingJobs || _jobRunning;
    const bool ownRecordingWaits = ownRecordingsOnTarget() > 0;
    switch (_pacing) {
    case ReplayPacing::kAfterPresent:
      _startedEarly = _startedEarly || ownRecordingWaits;
      break;
    case ReplayPacing::kPipelined:
      _overlapped = _overlapped || ownRecordingWaits;
      break;
    }
    _startedEarly = _startedEarly || deferred() > 0;
    _jobRunning = true;
    return true;
  }

  void finishJob() {
    _jobRunning = false;
    const int recording = _nextRecording++;
    _finished.pushBack(recording);
    submit(_schedule.finishJob(recording));
    _deferredOnce = _deferredOnce || deferred() > 0;
  }

  void endJob() {
    _jobRunning = false;
    _schedule.endJob();
  }

  /** A client records a frame into the target. */
  void submitClientRecording() { _queue.pushBack(kClientRecording); }

  /** The view takes the target's queue to present it. */
  void take() {
    _taken.append(_queue);
    _queue.clear();
  }

  /**
   The view is done with the first `done` recordings it took; the others go
   back to the front of the queue (the window could not take them).
   */
  void present(size_t done) {
    Queue presented;
    for (size_t index = 0; index < done; index++) {
      presented.pushBack(_taken.at(index));
    }
    _queue.prepend(_taken, done);
    _taken.clear();
    for (size_t index = 0; index < presented.size(); index++) {
      const int recording = presented.at(index);
      _clientPresentedWhileOwnWaits =
          _clientPresentedWhileOwnWaits ||
          (recording == kClientRecording && ownRecordingsOnTarget() > 0);
      submit(_schedule.recordingPresented(recording));
    }
  }

  /**
   The view moves to another target: what was queued on this one stays
   there, and is no longer the view's to present. What the view had taken
   off it is still being presented, on the main thread.
   */
  void retarget() {
    _retargetedWhileDeferred = _retargetedWhileDeferred || deferred() > 0;
    _retargeted = true;
    _queue.clear();
    _takenFromPreviousTarget.append(_taken);
    _taken.clear();
    if (auto recording = _schedule.retarget()) {
      _submitted.pushBack(*recording);
    }
  }

  /** The view is done with what it had taken off its previous target. */
  void presentFromPreviousTarget() {
    for (size_t index = 0; index < _takenFromPreviousTarget.size(); index++) {
      submit(_schedule.recordingPresented(_takenFromPreviousTarget.at(index)));
    }
    _takenFromPreviousTarget.clear();
  }

  bool jobRunning() const { return _jobRunning; }
  bool retargeted() const { return _retargeted; }
  size_t queued() const { return _queue.size(); }
  size_t taken() const { return _taken.size(); }
  size_t takenFromPreviousTarget() const {
    return _takenFromPreviousTarget.size();
  }
  bool clientRecordingOnTarget() const {
    return _queue.contains(kClientRecording) ||
           _taken.contains(kClientRecording);
  }
  /** The view's recordings on its target, queued or taken. */
  size_t ownRecordingsOnTarget() const {
    return _queue.countOwn() + _taken.countOwn();
  }
  const History &finished() const { return _finished; }
  const History &submitted() const { return _submitted; }
  /** Recordings finished and not handed to a target yet. */
  size_t deferred() const { return _finished.size() - _submitted.size(); }

  /** Whether a job ever started while another one ran. */
  bool overlappingJobs() const { return _overlappingJobs; }
  /**
   Whether a job ever started before the pacing let it: while a recording
   was deferred, or, after present, while the view's recording waited.
   */
  bool startedEarly() const { return _startedEarly; }
  /** Whether a pipelined job ever started while the view's recording waited.
   */
  bool overlapped() const { return _overlapped; }
  bool deferredOnce() const { return _deferredOnce; }
  bool clientPresentedWhileOwnWaits() const {
    return _clientPresentedWhileOwnWaits;
  }
  bool retargetedWhileDeferred() const { return _retargetedWhileDeferred; }

private:
  void submit(std::optional<int> recording) {
    if (recording) {
      _queue.pushBack(*recording);
      _submitted.pushBack(*recording);
    }
  }

  ReplayPacing _pacing;
  Schedule _schedule;
  bool _jobRunning = false;
  bool _retargeted = false;
  int _nextRecording = 0;
  Queue _queue;
  Queue _taken;
  Queue _takenFromPreviousTarget;
  History _finished;
  History _submitted;
  bool _overlappingJobs = false;
  bool _startedEarly = false;
  bool _overlapped = false;
  bool _deferredOnce = false;
  bool _clientPresentedWhileOwnWaits = false;
  bool _retargetedWhileDeferred = false;
};

enum class Event {
  kStart,
  kFinish,
  kEnd,
  kSubmitClientRecording,
  kTake,
  kPresent,
  kPresentFirst,
  kDecline,
  kRetarget,
  kPresentFromPreviousTarget,
};

constexpr Event kEvents[] = {
    Event::kStart,        Event::kFinish,
    Event::kEnd,          Event::kSubmitClientRecording,
    Event::kTake,         Event::kPresent,
    Event::kPresentFirst, Event::kDecline,
    Event::kRetarget,     Event::kPresentFromPreviousTarget,
};

/**
 Applies an event the view can take in its state. Returns whether it could.
 A client records one frame at a time, and the view moves to another target
 once.
 */
bool apply(View &view, Event event) {
  switch (event) {
  case Event::kStart:
    return view.startJob();
  case Event::kFinish:
    if (!view.jobRunning()) {
      return false;
    }
    view.finishJob();
    return true;
  case Event::kEnd:
    if (!view.jobRunning()) {
      return false;
    }
    view.endJob();
    return true;
  case Event::kSubmitClientRecording:
    if (view.clientRecordingOnTarget()) {
      return false;
    }
    view.submitClientRecording();
    return true;
  case Event::kTake:
    if (view.queued() == 0 || view.taken() > 0) {
      return false;
    }
    view.take();
    return true;
  case Event::kPresent:
    if (view.taken() == 0) {
      return false;
    }
    view.present(view.taken());
    return true;
  case Event::kPresentFirst:
    if (view.taken() < 2) {
      return false;
    }
    view.present(1);
    return true;
  case Event::kDecline:
    if (view.taken() == 0) {
      return false;
    }
    view.present(0);
    return true;
  case Event::kRetarget:
    if (view.retargeted()) {
      return false;
    }
    view.retarget();
    return true;
  case Event::kPresentFromPreviousTarget:
    if (view.takenFromPreviousTarget() == 0) {
      return false;
    }
    view.presentFromPreviousTarget();
    return true;
  }
  return false;
}

/** The view after presenting everything and finishing its job. */
View drained(View view) {
  for (;;) {
    if (view.takenFromPreviousTarget() > 0) {
      view.presentFromPreviousTarget();
    } else if (view.taken() > 0) {
      view.present(view.taken());
    } else if (view.queued() > 0) {
      view.take();
    } else if (view.jobRunning()) {
      view.finishJob();
    } else {
      return view;
    }
  }
}

/** What the search reached, to show it is not vacuous. */
struct Reached {
  size_t mostFinished = 0;
  bool overlapped = false;
  bool deferred = false;
  bool clientPresentedWhileOwnWaits = false;
  bool retargetedWhileDeferred = false;
};

/**
 Checks the schedule's invariants in `view`, and that it can always go on:
 drained, every recording reached a target, and a job starts.
 */
void checkInvariants(const View &view, Reached &reached) {
  EXPECT_FALSE(view.overlappingJobs()) << "two jobs at once";
  EXPECT_FALSE(view.startedEarly()) << "a job started before its pacing";
  EXPECT_LE(view.ownRecordingsOnTarget(), 1u)
      << "two of the view's recordings on its target";
  EXPECT_LE(view.deferred(), 1u) << "more than one deferred recording";
  EXPECT_TRUE(view.finished().startsWith(view.submitted()))
      << "a recording handed over out of order, twice, or never";
  View settled = drained(view);
  EXPECT_EQ(settled.submitted(), settled.finished())
      << "a recording never reached a target";
  EXPECT_TRUE(settled.startJob()) << "no job starts once drained";
  reached.mostFinished = std::max(reached.mostFinished, view.finished().size());
  reached.overlapped = reached.overlapped || view.overlapped();
  reached.deferred = reached.deferred || view.deferredOnce();
  reached.clientPresentedWhileOwnWaits = reached.clientPresentedWhileOwnWaits ||
                                         view.clientPresentedWhileOwnWaits();
  reached.retargetedWhileDeferred =
      reached.retargetedWhileDeferred || view.retargetedWhileDeferred();
}

/** Checks every sequence of events up to `depth` the view can take. */
void checkEverySequence(const View &view, size_t depth, Reached &reached) {
  if (depth == 0) {
    return;
  }
  for (Event event : kEvents) {
    View next = view;
    if (!apply(next, event)) {
      continue;
    }
    checkInvariants(next, reached);
    if (::testing::Test::HasFailure()) {
      return;
    }
    checkEverySequence(next, depth - 1, reached);
  }
}

TEST(RNSkReplayScheduleTest, StartsOneJobAtATime) {
  for (ReplayPacing pacing : kPacings) {
    Schedule schedule(pacing);
    EXPECT_TRUE(schedule.tryStartJob());
    EXPECT_FALSE(schedule.tryStartJob());
    schedule.endJob();
    EXPECT_TRUE(schedule.tryStartJob());
  }
}

TEST(RNSkReplayScheduleTest, HandsAFinishedRecordingBackToSubmit) {
  for (ReplayPacing pacing : kPacings) {
    Schedule schedule(pacing);
    ASSERT_TRUE(schedule.tryStartJob());
    EXPECT_EQ(schedule.finishJob(7), std::optional<int>(7));
  }
}

TEST(RNSkReplayScheduleTest,
     PipelinedStartsTheNextJobWhileARecordingWaitsForItsVsync) {
  Schedule schedule(ReplayPacing::kPipelined);
  ASSERT_TRUE(schedule.tryStartJob());
  ASSERT_EQ(schedule.finishJob(1), std::optional<int>(1));
  EXPECT_TRUE(schedule.tryStartJob());
}

TEST(RNSkReplayScheduleTest,
     AfterPresentStartsTheNextJobOnceTheRecordingIsPresented) {
  Schedule schedule(ReplayPacing::kAfterPresent);
  ASSERT_TRUE(schedule.tryStartJob());
  ASSERT_EQ(schedule.finishJob(1), std::optional<int>(1));
  EXPECT_FALSE(schedule.tryStartJob());
  EXPECT_EQ(schedule.recordingPresented(1), std::nullopt);
  EXPECT_TRUE(schedule.tryStartJob());
}

TEST(RNSkReplayScheduleTest,
     DefersARecordingFinishedWhileThePreviousOneWaitsForItsVsync) {
  Schedule schedule(ReplayPacing::kPipelined);
  ASSERT_TRUE(schedule.tryStartJob());
  ASSERT_EQ(schedule.finishJob(1), std::optional<int>(1));
  ASSERT_TRUE(schedule.tryStartJob());
  EXPECT_EQ(schedule.finishJob(2), std::nullopt);
  EXPECT_FALSE(schedule.tryStartJob());
  EXPECT_EQ(schedule.recordingPresented(1), std::optional<int>(2));
  EXPECT_TRUE(schedule.tryStartJob());
}

TEST(RNSkReplayScheduleTest, WaitsOnlyForItsOwnRecording) {
  Schedule schedule(ReplayPacing::kPipelined);
  ASSERT_TRUE(schedule.tryStartJob());
  ASSERT_EQ(schedule.finishJob(1), std::optional<int>(1));
  ASSERT_TRUE(schedule.tryStartJob());
  ASSERT_EQ(schedule.finishJob(2), std::nullopt);
  EXPECT_EQ(schedule.recordingPresented(kClientRecording), std::nullopt);
  EXPECT_FALSE(schedule.tryStartJob());
}

TEST(RNSkReplayScheduleTest, HandsTheDeferredRecordingOverOnce) {
  Schedule schedule(ReplayPacing::kPipelined);
  ASSERT_TRUE(schedule.tryStartJob());
  ASSERT_EQ(schedule.finishJob(1), std::optional<int>(1));
  ASSERT_TRUE(schedule.tryStartJob());
  ASSERT_EQ(schedule.finishJob(2), std::nullopt);
  EXPECT_EQ(schedule.recordingPresented(1), std::optional<int>(2));
  EXPECT_EQ(schedule.recordingPresented(1), std::nullopt);
  EXPECT_EQ(schedule.retarget(), std::nullopt);
}

TEST(RNSkReplayScheduleTest,
     HandsTheDeferredRecordingToThePreviousTargetOnRetarget) {
  Schedule schedule(ReplayPacing::kPipelined);
  ASSERT_TRUE(schedule.tryStartJob());
  ASSERT_EQ(schedule.finishJob(1), std::optional<int>(1));
  ASSERT_TRUE(schedule.tryStartJob());
  ASSERT_EQ(schedule.finishJob(2), std::nullopt);
  EXPECT_EQ(schedule.retarget(), std::optional<int>(2));
  EXPECT_EQ(schedule.retarget(), std::nullopt);
  EXPECT_EQ(schedule.recordingPresented(1), std::nullopt);
}

TEST(RNSkReplayScheduleTest, StopsWaitingForARecordingOfAPreviousTarget) {
  for (ReplayPacing pacing : kPacings) {
    Schedule schedule(pacing);
    ASSERT_TRUE(schedule.tryStartJob());
    ASSERT_EQ(schedule.finishJob(1), std::optional<int>(1));
    EXPECT_EQ(schedule.retarget(), std::nullopt);
    ASSERT_TRUE(schedule.tryStartJob());
    EXPECT_EQ(schedule.finishJob(2), std::optional<int>(2));
  }
}

TEST(RNSkReplayScheduleTest, AfterPresentKeepsItsInvariantsInEverySequence) {
  Reached reached;
  checkEverySequence(View(ReplayPacing::kAfterPresent), 12, reached);
  EXPECT_GE(reached.mostFinished, 3u);
  EXPECT_FALSE(reached.overlapped);
  EXPECT_FALSE(reached.deferred);
  EXPECT_TRUE(reached.clientPresentedWhileOwnWaits);
}

TEST(RNSkReplayScheduleTest, PipelinedKeepsItsInvariantsInEverySequence) {
  Reached reached;
  checkEverySequence(View(ReplayPacing::kPipelined), 12, reached);
  EXPECT_GE(reached.mostFinished, 3u);
  EXPECT_TRUE(reached.overlapped);
  EXPECT_TRUE(reached.deferred);
  EXPECT_TRUE(reached.clientPresentedWhileOwnWaits);
  EXPECT_TRUE(reached.retargetedWhileDeferred);
}

} // namespace
} // namespace RNSkia
