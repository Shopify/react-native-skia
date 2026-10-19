#pragma once

#include <cstddef>
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
 * The pacing follows the replays, counted in the view's present ticks. A
 * replay that started at a present and finished before the next tick keeps up
 * with the display when the next one starts at the following present, which
 * leaves the main thread alone between presents. A replay still running at
 * the second tick after it started outlasted a frame: the next one then
 * starts as soon as it finishes, so that the replay of one frame overlaps the
 * present of the other, and a view that only started its replays at presents
 * would show every other frame. A run of replays that keep up again brings
 * the view back to waiting for presents.
 */
template <typename Recording> class RNSkReplaySchedule {
public:
  /**
   `replaysToKeepUp`: how many replays in a row, each started at a present,
   must finish before their next tick for the view to wait for presents again.
   */
  explicit RNSkReplaySchedule(size_t replaysToKeepUp)
      : _replaysToKeepUp(replaysToKeepUp) {}

  /** When the next replay may start. */
  ReplayPacing pacing() const { return _pacing; }

  /** Whether a job is in flight: its frame is coming. */
  bool hasJobInFlight() const { return _jobInFlight; }

  /** Starts a job if one may start now. Returns whether it did. */
  [[nodiscard]] bool tryStartJob() {
    if (_jobInFlight || _deferred.has_value() || waitsForPresent()) {
      return false;
    }
    _jobInFlight = true;
    _jobStartedAtPresent = _presentedSinceTick;
    _ticksSinceJobStart = 0;
    return true;
  }

  /**
   The job tryStartJob() started finished a recording for the current target.
   Returns it, to submit now, unless the previous one is still on the target:
   it is then deferred until the view has presented that one.
   */
  [[nodiscard]] std::optional<Recording> finishJob(Recording recording) {
    _jobInFlight = false;
    if (_jobStartedAtPresent && _ticksSinceJobStart <= 1) {
      keptUp();
    }
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
    _presentedSinceTick = true;
    _onTarget = std::exchange(_deferred, std::nullopt);
    return _onTarget;
  }

  /**
   The view's present tick ended: the platform asked it to present, once a
   frame, while a frame of it was waiting or coming.
   */
  void presentTick() {
    _presentedSinceTick = false;
    if (!_jobInFlight) {
      return;
    }
    _ticksSinceJobStart++;
    if (_ticksSinceJobStart >= 2) {
      _pacing = ReplayPacing::kPipelined;
      _replaysKeptUp = 0;
    }
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

  void keptUp() {
    _replaysKeptUp++;
    if (_replaysKeptUp >= _replaysToKeepUp) {
      _pacing = ReplayPacing::kAfterPresent;
    }
  }

  const size_t _replaysToKeepUp;
  ReplayPacing _pacing = ReplayPacing::kAfterPresent;
  bool _jobInFlight = false;
  // Whether the job in flight started at a present, and how many present
  // ticks it has seen.
  bool _jobStartedAtPresent = false;
  size_t _ticksSinceJobStart = 0;
  // Whether the view presented its recording since its last present tick.
  bool _presentedSinceTick = false;
  // Replays in a row that started at a present and kept up.
  size_t _replaysKeptUp = 0;
  // The view's recording on the target, until the view has presented it.
  std::optional<Recording> _onTarget;
  // The recording finished after it, until it goes to the target.
  std::optional<Recording> _deferred;
};

} // namespace RNSkia
