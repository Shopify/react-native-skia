#include "RNSkWindowSurface.h"

#include <algorithm>

#include "RNDawnContext.h"
#include "RNDawnUtils.h"
#include "RNMetalLayerColorSpace.h"
#include "utils/RNSkLog.h"

#ifdef __APPLE__
#include "dawn/native/MetalBackend.h"
#endif

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkSurface.h"
#include "include/gpu/graphite/BackendTexture.h"
#include "include/gpu/graphite/Surface.h"
#include "include/gpu/graphite/dawn/DawnGraphiteTypes.h"
#include "include/gpu/graphite/dawn/DawnTypes.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace {

// The windows alive, so that every surface made on a lost GPU device can be
// let go of at once before the device is destroyed (see
// RNSkWindowSurface::ensureDevice). Windows live on the present thread (see
// RNSkPlatformContext::runOnPresentThread); the mutex only guards the list
// itself.
std::mutex &windowsMutex() {
  static std::mutex mutex;
  return mutex;
}

std::vector<RNSkWindowSurface *> &windows() {
  static std::vector<RNSkWindowSurface *> list;
  return list;
}

} // namespace

RNSkWindowSurface::RNSkWindowSurface(PresentHold presentHold)
    : _presentHold(presentHold, DawnQueue()) {
  std::lock_guard<std::mutex> lock(windowsMutex());
  windows().push_back(this);
}

RNSkWindowSurface::~RNSkWindowSurface() {
  // Out of the list before letting go of the surface: the destructor may run
  // on any thread, and the list is swept on the present thread (see
  // releaseSurfacesOn).
  {
    std::lock_guard<std::mutex> lock(windowsMutex());
    auto &list = windows();
    list.erase(std::remove(list.begin(), list.end(), this), list.end());
  }
  detach();
}

void RNSkWindowSurface::attach(void *nativeHandle, int width, int height,
                               bool highBitDepth, bool useP3ColorSpace,
                               Releaser releaser) {
  detach();
  _nativeHandle = nativeHandle;
  _releaser = std::move(releaser);
  // Called from the platform view (Java or Objective-C), where an exception
  // would take the process down: without a GPU (reported when the module was
  // installed, see DawnContext::getGpuInfo) the window is given back and the
  // view stays blank.
  auto *context = DawnContext::tryGetInstance();
  if (context == nullptr) {
    detach();
    return;
  }
  _device = context->getWGPUDevice();
  _generation = DawnContext::generation();
  _recorder = context->getRecorder();
  replaceSurface(context->MakeWGPUSurface(nativeHandle));
  if (!_surface) {
    RNSkLogger::logToConsole("Could not create a surface over the window");
    detach();
    return;
  }
  _width = width;
  _height = height;
  _useP3ColorSpace = useP3ColorSpace;
  _format = DawnUtils::PreferredTextureFormat;
  _colorType = DawnUtils::PreferedColorType;
  if (highBitDepth) {
    if (surfaceSupportsFormat(DawnUtils::HighBitDepthTextureFormat)) {
      _format = DawnUtils::HighBitDepthTextureFormat;
      _colorType = DawnUtils::HighBitDepthColorType;
    } else {
      RNSkLogger::logToConsole(
          "High bit depth was requested but the surface does not support "
          "it, falling back to the 8-bit format");
    }
  }
  configureSurface();
  updateTargetInfo();
  requestRedraw();
}

void RNSkWindowSurface::resize(int width, int height) {
  if (_nativeHandle == nullptr) {
    return;
  }
  _width = width;
  _height = height;
  // A surface on a replaced device is made again at this size on the next
  // frame (see ensureDevice) rather than configured on a device that is gone.
  if (_surface && _generation == DawnContext::generation()) {
    configureSurface();
  }
  updateTargetInfo();
  requestRedraw();
}

void RNSkWindowSurface::detach() {
  // The surface goes before the window it draws into, and the frame it holds
  // goes to the window first (see RNSkPresentHold::releaseFrames).
  _presentHold.releaseFrames([this]() { _surface.Present(); });
  replaceSurface(nullptr);
  _recorder = nullptr;
  updateTargetInfo();
  if (_releaser && _nativeHandle != nullptr) {
    _releaser(_nativeHandle);
  }
  _releaser = nullptr;
  _nativeHandle = nullptr;
}

void RNSkWindowSurface::setLayoutSize(int width, int height) {
  std::lock_guard<std::mutex> lock(_targetInfoMutex);
  _layoutWidth = width;
  _layoutHeight = height;
}

bool RNSkWindowSurface::getLayoutSize(int *width, int *height) {
  std::lock_guard<std::mutex> lock(_targetInfoMutex);
  if (_layoutWidth <= 0 || _layoutHeight <= 0) {
    return false;
  }
  *width = _layoutWidth;
  *height = _layoutHeight;
  return true;
}

