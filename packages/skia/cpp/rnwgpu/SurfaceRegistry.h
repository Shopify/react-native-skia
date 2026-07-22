#pragma once

#include <algorithm>
#include <functional>
#include <memory>
#include <mutex>
#include <shared_mutex>
#include <stdexcept>
#include <unordered_map>
#include <utility>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#ifdef __APPLE__
#include "rnskia/RNMetalLayerColorSpace.h"

namespace dawn::native::metal {
void WaitForCommandsToBeScheduled(WGPUDevice device);
} // namespace dawn::native::metal
#endif

namespace rnwgpu {

struct NativeInfo {
  void *nativeSurface;
  int width;
  int height;
};

struct Size {
  int width;
  int height;
};

// Invoked with the platform's native surface pointer once SurfaceInfo is done
// with it, so the platform can drop the reference it acquired on our behalf
// (ANativeWindow_release on Android, CFBridgingRelease of the retained
// CAMetalLayer on Apple platforms). May run on any thread.
using NativeSurfaceReleaser = std::function<void(void *)>;

// Bridges the asynchronous native surface lifecycle (surfaces appear and
// disappear on the platform UI thread) with the synchronous WebGPU canvas API
// (the JS render loop must always be able to acquire a texture).
//
// Ownership & threading model:
// - A registry entry is created on first use (by whichever of JS/native gets
//   there first) and lives exactly as long as its JS Canvas: contextIds are
//   never reused. It is removed by the native view's teardown (WebGPUMetalView
//   dealloc / WebGPUViewManager.onDropViewInstance) when a surface is
//   attached, or by RNWebGPU.destroyContext (the Canvas unmount cleanup) when
//   none ever was — see RNWebGPU::destroyContext for why the split. Surface
//   destruction alone (backgrounding, TextureView teardown) never removes an
//   entry; it only detaches the surface.
// - Attaching a surface is LATCHED: the UI thread stores it as pending
//   (attachSurface) and it is adopted at the next frame boundary — start of
//   getCurrentTexture or end of presentFrame — on whichever thread renders
//   (main JS, Reanimated UI, or a worklet runtime). This preserves Dawn
//   surface thread-affinity and guarantees a surface is never swapped in the
//   middle of a frame. For contexts that are not actively rendering, the
//   platform view schedules applyPendingAttach on the JS thread instead (see
//   flushPendingSurfaceTransition in WebGPUMetalView / JniWebGPUView).
// - Detaching (switchToOffscreen) is IMMEDIATE, because the platform destroys
//   the surface as soon as its callback returns. A configured context falls
//   back to rendering into an offscreen texture, so a running render loop
//   keeps working; the in-flight frame, if any, is dropped at present(). When
//   a new surface attaches, the latest offscreen frame is blitted onto it so
//   content appears without waiting for the next render — the same mechanism
//   that gives a fast time-to-first-frame when rendering starts before the
//   native surface exists.
class SurfaceInfo {
public:
  SurfaceInfo(wgpu::Instance gpu, int width, int height)
      : _gpu(std::move(gpu)), _width(width), _height(height) {}

  ~SurfaceInfo() {
    // Drop the Dawn objects before releasing the native surfaces they borrow.
    _surface = nullptr;
    _pendingSurface = nullptr;
    _texture = nullptr;
    if (_pendingReleaser && _pendingNativeSurface) {
      _pendingReleaser(_pendingNativeSurface);
    }
    if (_releaser && _nativeSurface) {
      _releaser(_nativeSurface);
    }
  }

  // --- Platform UI thread ---------------------------------------------------

