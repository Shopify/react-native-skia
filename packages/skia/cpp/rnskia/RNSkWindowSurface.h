#pragma once

#include <functional>
#include <mutex>
#include <utility>
#include <vector>

#include "RNSkGraphiteTargetInfo.h"
#include "RNSkPresentHold.h"
#include "RNSkSurface.h"

#include "webgpu/webgpu_cpp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkColorType.h"
#include "include/core/SkImage.h"
#include "include/gpu/graphite/Recorder.h"
#include "include/gpu/graphite/Recording.h"

#pragma clang diagnostic pop

namespace RNSkia {

/**
 * The window a platform view presents into: a CAMetalLayer on Apple
 * platforms, an ANativeWindow on Android, configured as a Dawn surface. The
 * platform view only acquires the native handle and forwards its lifecycle
 * (attach, resize, detach); everything else lives here.
 *
 * Threading: the window is attached, resized, detached and presented on the
 * present thread (RNSkPlatformContext::runOnPresentThread). The description
 * of its target texture is kept in a copy of
 * its own, so that whoever records for the view (the JS thread, a worklet
 * runtime, the render thread pool) can read it from any thread, also before
 * the window exists (see getLayoutSize).
 */
class RNSkWindowSurface final : public RNSkSurface {
public:
  /**
   Gives back the native handle attach() was given, once the Dawn surface
   over it is gone. Called from detach() or the destructor, so on any thread.
   */
  using Releaser = std::function<void(void *nativeHandle)>;

  /**
   The platform view chooses whether the window holds a frame's present for
   the GPU (see RNSkPresentHold).
   */
  explicit RNSkWindowSurface(PresentHold presentHold);

  ~RNSkWindowSurface() override;

  RNSkWindowSurface(const RNSkWindowSurface &) = delete;
  RNSkWindowSurface &operator=(const RNSkWindowSurface &) = delete;

  /**
   Configures the native window (a CAMetalLayer or an ANativeWindow) as the
   Dawn surface of this view, at the given size in pixels. A window already
   attached is detached first. highBitDepth asks for the 16-bit float (Apple)
   or 10-bit (Android) format, granted when the surface supports it;
   useP3ColorSpace renders in Display P3 rather than sRGB. The releaser, if
   any, gives the handle back when the window is detached. Requests a redraw.
   */
  void attach(void *nativeHandle, int width, int height, bool highBitDepth,
              bool useP3ColorSpace, Releaser releaser);

  /** Reconfigures the surface for a new size, in pixels. Requests a redraw. */
  void resize(int width, int height);

  /**
   Presents the frame the window holds, destroys the Dawn surface and gives
   the native handle back to its releaser. The target description goes away
   with it; the layout size stays.
   */
  void detach();

  /**
   Whether a window is attached. Its Dawn surface may be away for a frame
   while the GPU device is replaced (see ensureDevice). Present thread.
   */
  bool isAttached() const { return _nativeHandle != nullptr; }

  /**
   The pixel size the platform laid the view out with, which the window gets
   when it appears. Any thread.
   */
  void setLayoutSize(int width, int height);

  /**
   The size in pixels the surface will have, known from the platform layout
   before the surface itself exists (on Android the surface only appears a
   frame after the view is laid out). Safe to call from any thread; returns
   false until the view is laid out. A frame recorded against this size is
   presented as is once the surface appears, where one recorded against a
   size derived from the layout in points could be off by a pixel and would
   not cover the surface.
   */
  bool getLayoutSize(int *width, int *height);

  /**
   The bit depth the platform view will attach the window with, known before
   it does: on Android the one of the backing view, chosen when the canvas
   mounts (see SkiaView.updateView); on Apple platforms the prop. Any thread.
   */
  void setHighBitDepth(bool highBitDepth);

  /**
   Whether the window renders with more than 8 bits per channel: as it was
   last attached (what the surface granted, which a window keeps), else as the
   platform view said it would be (see setHighBitDepth). Returns false until
   either is known. Any thread.
   */
  bool getHighBitDepth(bool *highBitDepth);

  /**
   Installed by the view owning the surface: asks it for a frame when the
   window appears or changes size.
   */
  void setRequestRedraw(std::function<void()> requestRedraw) {
    _requestRedraw = std::move(requestRedraw);
  }

  /**
   Installed by the platform view: whether the window can take a frame right
   now (not while the app is in the background). The view presents nothing
   while it returns false, and asks again once told that it can (see
   RNSkView::onCanPresent). Without one, an attached window always can.
   */
  void setCanPresent(std::function<bool()> canPresent) {
    _canPresent = std::move(canPresent);
  }

  /**
   Whether a window is attached and can show a frame right now: not while
   the platform view says it cannot, nor once the GPU device is lost.
   */
  bool canPresent();

  /**
   Installed by the platform view: called after each frame the window
   presents, on the thread that presented it.
   */
  void setDidPresent(std::function<void()> didPresent) {
    _didPresent = std::move(didPresent);
  }

  /**
   Presents the frame the window holds once the GPU has finished the frame
   presented before it, a tick allowed it (see allowNextPresent) and the
   window took that frame (see windowTookFrame), without waiting for the GPU.
   A frame held on a device replaced since is dropped with the surface it was
   replayed into, which is made again on the device in use (see
   ensureDevice). Present thread.
   */
  HeldFrame presentHeldFrame();