int RNSkWindowSurface::getWidth() {
  std::lock_guard<std::mutex> lock(_targetInfoMutex);
  return _hasTargetInfo ? _targetInfo.width : 0;
}

int RNSkWindowSurface::getHeight() {
  std::lock_guard<std::mutex> lock(_targetInfoMutex);
  return _hasTargetInfo ? _targetInfo.height : 0;
}

void RNSkWindowSurface::setHighBitDepth(bool highBitDepth) {
  std::lock_guard<std::mutex> lock(_targetInfoMutex);
  _knownHighBitDepth = highBitDepth;
  _hasKnownHighBitDepth = true;
}

bool RNSkWindowSurface::getHighBitDepth(bool *highBitDepth) {
  std::lock_guard<std::mutex> lock(_targetInfoMutex);
  if (!_hasKnownHighBitDepth) {
    return false;
  }
  *highBitDepth = _knownHighBitDepth;
  return true;
}

bool RNSkWindowSurface::getTargetInfo(RNSkGraphiteTargetInfo *info) {
  std::lock_guard<std::mutex> lock(_targetInfoMutex);
  if (!_hasTargetInfo) {
    return false;
  }
  *info = _targetInfo;
  return true;
}

void RNSkWindowSurface::updateTargetInfo() {
  std::lock_guard<std::mutex> lock(_targetInfoMutex);
  // Kept while the surface is away for a device replacement (see
  // ensureDevice): the frames recorded meanwhile are for this window.
  if (_nativeHandle == nullptr) {
    _hasTargetInfo = false;
    return;
  }
  _targetInfo.width = _width;
  _targetInfo.height = _height;
  _targetInfo.colorType = _colorType;
  _targetInfo.useP3ColorSpace = _useP3ColorSpace;
  _targetInfo.textureInfo = getTextureInfo();
  _hasTargetInfo = true;
  // What the surface granted, kept once the window is detached: it is what
  // the window comes back with.
  _knownHighBitDepth = _colorType == DawnUtils::HighBitDepthColorType;
  _hasKnownHighBitDepth = true;
}

skgpu::graphite::TextureInfo RNSkWindowSurface::getTextureInfo() const {
  return skgpu::graphite::TextureInfos::MakeDawn(
      skgpu::graphite::DawnTextureInfo(skgpu::graphite::SampleCount::k1,
                                       skgpu::Mipmapped::kNo, _format, _usage,
                                       wgpu::TextureAspect::All));
}

void RNSkWindowSurface::configureSurface() {
  _presentHold.dropFrames();
  wgpu::SurfaceConfiguration config;
  config.device = _device;
  config.format = _format;
  config.width = _width;
  config.height = _height;
  config.presentMode = wgpu::PresentMode::Fifo;
  _usage = supportedSurfaceUsage();
  config.usage = _usage;
#ifdef __APPLE__
  config.alphaMode = wgpu::CompositeAlphaMode::Premultiplied;
#endif
  _surface.Configure(&config);
#ifdef __APPLE__
  // The layer is tagged with the gamut the window renders in; float formats
  // need the (gamma-encoded) extended variant so the values display
  // identically to the 8-bit path.
  applyCAMetalLayerColorSpace(_nativeHandle, _format, _useP3ColorSpace);
#endif
}

wgpu::TextureUsage RNSkWindowSurface::supportedSurfaceUsage() {
  wgpu::TextureUsage usage = wgpu::TextureUsage::RenderAttachment;
  wgpu::SurfaceCapabilities capabilities;
  if (_surface.GetCapabilities(_device.GetAdapter(), &capabilities) !=
      wgpu::Status::Success) {
    return usage;
  }
  for (auto extra :
       {wgpu::TextureUsage::TextureBinding, wgpu::TextureUsage::CopySrc}) {
    if ((capabilities.usages & extra) &&
        (DawnUtils::DefaultTargetUsage & extra)) {
      usage |= extra;
    }
  }
  return usage;
}

bool RNSkWindowSurface::surfaceSupportsFormat(wgpu::TextureFormat format) {
  wgpu::SurfaceCapabilities capabilities;
  if (_surface.GetCapabilities(_device.GetAdapter(), &capabilities) !=
      wgpu::Status::Success) {
    return false;
  }
  for (size_t i = 0; i < capabilities.formatCount; i++) {
    if (capabilities.formats[i] == format) {
      return true;
    }
  }
  return false;
}

bool RNSkWindowSurface::canPresent() {
  // A lost device (see DawnContext::isDeviceLost) takes no frame until it
  // is replaced: the view keeps its last one and the queue waits, as while
  // in the background. A window whose surface is away for the replacement
  // (see ensureDevice) can: presenting is what brings the surface back.
  return _nativeHandle != nullptr && !DawnContext::isDeviceLost() &&
         (!_canPresent || _canPresent());
}