  // Store a newly created on-screen surface. It becomes active at the next
  // frame boundary (applyPendingAttach); callers should follow up with
  // flushPendingSurfaceTransition so contexts that are not currently rendering
  // also pick it up.
  void attachSurface(void *nativeSurface, wgpu::Surface surface,
                     NativeSurfaceReleaser releaser) {
    void *replacedSurface = nullptr;
    NativeSurfaceReleaser replacedReleaser;
    {
      std::unique_lock<std::shared_mutex> lock(_mutex);
      if (_hasPendingAttach) {
        // Replaced before it was ever adopted.
        replacedSurface = _pendingNativeSurface;
        replacedReleaser = std::move(_pendingReleaser);
      }
      _hasPendingAttach = true;
      _pendingNativeSurface = nativeSurface;
      _pendingSurface = std::move(surface);
      _pendingReleaser = std::move(releaser);
    }
    if (replacedReleaser && replacedSurface) {
      replacedReleaser(replacedSurface);
    }
  }

  // The platform surface is being destroyed: detach immediately. If the
  // context is configured, rendering continues into an offscreen texture whose
  // content is blitted to the next attached surface; present() no-ops until
  // then. Safe to call when already offscreen.
  void switchToOffscreen() { detach(/* createFallbackTexture = */ true); }

  // Detach without creating the offscreen fallback: used when the context is
  // being destroyed and nothing will consume further frames.
  void detachSurface() { detach(/* createFallbackTexture = */ false); }

  // Reflects native view layout changes. Does not resize the drawing buffer:
  // that tracks canvas.width/height (like on the web), see
  // GPUCanvasContext::getCurrentTexture.
  void resize(int newWidth, int newHeight) {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    _width = newWidth;
    _height = newHeight;
  }

  // --- Frame boundary (rendering thread, or the JS thread via
  // flushPendingSurfaceTransition) -------------------------------------------

  // Adopt a pending surface if no frame is in flight: configure it and, if
  // frames were rendered offscreen, blit the most recent one onto it and
  // present it, so content shows up without waiting for the render loop.
  // Safe to call from any thread; no-ops when there is nothing pending.
  //
  // supersedeInFlightFrame is set by the rendering thread when it starts a new
  // frame: a previous frame that never presented is abandoned and must not
  // block adoption. The flush path (other threads) leaves it false so it never
  // swaps the surface under a frame that is genuinely in flight.
  void applyPendingAttach(bool supersedeInFlightFrame = false) {
    bool presentBlit = false;
    uint64_t blitEpoch = 0;
    wgpu::Device device = nullptr;
    void *replacedSurface = nullptr;
    NativeSurfaceReleaser replacedReleaser;
    {
      std::unique_lock<std::shared_mutex> lock(_mutex);
      if (supersedeInFlightFrame) {
        _frameInFlight = false;
        _acquiredFromSurface = false;
      }
      if (!_hasPendingAttach || _frameInFlight) {
        return;
      }
      // Attach over attach without a detach in between: replace. Ownership
      // tracks the native window pointer, not the Dawn surface handle (which
      // can be null if surface creation failed).
      replacedSurface = _nativeSurface;
      replacedReleaser = std::move(_releaser);
      _surface = std::move(_pendingSurface);
      _nativeSurface = _pendingNativeSurface;
      _releaser = std::move(_pendingReleaser);
      _hasPendingAttach = false;
      _pendingNativeSurface = nullptr;
      _frameEpoch++;

      // _surface can be null here when Dawn surface creation failed for a
      // valid native window; the context then just keeps rendering offscreen.
      if (_config.device != nullptr && _surface) {
        bool blit = _texture != nullptr;
        // The blit needs CopyDst on the surface. Configure with a widened
        // copy while keeping _config at the usage the user asked for, so any
        // later reconfigure drops the extra flag again.
        wgpu::SurfaceConfiguration config = _config;
        if (blit) {
          config.usage |= wgpu::TextureUsage::CopyDst;
        }
        _surface.Configure(&config);
#ifdef __APPLE__
        RNSkia::applyCAMetalLayerColorSpace(_nativeSurface, _config.format);
#endif
        if (blit) {
          presentBlit = blitOffscreenToSurfaceLocked();
          device = _config.device;
          // Consumed either way; on failure the next frame renders fresh.
          _texture = nullptr;
          blitEpoch = _frameEpoch;
        }
      }
    }
    if (replacedReleaser && replacedSurface) {
      replacedReleaser(replacedSurface);
    }
    if (presentBlit) {
#ifdef __APPLE__
      if (device) {
        dawn::native::metal::WaitForCommandsToBeScheduled(device.Get());
      }
#endif
      std::unique_lock<std::shared_mutex> lock(_mutex);
      // Present only if the blitted texture is still the surface's current
      // one. The epoch changes on any acquire, present, configure, detach, or
      // adoption, so a frame that started - even one that already completed -
      // or any other transition while we were unlocked skips this present
      // (their newer content stands; presenting here would be a Dawn
      // present-without-acquire error).
      if (_surface && !_frameInFlight && _frameEpoch == blitEpoch) {
        _surface.Present();
      }
    }
  }

