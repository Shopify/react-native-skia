#pragma once

#include <optional>
#include <utility>

namespace RNSkia {

/** Whether a window holds a frame's present for the GPU (see RNSkPresentHold).
 */
enum class PresentHold {
  /** Every frame is presented as soon as it is replayed. */
  kNone,
  /** A frame is presented once the GPU has finished the one before it. */
  kUntilPreviousFrameDone,
};

/** What RNSkPresentHold::presentHeldFrame() did. */
enum class HeldFrame {
  /** The window held no frame. */
  kNone,
  /** The held frame was presented. */
  kPresented,
  /** The GPU is still on the frame before it: the frame stays held. */
  kWaiting,
};

/**
 * When a window presents the frames it replays, kept apart from Dawn so that
 * it can be tested on its own (RNSkWindowSurface is the one in use).
 *
 * On Android a present waits, on the thread that presents, until the GPU has
 * finished the frame presented before it: libgui's queueBuffer does, for every
 * Vulkan swapchain. Holding, a frame replayed before then has its work
 * submitted and its present held until a later call finds that frame done;
 * the window takes no other frame meanwhile (see hasHeldFrame). `Gpu` tracks
 * the work submitted so far (`Work track()`) and says whether it is done,
 * without waiting (`bool isDone(const Work &)`).
 */
template <typename Gpu> class RNSkPresentHold {
public:
  using Work = typename Gpu::Work;

  RNSkPresentHold(PresentHold hold, Gpu gpu)
      : _hold(hold), _gpu(std::move(gpu)) {}

  /** Whether a replayed frame waits for its present. */
  bool hasHeldFrame() const { return _hasHeldFrame; }

  /**
   A frame was replayed: presents it through `present` now, or holds it if
   the GPU is still on the frame presented before it.
   */
  template <typename Present> void presentOrHold(Present &&present) {
    if (!previousFrameDone()) {
      _hasHeldFrame = true;
      return;
    }
    presentNow(present);
  }

  /**
   Presents the held frame through `present` once the GPU has finished the
   frame before it, without waiting for the GPU.
   */
  template <typename Present> HeldFrame presentHeldFrame(Present &&present) {
    if (!_hasHeldFrame) {
      return HeldFrame::kNone;
    }
    if (!previousFrameDone()) {
      return HeldFrame::kWaiting;
    }
    _hasHeldFrame = false;
    presentNow(present);
    return HeldFrame::kPresented;
  }

  /**
   The swapchain the frames went to is reconfigured or gone, and the held
   frame with it; the frame presented before it is not waited for either.
   */
  void dropFrames() {
    _hasHeldFrame = false;
    _previousFrame.reset();
  }

private:
  template <typename Present> void presentNow(Present &present) {
    present();
    switch (_hold) {
    case PresentHold::kNone:
      return;
    case PresentHold::kUntilPreviousFrameDone:
      _previousFrame = _gpu.track();
      return;
    }
  }

  bool previousFrameDone() {
    if (_previousFrame.has_value() && !_gpu.isDone(*_previousFrame)) {
      return false;
    }
    _previousFrame.reset();
    return true;
  }

  const PresentHold _hold;
  Gpu _gpu;
  bool _hasHeldFrame = false;
  // The GPU work of the frame presented last, until it is done.
  std::optional<Work> _previousFrame;
};

} // namespace RNSkia
