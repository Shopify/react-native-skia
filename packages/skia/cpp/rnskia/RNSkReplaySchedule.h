#pragma once

#include <optional>
#include <utility>

namespace RNSkia {

/** When a view's next replay may start (see RNSkReplaySchedule). */
enum class ReplayPacing {
  /** Once the view's previous recording is presented. */
  kAfterPresent,
  /** As soon as the previous replay has finished. */
  kPipelined,
};

/**
 * When a view's replays may start and where a finished recording goes, kept
 * apart from what a recording is so that it can be tested on its own
 * (RNSkGraphiteProducer is the one in use, under its lock).
 *
 * A view has at most one job in flight and one recording on its target: a
 * present replays every recording queued on the target, so a second one of
 * the view would be replayed and never shown. A recording finished while the
 * previous one is still on the target is deferred here until the view has
 * presented that one, and no job starts meanwhile.
 *
 * Pipelined, a job may start while the previous recording still waits for its
 * vsync, so that the replay of one frame overlaps the present of the other: on
 * a Vulkan window the present alone takes two to three milliseconds of the
 * main thread, so a replay that only started once the frame was on screen
 * missed every other vsync at 120 Hz. After present, the next job starts once
 * the previous recording is presented.
 */
template <typename Recording> class RNSkReplaySchedule {
public:
  explicit RNSkReplaySchedule(ReplayPacing pacing) : _pacing(pacing) {}

  /** Starts a job if one may start now. Returns whether it did. */
  [[nodiscard]] bool tryStartJob() {
    if (_jobInFlight || _deferred.has_value() || waitsForPresent()) {
      return false;
    }
    _jobInFlight = true;
    return true;
  }

  /**
   The job tryStartJob() started finished a recording for the current target.
   Returns it, to submit now, unless the previous one is still on the target:
   it is then deferred until the view has presented that one.
   */
  [[nodiscard]] std::optional<Recording> finishJob(Recording recording) {
    _jobInFlight = false;
    if (_onTarget.has_value()) {
      _deferred = std::move(recording);
      return std::nullopt;
    }
    _onTarget = recording;
    return recording;
  }

  /**
   The job tryStartJob() started ended without a recording for the current
   target: nothing was recorded, or the recording is for a target the view
   has left.
   */
  void endJob() { _jobInFlight = false; }

  /**
   The view is done with a recording it took off its target: it presented it,
   or skipped it as one it cannot replay. Any recording may come here (a
   client's, the last frame presented again); only the view's own recording
   on the target lets the next one go. Returns the deferred recording, to
   submit now, if there is one.
   */
  [[nodiscard]] std::optional<Recording>
  recordingPresented(const Recording &recording) {
    if (_onTarget != recording) {
      return std::nullopt;
    }
    _onTarget = std::exchange(_deferred, std::nullopt);
    return _onTarget;
  }

  /**
   The view moved to another target. Its recording on the previous one is not
   coming through this view anymore (the view unbound itself from it): it is
   not waited for. Returns the deferred recording, which was made for the
   previous target, to submit there.
   */
  [[nodiscard]] std::optional<Recording> retarget() {
    _onTarget.reset();
    return std::exchange(_deferred, std::nullopt);
  }

private:
  bool waitsForPresent() const {
    switch (_pacing) {
    case ReplayPacing::kAfterPresent:
      return _onTarget.has_value();
    case ReplayPacing::kPipelined:
      return false;
    }
    return false;
  }

  const ReplayPacing _pacing;
  bool _jobInFlight = false;
  // The view's recording on the target, until the view has presented it.
  std::optional<Recording> _onTarget;
  // The recording finished after it, until it goes to the target.
  std::optional<Recording> _deferred;
};

} // namespace RNSkia
