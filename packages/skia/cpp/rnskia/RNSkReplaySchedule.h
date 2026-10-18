#pragma once

#include <cstddef>
#include <optional>
#include <utility>

namespace RNSkia {

/**
 * When a view's replays may start and where a finished recording goes, kept
 * apart from what a recording is so that it can be tested on its own
 * (RNSkGraphiteProducer is the one in use, under its lock). A view has at most
 * one job in flight, and keeps at most two recordings waiting on its target:
 * a job may start while the previous recording still waits for its vsync, so
 * that the replay of one frame overlaps the present of the other. On a Vulkan
 * window the present alone takes two to three milliseconds of the main
 * thread, so a replay that only started once the frame was on screen missed
 * every other vsync at 120 Hz.
 */
template <typename Recording> class RNSkReplaySchedule {
public:
  /** Starts a job if one may start now. Returns whether it did. */
  bool tryStartJob() {
    if (_jobInFlight || _queued >= kMaxQueued) {
      return false;
    }
    _jobInFlight = true;
    return true;
  }

  /**
   The job finished a recording for the current target. Returns it, to submit
   now.
   */
  std::optional<Recording> finishJob(Recording recording) {
    _jobInFlight = false;
    _queued++;
    return recording;
  }

  /**
   The job ended without a recording for the current target: nothing was
   recorded, or the recording is for a target the view has left.
   */
  void endJob() { _jobInFlight = false; }

  /**
   The view presented `presented` recordings, every one it had taken from the
   target's queue: as many places free up. The view may present recordings
   that are not this schedule's (a client recording, the last frame shown
   again), hence the clamp. Returns a recording to submit now, if any.
   */
  std::optional<Recording> framePresented(size_t presented) {
    _queued = presented >= _queued ? 0 : _queued - presented;
    return std::nullopt;
  }

  /**
   The view moved to another target. A recording still queued on the previous
   one is not coming through this view anymore (the view unbound itself from
   it): it is not waited for. Returns a recording for the previous target, if
   any.
   */
  std::optional<Recording> retarget() {
    _queued = 0;
    return std::nullopt;
  }

private:
  static constexpr size_t kMaxQueued = 2;
  bool _jobInFlight = false;
  size_t _queued = 0;
};

} // namespace RNSkia
