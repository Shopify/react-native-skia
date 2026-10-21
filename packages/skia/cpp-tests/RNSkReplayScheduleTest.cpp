// Host-side checks of RNSkia::RNSkReplaySchedule, which paces a view's replays
// by its presents (see run.sh).

#include <algorithm>
#include <array>
#include <cstddef>
#include <optional>
#include <type_traits>

#include "Expect.h"

#include "rnskia/RNSkReplaySchedule.h"

namespace RNSkia {
namespace {

using Schedule = RNSkReplaySchedule<int>;

static_assert(!std::is_default_constructible_v<Schedule>,
              "a schedule is told how many replays must keep up");

/** Replays that must keep up in a row; small, so the search reaches it. */
constexpr size_t kReplaysToKeepUp = 2;

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
 present, its present ticks, and every recording handed to a target, in the
 order they were handed over. It also keeps the pacing the schedule must
 have, from the definition: a job still running at its second tick makes the
 view pipeline, and `replaysToKeepUp` replays in a row that started at a
 present and finished before their second tick make it wait for presents.
 */
class View {
public:
  explicit View(size_t replaysToKeepUp)
      : _replaysToKeepUp(replaysToKeepUp), _schedule(replaysToKeepUp) {}

  bool startJob() {
    if (!_schedule.tryStartJob()) {
      return false;
    }
    _overlappingJobs = _overlappingJobs || _jobRunning;
    const bool ownRecordingWaits = ownRecordingsOnTarget() > 0;
    switch (_expectedPacing) {
    case ReplayPacing::kAfterPresent:
      _startedEarly = _startedEarly || ownRecordingWaits;
      break;
    case ReplayPacing::kPipelined:
      _overlapped = _overlapped || ownRecordingWaits;
      break;
    }
    _startedEarly = _startedEarly || deferred() > 0;
    _jobRunning = true;
    _jobStartedAtPresent = _presentedSinceTick;
    _jobTicks = 0;
    return true;
  }

  void finishJob() {
    _jobRunning = false;
    if (_jobStartedAtPresent && _jobTicks <= 1) {
      _replaysKeptUp++;
      if (_replaysKeptUp >= _replaysToKeepUp &&
          _expectedPacing == ReplayPacing::kPipelined) {
        _expectedPacing = ReplayPacing::kAfterPresent;
        _caughtUp = true;
      }
    }
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
      _presentedSinceTick =
          _presentedSinceTick || recording != kClientRecording;
      submit(_schedule.recordingPresented(recording));
    }
  }