  // --- Rendering thread
  // -------------------------------------------------------

  void configure(wgpu::SurfaceConfiguration &newConfig,
                 std::vector<wgpu::TextureFormat> viewFormats) {
    applyPendingAttach(/* supersedeInFlightFrame = */ true);
    std::unique_lock<std::shared_mutex> lock(_mutex);
    _viewFormats = std::move(viewFormats);
    _config = newConfig;
    // The caller's viewFormats storage dies with the call; point the stored
    // configuration at our own copy.
    _config.viewFormats = _viewFormats.empty() ? nullptr : _viewFormats.data();
    _config.viewFormatCount = _viewFormats.size();
    // The drawing buffer starts at the canvas size. Clamp so a canvas that has
    // not been laid out yet (0x0) configures instead of erroring.
    _config.width = std::max(1, _width);
    _config.height = std::max(1, _height);
    _config.presentMode = wgpu::PresentMode::Fifo;
    _texture = nullptr;
    _frameEpoch++;
    _configureLocked();
  }

  // Resize the drawing buffer (canvas.width/height changed).
  void reconfigure(int newWidth, int newHeight) {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    if (_config.device == nullptr) {
      return;
    }
    _config.width = std::max(1, newWidth);
    _config.height = std::max(1, newHeight);
    _texture = nullptr;
    _frameEpoch++;
    _configureLocked();
  }

  void unconfigure() {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    if (_surface) {
      _surface.Unconfigure();
    }
    _texture = nullptr;
    _config = {};
    _viewFormats.clear();
    _acquiredFromSurface = false;
    _frameEpoch++;
  }

  bool isConfigured() {
    std::shared_lock<std::shared_mutex> lock(_mutex);
    return _config.device != nullptr;
  }

  // True while a native view owns a surface for this context (attached or
  // pending adoption). Used to decide which side retires the registry entry:
  // the native view's teardown when a surface exists, the JS Canvas cleanup
  // otherwise (see RNWebGPU::destroyContext).
  bool hasNativeSurface() {
    std::shared_lock<std::shared_mutex> lock(_mutex);
    return _nativeSurface != nullptr || _hasPendingAttach;
  }

  // Returns the texture for the current frame: the surface's swapchain texture
  // when a surface is attached and healthy, an offscreen texture otherwise.
  // Never returns null; throws when called before configure().
  wgpu::Texture getCurrentTexture() {
    // Start-of-frame boundary; a new acquire supersedes any previous frame
    // that never presented.
    applyPendingAttach(/* supersedeInFlightFrame = */ true);
    std::unique_lock<std::shared_mutex> lock(_mutex);
    if (_config.device == nullptr) {
      throw std::runtime_error(
          "[WebGPU] getCurrentTexture() called on a canvas context that is "
          "not configured; call context.configure() first");
    }
    _frameInFlight = true;
    _acquiredFromSurface = false;
    _frameEpoch++;
    if (_surface) {
      auto texture = acquireSurfaceTextureLocked();
      if (texture) {
        _acquiredFromSurface = true;
        return texture;
      }
      // The surface is transiently unusable (e.g. mid-resize, lost while
      // backgrounding): fall back to an offscreen texture so the render loop
      // survives; this frame is simply not presented.
    }
    if (!_texture) {
      _texture = createOffscreenTextureLocked();
    }
    return _texture;
  }