  /**
   Whether a frame presented waits for the window to take it before the next
   goes, set by the platform view with each window (see
   RNSkPresentHold::setLatchesOnWindowDraw). Present thread.
   */
  void setLatchesOnWindowDraw(bool latches) {
    _presentHold.setLatchesOnWindowDraw(latches);
  }

  /**
   The window took the frame presented last: the frame it holds may go (see
   presentHeldFrame). Present thread.
   */
  void windowTookFrame() { _presentHold.windowTookFrame(); }

  /**
   Whether the window holds a frame: it takes no other frame meanwhile.
   Present thread.
   */
  bool hasHeldFrame() const { return _presentHold.hasHeldFrame(); }

  /**
   A frame of the display asked the view to present, or the view asks for no
   more frames for now: the window presents one frame again (see
   RNSkPresentHold::allowNextPresent). Present thread.
   */
  void allowNextPresent() { _presentHold.allowNextPresent(); }

  // RNSkSurface -------------------------------------------------------------

  /** Width of the window, in pixels; 0 without a window. Any thread. */
  int getWidth() override;

  /** Height of the window, in pixels; 0 without a window. Any thread. */
  int getHeight() override;

  bool getTargetInfo(RNSkGraphiteTargetInfo *info) override;

  bool presentRecordings(
      const std::vector<skgpu::graphite::Recording *> &recordings) override;

  bool presentImage(const sk_sp<SkImage> &image) override;

private:
  // Configures the window on the GPU device in use when the one it was
  // configured on was lost and replaced since (see DawnContext): the Dawn
  // surface is made again on the new device, the window itself stays.
  // Returns false without a context or a surface. Present thread.
  bool ensureDevice();
  // Lets go of the Dawn surface of every window configured on the given
  // generation, before its device is destroyed (see ensureDevice). The
  // windows keep their target description and get a surface again on their
  // next frame. Present thread.
  static void releaseSurfacesOn(uint64_t generation);
  // The window's Dawn surface, or none. A frame held for the surface it
  // replaces goes with that surface: nothing can present it anymore.
  void replaceSurface(wgpu::Surface surface) {
    _presentHold.dropFrames();
    _surface = std::move(surface);
  }
  // Configures the swapchain for the current size, format and usage, the
  // frame it holds presented first (see RNSkPresentHold::releaseFrames).
  void configureSurface();
  // Copies the window's target description where any thread can read it.
  void updateTargetInfo();
  // Graphite needs more than RenderAttachment on the swapchain texture:
  // TextureBinding so a render pass can reload the existing contents through
  // LoadOp::ExpandResolveTexture (any backdrop filter or mid-frame readback
  // splits the pass), and CopySrc for copy tasks. Only request what the
  // surface reports as supported.
  wgpu::TextureUsage supportedSurfaceUsage();
  bool surfaceSupportsFormat(wgpu::TextureFormat format);
  // The texture description a deferred canvas must be recorded with to be
  // replayed onto this window.
  skgpu::graphite::TextureInfo getTextureInfo() const;
  void requestRedraw() {
    if (_requestRedraw) {
      _requestRedraw();
    }
  }
  void didPresent() {
    if (_didPresent) {
      _didPresent();
    }
  }
  // Whether the window takes a frame now: it can present, and holds none.
  bool takesFrame() { return canPresent() && !_presentHold.hasHeldFrame(); }
  // Presents the frame replayed last.
  void presentNow();

  // The GPU as RNSkPresentHold asks about it: the work given to Dawn's queue.
  struct DawnQueue {
    using Work = wgpu::Future;
    Work track();
    bool isDone(const Work &work);
  };

  // The device the window is configured on, and its generation (see
  // DawnContext::generation()): a lost device is replaced, and the window
  // configured again on the new one (see ensureDevice). The surface is null
  // between the two, and while the window is detached.
  wgpu::Device _device;
  uint64_t _generation = 0;
  wgpu::Surface _surface;
  // The recorder of the thread the window is attached on (the present thread):
  // presentImage() draws on it, presentRecordings() only wraps the swapchain
  // texture for it.
  skgpu::graphite::Recorder *_recorder = nullptr;
  void *_nativeHandle = nullptr;
  Releaser _releaser;
  int _width = 0;
  int _height = 0;
  wgpu::TextureFormat _format = wgpu::TextureFormat::Undefined;
  wgpu::TextureUsage _usage = wgpu::TextureUsage::RenderAttachment;
  SkColorType _colorType = kUnknown_SkColorType;
  bool _useP3ColorSpace = false;

  // A copy of the window's target description, readable from any thread
  // while the window itself belongs to the present thread.
  std::mutex _targetInfoMutex;
  RNSkGraphiteTargetInfo _targetInfo;
  bool _hasTargetInfo = false;
  int _layoutWidth = 0;
  int _layoutHeight = 0;
  // The bit depth the window has, or will have (see getHighBitDepth).
  bool _knownHighBitDepth = false;
  bool _hasKnownHighBitDepth = false;

  std::function<void()> _requestRedraw;
  std::function<bool()> _canPresent;
  std::function<void()> _didPresent;
  // Present thread.
  RNSkPresentHold<DawnQueue> _presentHold;
};

} // namespace RNSkia