  /** The platform asked the view to present, and the view's tick ended. */
  void tick() {
    _schedule.presentTick();
    _presentedSinceTick = false;
    if (!_jobRunning) {
      return;
    }
    _jobTicks++;
    if (_jobTicks >= 2) {
      _expectedPacing = ReplayPacing::kPipelined;
      _replaysKeptUp = 0;
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

  const Schedule &schedule() const { return _schedule; }
  ReplayPacing expectedPacing() const { return _expectedPacing; }
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
  /** Whether a frame of the view is waiting or coming: the platform ticks. */
  bool ticks() const { return _jobRunning || queued() > 0 || taken() > 0; }
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
  /** Whether the view ever went back from pipelining to waiting for presents.
   */
  bool caughtUp() const { return _caughtUp; }
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

  size_t _replaysToKeepUp;
  Schedule _schedule;
  ReplayPacing _expectedPacing = ReplayPacing::kAfterPresent;
  bool _jobRunning = false;
  bool _jobStartedAtPresent = false;
  size_t _jobTicks = 0;
  bool _presentedSinceTick = false;
  size_t _replaysKeptUp = 0;
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
  bool _caughtUp = false;
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
  kTick,
  kRetarget,
  kPresentFromPreviousTarget,
};

constexpr std::array<Event, 11> kEveryEvent = {
    Event::kStart,
    Event::kFinish,
    Event::kEnd,
    Event::kSubmitClientRecording,
    Event::kTake,
    Event::kPresent,
    Event::kPresentFirst,
    Event::kDecline,
    Event::kTick,
    Event::kRetarget,
    Event::kPresentFromPreviousTarget,
};

/** The events the pacing turns on: jobs, presents and ticks. */
constexpr std::array<Event, 5> kPacingEvents = {
    Event::kStart, Event::kFinish, Event::kTake, Event::kPresent, Event::kTick,
};

/**
 Applies an event the view can take in its state. Returns whether it could.
 A client records one frame at a time, the platform ticks only while a frame
 of the view is waiting or coming, and the view moves to another target once.
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
  case Event::kTick:
    if (!view.ticks()) {
      return false;
    }
    view.tick();
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
  bool pipelined = false;
  bool caughtUp = false;
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
  EXPECT(view.schedule().pacing() == view.expectedPacing());
  EXPECT(view.schedule().hasJobInFlight() == view.jobRunning());
  EXPECT(!view.overlappingJobs());
  EXPECT(!view.startedEarly());
  EXPECT(view.ownRecordingsOnTarget() <= 1u);
  EXPECT(view.deferred() <= 1u);
  EXPECT(view.finished().startsWith(view.submitted()));
  View settled = drained(view);
  EXPECT(settled.submitted() == settled.finished());
  EXPECT(settled.startJob());
  reached.mostFinished = std::max(reached.mostFinished, view.finished().size());
  reached.pipelined =
      reached.pipelined || view.schedule().pacing() == ReplayPacing::kPipelined;
  reached.caughtUp = reached.caughtUp || view.caughtUp();
  reached.overlapped = reached.overlapped || view.overlapped();
  reached.deferred = reached.deferred || view.deferredOnce();
  reached.clientPresentedWhileOwnWaits = reached.clientPresentedWhileOwnWaits ||
                                         view.clientPresentedWhileOwnWaits();
  reached.retargetedWhileDeferred =
      reached.retargetedWhileDeferred || view.retargetedWhileDeferred();
}

/**
 Checks every sequence of up to `depth` of `events` the view can take.
 */
template <size_t kCount>
void checkEverySequence(const View &view, size_t depth,
                        const std::array<Event, kCount> &events,
                        Reached &reached) {
  if (depth == 0) {
    return;
  }
  for (Event event : events) {
    View next = view;
    if (!apply(next, event)) {
      continue;
    }
    checkInvariants(next, reached);
    if (expect::hasFailure()) {
      return;
    }
    checkEverySequence(next, depth - 1, events, reached);
  }
}

/** A schedule with a job finished at a present: its recording is on target.
 */
Schedule scheduleWithRecordingOnTarget() {
  Schedule schedule(kReplaysToKeepUp);
  EXPECT(schedule.tryStartJob());
  EXPECT(schedule.finishJob(1) == std::optional<int>(1));
  return schedule;
}

/** Makes the schedule pipeline: its job runs past its second tick. */
void outlastAFrame(Schedule &schedule, int recording) {
  REQUIRE(schedule.tryStartJob());
  schedule.presentTick();
  schedule.presentTick();
  REQUIRE(schedule.pacing() == ReplayPacing::kPipelined);
  (void)schedule.finishJob(recording);
}

TEST_CASE(StartsOneJobAtATime) {
  Schedule schedule(kReplaysToKeepUp);
  EXPECT(schedule.tryStartJob());
  EXPECT(schedule.hasJobInFlight());
  EXPECT(!schedule.tryStartJob());
  schedule.endJob();
  EXPECT(!schedule.hasJobInFlight());
  EXPECT(schedule.tryStartJob());
}

TEST_CASE(HandsAFinishedRecordingBackToSubmit) {
  Schedule schedule(kReplaysToKeepUp);
  REQUIRE(schedule.tryStartJob());
  EXPECT(schedule.finishJob(7) == std::optional<int>(7));
}

TEST_CASE(StartsTheNextJobOnceTheRecordingIsPresented) {
  Schedule schedule = scheduleWithRecordingOnTarget();
  EXPECT(schedule.pacing() == ReplayPacing::kAfterPresent);
  EXPECT(!schedule.tryStartJob());
  EXPECT(schedule.recordingPresented(1) == std::nullopt);
  EXPECT(schedule.tryStartJob());
}

TEST_CASE(WaitsForPresentsWhileReplaysKeepUp) {
  Schedule schedule = scheduleWithRecordingOnTarget();
  for (int recording = 2; recording < 10; recording++) {
    REQUIRE((schedule.recordingPresented(recording - 1)) == std::nullopt);
    REQUIRE(schedule.tryStartJob());
    schedule.presentTick();
    REQUIRE(schedule.finishJob(recording) == std::optional<int>(recording));
    EXPECT(schedule.pacing() == ReplayPacing::kAfterPresent);
  }
}

TEST_CASE(PipelinesOnceAReplayOutlastsAFrame) {
  Schedule schedule(kReplaysToKeepUp);
  REQUIRE(schedule.tryStartJob());
  schedule.presentTick();
  EXPECT(schedule.pacing() == ReplayPacing::kAfterPresent);
  schedule.presentTick();
  EXPECT(schedule.pacing() == ReplayPacing::kPipelined);
  REQUIRE(schedule.finishJob(1) == std::optional<int>(1));
  EXPECT(schedule.tryStartJob());
}

TEST_CASE(CountsNoTickWithoutAJob) {
  Schedule schedule(kReplaysToKeepUp);
  schedule.presentTick();
  schedule.presentTick();
  REQUIRE(schedule.tryStartJob());
  schedule.presentTick();
  EXPECT(schedule.pacing() == ReplayPacing::kAfterPresent);
}

TEST_CASE(DefersARecordingFinishedWhileThePreviousOneWaitsForItsVsync) {
  Schedule schedule(kReplaysToKeepUp);
  outlastAFrame(schedule, 1);
  REQUIRE(schedule.tryStartJob());
  EXPECT(schedule.finishJob(2) == std::nullopt);
  EXPECT(!schedule.tryStartJob());
  EXPECT(schedule.recordingPresented(1) == std::optional<int>(2));
  EXPECT(schedule.tryStartJob());
}

TEST_CASE(WaitsForPresentsAgainOnceReplaysStartedAtPresentsKeepUp) {
  Schedule schedule(kReplaysToKeepUp);
  outlastAFrame(schedule, 1);
  REQUIRE(schedule.recordingPresented(1) == std::nullopt);
  REQUIRE(schedule.tryStartJob());
  schedule.presentTick();
  REQUIRE(schedule.finishJob(2) == std::optional<int>(2));
  EXPECT(schedule.pacing() == ReplayPacing::kPipelined);
  REQUIRE(schedule.recordingPresented(2) == std::nullopt);
  REQUIRE(schedule.tryStartJob());
  REQUIRE(schedule.finishJob(3) == std::optional<int>(3));
  EXPECT(schedule.pacing() == ReplayPacing::kAfterPresent);
  EXPECT(!schedule.tryStartJob());
}

TEST_CASE(KeepsPipeliningForReplaysNotStartedAtAPresent) {
  Schedule schedule(kReplaysToKeepUp);
  outlastAFrame(schedule, 1);
  for (int recording = 2; recording < 6; recording++) {
    schedule.presentTick();
    REQUIRE((schedule.recordingPresented(recording - 1)) == std::nullopt);
    schedule.presentTick();
    REQUIRE(schedule.tryStartJob());
    REQUIRE(schedule.finishJob(recording) == std::optional<int>(recording));
  }
  EXPECT(schedule.pacing() == ReplayPacing::kPipelined);
}

TEST_CASE(CountsAJobWithoutARecordingAsNeither) {
  Schedule schedule(kReplaysToKeepUp);
  outlastAFrame(schedule, 1);
  for (int round = 0; round < 3; round++) {
    REQUIRE(schedule.tryStartJob());
    schedule.endJob();
  }
  EXPECT(schedule.pacing() == ReplayPacing::kPipelined);
}

TEST_CASE(WaitsOnlyForItsOwnRecording) {
  Schedule schedule(kReplaysToKeepUp);
  outlastAFrame(schedule, 1);
  REQUIRE(schedule.tryStartJob());
  REQUIRE(schedule.finishJob(2) == std::nullopt);
  EXPECT(schedule.recordingPresented(kClientRecording) == std::nullopt);
  EXPECT(!schedule.tryStartJob());
}

TEST_CASE(HandsTheDeferredRecordingOverOnce) {
  Schedule schedule(kReplaysToKeepUp);
  outlastAFrame(schedule, 1);
  REQUIRE(schedule.tryStartJob());
  REQUIRE(schedule.finishJob(2) == std::nullopt);
  EXPECT(schedule.recordingPresented(1) == std::optional<int>(2));
  EXPECT(schedule.recordingPresented(1) == std::nullopt);
  EXPECT(schedule.retarget() == std::nullopt);
}

TEST_CASE(HandsTheDeferredRecordingToThePreviousTargetOnRetarget) {
  Schedule schedule(kReplaysToKeepUp);
  outlastAFrame(schedule, 1);
  REQUIRE(schedule.tryStartJob());
  REQUIRE(schedule.finishJob(2) == std::nullopt);
  EXPECT(schedule.retarget() == std::optional<int>(2));
  EXPECT(schedule.retarget() == std::nullopt);
  EXPECT(schedule.recordingPresented(1) == std::nullopt);
}

TEST_CASE(StopsWaitingForARecordingOfAPreviousTarget) {
  Schedule schedule = scheduleWithRecordingOnTarget();
  EXPECT(schedule.retarget() == std::nullopt);
  REQUIRE(schedule.tryStartJob());
  EXPECT(schedule.finishJob(2) == std::optional<int>(2));
}

TEST_CASE(KeepsItsInvariantsInEverySequence) {
  Reached reached;
  checkEverySequence(View(1), 11, kEveryEvent, reached);
  EXPECT(reached.mostFinished >= 3u);
  EXPECT(reached.pipelined);
  EXPECT(reached.caughtUp);
  EXPECT(reached.overlapped);
  EXPECT(reached.deferred);
  EXPECT(reached.clientPresentedWhileOwnWaits);
  EXPECT(reached.retargetedWhileDeferred);
}

TEST_CASE(PacesByTheReplaysInEverySequence) {
  Reached reached;
  checkEverySequence(View(kReplaysToKeepUp), 17, kPacingEvents, reached);
  EXPECT(reached.mostFinished >= 4u);
  EXPECT(reached.pipelined);
  EXPECT(reached.caughtUp);
  EXPECT(reached.overlapped);
  EXPECT(reached.deferred);
}

} // namespace
} // namespace RNSkia

int main() { return expect::runTestCases("RNSkReplayScheduleTest"); }
