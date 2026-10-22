#pragma once

#include <optional>
#include <utility>

namespace RNSkia {

/** Whether a window holds a frame's present (see RNSkPresentHold). */
enum class PresentHold {
  /** Every frame is presented as soon as it is replayed. */
  kNone,
  /**
   A frame is presented once the GPU has finished the one before it, and at
   most one frame between two ticks.
   */
  kOncePerTickAfterPreviousFrame,
};

/** What RNSkPresentHold::presentHeldFrame() did. */
enum class HeldFrame {
  /** The window held no frame. */
  kNone,
  /** The held frame was presented. */
  kPresented,
  /**
   The GPU is still on the frame before it, the window presented a frame
   since the last tick, or the window has yet to take the frame presented
   before it: the frame stays held.
   */
  kWaiting,
};

/**
 * When a window presents the frames it replays, kept apart from Dawn so that
 * it can be tested on its own (RNSkWindowSurface is the one in use).
 *
 * On Android a present waits, on the thread that presents, until the GPU has
 * finished the frame presented before it: libgui's queueBuffer does, for every
 * Vulkan swapchain. And the window's buffer queue gives its compositor one
 * frame a vsync: a second frame presented in the same frame is replaced unseen
 * (a TextureView's window draws once a frame) or waits a vsync behind the first
 * (a SurfaceView). A window that latches on its draw (an Android TextureView
 * presented from a thread other than the window's) takes the next frame only
 * once it took the last (see setLatchesOnWindowDraw). Holding, a frame replayed
 * while the GPU is on the frame before it, after the window presented one
 * since the last tick, or before the window took the last one, has its work
 * submitted and its present held until a later call finds that frame done
 * after a tick and taken (see allowNextPresent, windowTookFrame); the window
 * takes no other frame meanwhile (see hasHeldFrame). `Gpu` tracks the work
 * submitted so far (`Work track()`) and says whether it is done, without
 * waiting (`bool isDone(const Work &)`).
 */
template <typename Gpu> class RNSkPresentHold {
public:
  using Work = typename Gpu::Work;

  RNSkPresentHold(PresentHold hold, Gpu gpu)
      : _hold(hold), _gpu(std::move(gpu)) {}

  /** Whether a replayed frame waits for its present. */
  bool hasHeldFrame() const { return _hasHeldFrame; }

  /**
   A frame of the display asked the window to present, or the view asks for
   none for now, so that its next frame starts a frame of its own: the window
   presents one frame again, once the GPU is done with the one before it.
   */
  void allowNextPresent() { _presentedSinceTick = false; }

  /**
   Whether a frame presented waits for the window to take it before the next
   one goes: an Android TextureView's window takes one frame a draw, and a
   frame presented before it took the last one replaces that frame unseen, or
   from Android 11 waits for a buffer only that draw gives back. Set with each
   window; a frame presented earlier is not waited for.
   */
  void setLatchesOnWindowDraw(bool latches) {
    _latchesOnWindowDraw = latches;
    _windowHasFrameToTake = false;
  }

  /** The window took the frame presented last: the next one may go. */
  void windowTookFrame() { _windowHasFrameToTake = false; }

  /**
   A frame was replayed: presents it through `present` now, or holds it if
   the GPU is still on the frame presented before it, the window presented
   one since the last tick, or the window has yet to take the last one.
   */
  template <typename Present> void presentOrHold(Present &&present) {
    if (!mayPresentNow()) {
      _hasHeldFrame = true;
      return;
    }
    presentNow(present);
  }

  /**
   Presents the held frame through `present` once the GPU has finished the
   frame before it, a tick allowed it and the window took that frame, without
   waiting for the GPU.
   */
  template <typename Present> HeldFrame presentHeldFrame(Present &&present) {
    if (!_hasHeldFrame) {
      return HeldFrame::kNone;
    }
    if (!mayPresentNow()) {
      return HeldFrame::kWaiting;
    }
    _hasHeldFrame = false;
    presentNow(present);
    return HeldFrame::kPresented;
  }

  /**
   The window is going away: presents the held frame through `present`
   whatever it waits for, so that the window takes back the image the frame
   was replayed into while it still can, then forgets the frames as
   dropFrames() does. Dawn destroys a swapchain it was detached from only once
   the GPU is done with it, after the window's buffer queue is gone, and an
   image still acquired then is cancelled into that queue. The present may
   wait for the GPU to finish the frame before it.
   */
  template <typename Present> void releaseFrames(Present &&present) {
    if (_hasHeldFrame) {
      present();
    }
    dropFrames();
  }

  /**
   The swapchain the frames went to is reconfigured or gone, and the held
   frame with it; the frame presented before it is not waited for, and the
   new swapchain has presented nothing yet.
   */
  void dropFrames() {
    _hasHeldFrame = false;
    _previousFrame.reset();
    _presentedSinceTick = false;
    _windowHasFrameToTake = false;
  }

private:
  bool mayPresentNow() {
    if (_windowHasFrameToTake) {
      return false;
    }
    switch (_hold) {
    case PresentHold::kNone:
      return true;
    case PresentHold::kOncePerTickAfterPreviousFrame:
      return !_presentedSinceTick && previousFrameDone();
    }
    return true;
  }

  template <typename Present> void presentNow(Present &present) {
    present();
    _windowHasFrameToTake = _latchesOnWindowDraw;
    switch (_hold) {
    case PresentHold::kNone:
      return;
    case PresentHold::kOncePerTickAfterPreviousFrame:
      _previousFrame = _gpu.track();
      _presentedSinceTick = true;
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
  // Whether the window presented a frame since the last tick allowed one.
  bool _presentedSinceTick = false;
  // Whether a frame presented waits for the window to take it, and whether
  // the window has yet to take the one presented last.
  bool _latchesOnWindowDraw = false;
  bool _windowHasFrameToTake = false;
};

} // namespace RNSkia