  // Present the current frame. Runs synchronously on the thread that did
  // getCurrentTexture/submit (main JS, Reanimated UI, or a worklet runtime),
  // preserving Dawn surface thread-affinity. Frames whose texture was not
  // acquired from the attached surface (offscreen, detached mid-frame, or
  // acquire failure) are dropped. This is also the end-of-frame boundary: it
  // adopts a surface that attached while the frame was in flight.
  void presentFrame() {
#ifdef __APPLE__
    // Ensure command buffers are scheduled before presenting. Read the device
    // under a shared lock, then wait without holding it (the wait can block).
    wgpu::Device device;
    {
      std::shared_lock<std::shared_mutex> lock(_mutex);
      device = _config.device;
    }
    if (device) {
      dawn::native::metal::WaitForCommandsToBeScheduled(device.Get());
    }
#endif
    {
      std::unique_lock<std::shared_mutex> lock(_mutex);
      if (_surface && _acquiredFromSurface) {
        _surface.Present();
      }
      _acquiredFromSurface = false;
      _frameInFlight = false;
      _frameEpoch++;
    }
    applyPendingAttach();
  }

  NativeInfo getNativeInfo() {
    std::shared_lock<std::shared_mutex> lock(_mutex);
    // A surface that is still pending adoption is the one callers should see.
    void *native = _hasPendingAttach ? _pendingNativeSurface : _nativeSurface;
    return {.nativeSurface = native, .width = _width, .height = _height};
  }

  Size getSize() {
    std::shared_lock<std::shared_mutex> lock(_mutex);
    return {.width = _width, .height = _height};
  }

  wgpu::SurfaceConfiguration getConfig() {
    std::shared_lock<std::shared_mutex> lock(_mutex);
    return _config;
  }

private:
  void detach(bool createFallbackTexture) {
    void *releasedSurfaces[2] = {nullptr, nullptr};
    NativeSurfaceReleaser releasers[2];
    {
      std::unique_lock<std::shared_mutex> lock(_mutex);
      // The platform is tearing surfaces down; a not-yet-adopted attach is
      // stale, cancel it.
      if (_hasPendingAttach) {
        _hasPendingAttach = false;
        _pendingSurface = nullptr;
        releasedSurfaces[0] = _pendingNativeSurface;
        releasers[0] = std::move(_pendingReleaser);
        _pendingNativeSurface = nullptr;
      }
      if (_surface) {
        if (createFallbackTexture && _config.device != nullptr) {
          _texture = createOffscreenTextureLocked();
        }
        _surface = nullptr;
        // The in-flight frame (if any) rendered into the destroyed surface;
        // presentFrame() must not present it.
        _acquiredFromSurface = false;
      }
      _frameEpoch++;
      // Window ownership is independent of the Dawn surface handle (which can
      // be null if surface creation failed): always return the window.
      releasedSurfaces[1] = _nativeSurface;
      releasers[1] = std::move(_releaser);
      _nativeSurface = nullptr;
    }
    // Release outside the lock: the platform may do real work here.
    for (int i = 0; i < 2; i++) {
      if (releasers[i] && releasedSurfaces[i]) {
        releasers[i](releasedSurfaces[i]);
      }
    }
  }

  // All *Locked helpers below require _mutex to be held exclusively.

