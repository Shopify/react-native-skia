#include <algorithm>
#include <cstddef>
#include <functional>
#include <optional>
#include <vector>

#include <gtest/gtest.h>

#include "RNSkReplaySchedule.h"

namespace RNSkia {
namespace {

using Schedule = RNSkReplaySchedule<int>;

/**
 A view's side of the schedule, as RNSkGraphiteProducer and RNSkView drive it:
 the job it runs, the recordings waiting on its target, and every recording
 handed to a target, in the order they were handed over.
 */
class View {
public:
  bool startJob() {
    if (!_schedule.tryStartJob()) {
      return false;
    }
    _overlappingJobs = _overlappingJobs || _jobRunning;
    _jobRunning = true;
    return true;
  }

  void finishJob() {
    _jobRunning = false;
    const int recording = _nextRecording++;
    _finished.push_back(recording);
    submit(_schedule.finishJob(recording));
  }

  void endJob() {
    _jobRunning = false;
    _schedule.endJob();
  }

  /** Presents every recording waiting, with `others` that are not the view's.
   */
  void present(size_t others) {
    const size_t presented = _waiting.size() + others;
    _waiting.clear();
    submit(_schedule.framePresented(presented));
  }

  void retarget() {
    _waiting.clear();
    if (auto recording = _schedule.retarget()) {
      _submitted.push_back(*recording);
    }
  }

  bool jobRunning() const { return _jobRunning; }
  /** Whether a job ever started while another one ran. */
  bool overlappingJobs() const { return _overlappingJobs; }
  size_t waiting() const { return _waiting.size(); }
  const std::vector<int> &finished() const { return _finished; }
  const std::vector<int> &submitted() const { return _submitted; }

private:
  void submit(std::optional<int> recording) {
    if (recording) {
      _waiting.push_back(*recording);
      _submitted.push_back(*recording);
    }
  }

  Schedule _schedule;
  bool _jobRunning = false;
  bool _overlappingJobs = false;
  int _nextRecording = 0;
  std::vector<int> _waiting;
  std::vector<int> _finished;
  std::vector<int> _submitted;
};

enum class Event { kStart, kFinish, kEnd, kPresent, kPresentOther, kRetarget };

constexpr Event kEvents[] = {Event::kStart,        Event::kFinish,
                             Event::kEnd,          Event::kPresent,
                             Event::kPresentOther, Event::kRetarget};

/** Applies an event the view can take in its state. Returns whether it could.
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
  case Event::kPresent:
    if (view.waiting() == 0) {
      return false;
    }
    view.present(0);
    return true;
  case Event::kPresentOther:
    view.present(1);
    return true;
  case Event::kRetarget:
    view.retarget();
    return true;
  }
  return false;
}

/**
 Every sequence of events up to `depth` the view can take, from a fresh view:
 `check` runs after each event.
 */
void forEachSequence(size_t depth,
                     const std::function<void(const View &)> &check,
                     const View &view = View()) {
  if (depth == 0) {
    return;
  }
  for (Event event : kEvents) {
    View next = view;
    if (!apply(next, event)) {
      continue;
    }
    check(next);
    forEachSequence(depth - 1, check, next);
  }
}

TEST(RNSkReplayScheduleTest, StartsOneJobAtATime) {
  Schedule schedule;
  EXPECT_TRUE(schedule.tryStartJob());
  EXPECT_FALSE(schedule.tryStartJob());
  schedule.endJob();
  EXPECT_TRUE(schedule.tryStartJob());
}

TEST(RNSkReplayScheduleTest, HandsAFinishedRecordingBackToSubmit) {
  Schedule schedule;
  ASSERT_TRUE(schedule.tryStartJob());
  EXPECT_EQ(schedule.finishJob(7), std::optional<int>(7));
}

TEST(RNSkReplayScheduleTest, StartsTheNextJobWhileARecordingWaitsForItsVsync) {
  Schedule schedule;
  ASSERT_TRUE(schedule.tryStartJob());
  schedule.finishJob(1);
  EXPECT_TRUE(schedule.tryStartJob());
}

TEST(RNSkReplayScheduleTest, StartsNoJobWhileTwoRecordingsWait) {
  Schedule schedule;
  ASSERT_TRUE(schedule.tryStartJob());
  schedule.finishJob(1);
  ASSERT_TRUE(schedule.tryStartJob());
  schedule.finishJob(2);
  EXPECT_FALSE(schedule.tryStartJob());
  schedule.framePresented(2);
  EXPECT_TRUE(schedule.tryStartJob());
}

TEST(RNSkReplayScheduleTest, CountsOnlyItsOwnRecordingsAsPresented) {
  Schedule schedule;
  ASSERT_TRUE(schedule.tryStartJob());
  schedule.finishJob(1);
  ASSERT_TRUE(schedule.tryStartJob());
  schedule.finishJob(2);
  schedule.framePresented(5);
  ASSERT_TRUE(schedule.tryStartJob());
  schedule.finishJob(3);
  EXPECT_TRUE(schedule.tryStartJob());
}

TEST(RNSkReplayScheduleTest, StopsWaitingForRecordingsOfAPreviousTarget) {
  Schedule schedule;
  ASSERT_TRUE(schedule.tryStartJob());
  schedule.finishJob(1);
  ASSERT_TRUE(schedule.tryStartJob());
  schedule.finishJob(2);
  schedule.retarget();
  EXPECT_TRUE(schedule.tryStartJob());
}

TEST(RNSkReplayScheduleTest, KeepsAtMostOneJobInFlightInEverySequence) {
  forEachSequence(
      7, [](const View &view) { EXPECT_FALSE(view.overlappingJobs()); });
}

TEST(RNSkReplayScheduleTest, KeepsAtMostTwoRecordingsWaitingInEverySequence) {
  size_t mostWaiting = 0;
  forEachSequence(7, [&mostWaiting](const View &view) {
    EXPECT_LE(view.waiting(), 2u);
    mostWaiting = std::max(mostWaiting, view.waiting());
  });
  EXPECT_EQ(mostWaiting, 2u);
}

TEST(RNSkReplayScheduleTest, SubmitsEveryRecordingOnceInOrderInEverySequence) {
  size_t mostFinished = 0;
  forEachSequence(7, [&mostFinished](const View &view) {
    EXPECT_EQ(view.submitted(), view.finished());
    mostFinished = std::max(mostFinished, view.finished().size());
  });
  EXPECT_GE(mostFinished, 3u);
}

} // namespace
} // namespace RNSkia