void RNSkWindowSurface::releaseSurfacesOn(uint64_t generation) {
  std::lock_guard<std::mutex> lock(windowsMutex());
  for (auto *window : windows()) {
    if (window->_generation == generation) {
      window->replaceSurface(nullptr);
    }
  }
}

bool RNSkWindowSurface::ensureDevice() {
  const auto generation = DawnContext::generation();
  if (_surface && _generation == generation) {
    return true;
  }
  auto *context = DawnContext::tryGetInstance();
  if (context == nullptr) {
    return false;
  }
  if (_surface) {
    // The device the surface was configured on was lost and replaced. The
    // surface cannot follow: a Vulkan swapchain cannot move to another
    // device (Dawn refuses it), and the VkSurfaceKHR of the old swapchain
    // keeps the window connected until the lost device runs its deferred
    // deletions, which only its destruction does. Dawn does not destroy
    // swapchains with their device, and detaching one afterwards crashes,
    // so every window on that device lets go of its surface first, the
    // device is destroyed, and the surfaces are made again: this one now,
    // the others on their next frame (see canPresent).
    releaseSurfacesOn(_generation);
    context->destroyRetiredDevice(_generation);
  }
  _device = context->getWGPUDevice();
  _generation = generation;
  _recorder = context->getRecorder();
  replaceSurface(context->MakeWGPUSurface(_nativeHandle));
  if (!_surface) {
    RNSkLogger::logToConsole("Could not create a surface over the window");
    return false;
  }
  configureSurface();
  updateTargetInfo();
  return true;
}

bool RNSkWindowSurface::presentRecordings(
    const std::vector<skgpu::graphite::Recording *> &recordings) {
  if (!takesFrame() || !ensureDevice()) {
    return false;
  }
  wgpu::SurfaceTexture surfaceTexture;
  _surface.GetCurrentTexture(&surfaceTexture);
  auto texture = surfaceTexture.texture;
  if (!texture) {
    return false;
  }
  // The surface only names the replay target; wrapping the swapchain texture
  // records nothing on the window's recorder.
  auto backendTex = skgpu::graphite::BackendTextures::MakeDawn(texture.Get());
  SkSurfaceProps surfaceProps;
  auto surface = SkSurfaces::WrapBackendTexture(
      _recorder, backendTex, DawnUtils::viewColorSpace(_useP3ColorSpace),
      &surfaceProps);
  if (!surface) {
    return false;
  }
  // A recording Graphite rejects is logged there and dropped: it would be
  // rejected again on every frame, and the frames behind it would never come.
  DawnContext::getInstance().insertRecordings(recordings, surface.get());
#ifdef __APPLE__
  dawn::native::metal::WaitForCommandsToBeScheduled(_device.Get());
#endif
  _presentHold.presentOrHold([this]() { presentNow(); });
  return true;
}

bool RNSkWindowSurface::presentImage(const sk_sp<SkImage> &image) {
  if (!takesFrame() || !ensureDevice()) {
    return false;
  }
  wgpu::SurfaceTexture surfaceTexture;
  _surface.GetCurrentTexture(&surfaceTexture);
  auto texture = surfaceTexture.texture;
  if (!texture) {
    return false;
  }
  auto backendTex = skgpu::graphite::BackendTextures::MakeDawn(texture.Get());
  SkSurfaceProps surfaceProps;
  auto surface = SkSurfaces::WrapBackendTexture(
      _recorder, backendTex, _colorType,
      DawnUtils::viewColorSpace(_useP3ColorSpace), &surfaceProps);
  if (!surface) {
    return false;
  }
  surface->getCanvas()->drawImage(image, 0, 0);
  DawnContext::getInstance().submitRecording(_recorder);
#ifdef __APPLE__
  dawn::native::metal::WaitForCommandsToBeScheduled(_device.Get());
#endif
  _presentHold.presentOrHold([this]() { presentNow(); });
  return true;
}

HeldFrame RNSkWindowSurface::presentHeldFrame() {
  // A device replaced since the frame was held takes the frame with the
  // surface it was replayed into (see replaceSurface).
  if (!ensureDevice()) {
    return HeldFrame::kNone;
  }
  return _presentHold.presentHeldFrame([this]() { presentNow(); });
}

void RNSkWindowSurface::presentNow() {
  _surface.Present();
  didPresent();
}

RNSkWindowSurface::DawnQueue::Work RNSkWindowSurface::DawnQueue::track() {
  return DawnContext::getInstance().trackSubmittedWork();
}

bool RNSkWindowSurface::DawnQueue::isDone(const Work &work) {
  return DawnContext::getInstance().isWorkDone(work);
}

} // namespace RNSkia