  wgpu::Texture createOffscreenTextureLocked() {
    wgpu::TextureDescriptor descriptor;
    // Union with the user's usage so offscreen frames stay compatible with
    // whatever they configured (e.g. CopySrc readbacks). RenderAttachment |
    // CopySrc | TextureBinding is what the fallback itself needs (rendering,
    // the attach blit, sampling).
    descriptor.usage = _config.usage | wgpu::TextureUsage::RenderAttachment |
                       wgpu::TextureUsage::CopySrc |
                       wgpu::TextureUsage::TextureBinding;
    descriptor.format = _config.format;
    descriptor.size.width = std::max(1u, _config.width);
    descriptor.size.height = std::max(1u, _config.height);
    descriptor.viewFormats = _config.viewFormats;
    descriptor.viewFormatCount = _config.viewFormatCount;
    return _config.device.CreateTexture(&descriptor);
  }

  // Acquire the surface's current texture, reconfiguring once when the surface
  // reports it is stale (rotation, resize, coming back from background).
  wgpu::Texture acquireSurfaceTextureLocked() {
    wgpu::SurfaceTexture surfaceTexture;
    _surface.GetCurrentTexture(&surfaceTexture);
    if (!isAcquireSuccess(surfaceTexture)) {
      if (surfaceTexture.status ==
          wgpu::SurfaceGetCurrentTextureStatus::Error) {
        return nullptr;
      }
      _surface.Configure(&_config);
      _surface.GetCurrentTexture(&surfaceTexture);
      if (!isAcquireSuccess(surfaceTexture)) {
        return nullptr;
      }
    }
    return surfaceTexture.texture;
  }

  static bool isAcquireSuccess(const wgpu::SurfaceTexture &surfaceTexture) {
    return (surfaceTexture.status ==
                wgpu::SurfaceGetCurrentTextureStatus::SuccessOptimal ||
            surfaceTexture.status ==
                wgpu::SurfaceGetCurrentTextureStatus::SuccessSuboptimal) &&
           surfaceTexture.texture != nullptr;
  }

  // Copy the last offscreen frame onto the freshly attached surface. Returns
  // true when the copy was submitted and the surface should be presented.
  bool blitOffscreenToSurfaceLocked() {
    wgpu::SurfaceTexture surfaceTexture;
    _surface.GetCurrentTexture(&surfaceTexture);
    if (!isAcquireSuccess(surfaceTexture)) {
      return false;
    }

    wgpu::TexelCopyTextureInfo source = {};
    source.texture = _texture;
    wgpu::TexelCopyTextureInfo destination = {};
    destination.texture = surfaceTexture.texture;

    // The offscreen frame and the new surface can disagree on size (e.g. the
    // device rotated while detached); copy the shared region.
    wgpu::Extent3D size = {
        std::min(_texture.GetWidth(), surfaceTexture.texture.GetWidth()),
        std::min(_texture.GetHeight(), surfaceTexture.texture.GetHeight()), 1};

    wgpu::CommandEncoderDescriptor encoderDescriptor;
    wgpu::CommandEncoder encoder =
        _config.device.CreateCommandEncoder(&encoderDescriptor);
    encoder.CopyTextureToTexture(&source, &destination, &size);
    wgpu::CommandBuffer commands = encoder.Finish();
    _config.device.GetQueue().Submit(1, &commands);
    return true;
  }

  void _configureLocked() {
    if (_surface) {
      _surface.Configure(&_config);
#ifdef __APPLE__
      RNSkia::applyCAMetalLayerColorSpace(_nativeSurface, _config.format);
#endif
    } else {
      _texture = createOffscreenTextureLocked();
    }
  }

  mutable std::shared_mutex _mutex;
  // Attached on-screen surface (null while offscreen).
  void *_nativeSurface = nullptr;
  wgpu::Surface _surface = nullptr;
  NativeSurfaceReleaser _releaser;
  // Offscreen fallback drawing buffer.
  wgpu::Texture _texture = nullptr;
  // Surface attached by the UI thread, awaiting adoption at a frame boundary.
  bool _hasPendingAttach = false;
  void *_pendingNativeSurface = nullptr;
  wgpu::Surface _pendingSurface = nullptr;
  NativeSurfaceReleaser _pendingReleaser;
  // Frame state: set by getCurrentTexture, cleared by presentFrame.
  bool _frameInFlight = false;
  bool _acquiredFromSurface = false;
  // Bumped on every acquire, present, configure/reconfigure/unconfigure,
  // adoption, and detach. The deferred blit-present in applyPendingAttach
  // revalidates against it so it never presents a texture that stopped being
  // the surface's current one while the lock was released.
  uint64_t _frameEpoch = 0;
  // device == nullptr means "not configured". _viewFormats owns the storage
  // that _config.viewFormats points at.
  wgpu::SurfaceConfiguration _config;
  std::vector<wgpu::TextureFormat> _viewFormats;
  // Keeps the Dawn instance alive for as long as any canvas exists.
  wgpu::Instance _gpu;
  // Native view size in dp (surfaced as clientWidth/clientHeight on the JS
  // canvas).
  int _width;
  int _height;
};

class SurfaceRegistry {
public:
  static SurfaceRegistry &getInstance() {
    static SurfaceRegistry instance;
    return instance;
  }

  SurfaceRegistry(const SurfaceRegistry &) = delete;
  SurfaceRegistry &operator=(const SurfaceRegistry &) = delete;

  std::shared_ptr<SurfaceInfo> getSurfaceInfo(int id) {
    std::shared_lock<std::shared_mutex> lock(_mutex);
    auto it = _registry.find(id);
    if (it != _registry.end()) {
      return it->second;
    }
    return nullptr;
  }

  void removeSurfaceInfo(int id) {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    _registry.erase(id);
  }

  std::shared_ptr<SurfaceInfo>
  getSurfaceInfoOrCreate(int id, wgpu::Instance gpu, int width, int height) {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    return getSurfaceInfoOrCreateLocked(id, gpu, width, height);
  }

  // Find-or-create + attach as one atomic step under the registry lock, so it
  // serializes with removeSurfaceInfoIfDetached: an attach can never land on
  // an entry that a concurrent destroyContext is erasing (it either marks the
  // entry attached before the check, or re-creates the entry after the
  // erase). Lock order is registry -> SurfaceInfo, matching every other path.
  std::shared_ptr<SurfaceInfo> attachSurface(int id, wgpu::Instance gpu,
                                             int width, int height,
                                             void *nativeSurface,
                                             wgpu::Surface surface,
                                             NativeSurfaceReleaser releaser) {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    auto info = getSurfaceInfoOrCreateLocked(id, gpu, width, height);
    info->attachSurface(nativeSurface, std::move(surface), std::move(releaser));
    return info;
  }

  // Erase the entry only if no native surface is attached or pending; the
  // atomic counterpart of attachSurface above (see RNWebGPU::destroyContext
  // for the ownership split this implements).
  void removeSurfaceInfoIfDetached(int id) {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    auto it = _registry.find(id);
    if (it == _registry.end() || it->second->hasNativeSurface()) {
      return;
    }
    _registry.erase(it);
  }

  // Drops all entries. Called when the RN instance tears down (dev reload):
  // JS context ids restart from scratch, so surviving entries would alias new
  // canvases onto dead surfaces.
  void clear() {
    std::unique_lock<std::shared_mutex> lock(_mutex);
    _registry.clear();
  }

private:
  SurfaceRegistry() = default;

  std::shared_ptr<SurfaceInfo> getSurfaceInfoOrCreateLocked(int id,
                                                            wgpu::Instance gpu,
                                                            int width,
                                                            int height) {
    auto it = _registry.find(id);
    if (it != _registry.end()) {
      return it->second;
    }
    auto info = std::make_shared<SurfaceInfo>(gpu, width, height);
    _registry[id] = info;
    return info;
  }

  mutable std::shared_mutex _mutex;
  std::unordered_map<int, std::shared_ptr<SurfaceInfo>> _registry;
};

} // namespace rnwgpu
