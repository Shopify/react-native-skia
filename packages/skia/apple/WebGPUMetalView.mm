#import "WebGPUMetalView.h"

#ifdef SK_GRAPHITE

#import "webgpu/webgpu_cpp.h"
#import <QuartzCore/CAMetalLayer.h>

#import <ReactCommon/CallInvoker.h>

#import "rnskia/RNDawnContext.h"
#import "rnwgpu/SurfaceRegistry.h"
#import "rnwgpu/async/RuntimeContext.h"

namespace {
// Applies a surface attach latched by the platform UI thread (see
// SurfaceInfo::applyPendingAttach) from the JS thread. Surface attaches are
// normally adopted at the next frame boundary by whichever thread renders;
// this flush covers contexts that are not actively rendering (static
// content), so the last offscreen frame still makes it on screen. Mirrors
// react-native-webgpu's RNWebGPUManager::flushPendingSurfaceTransition.
void flushPendingSurfaceTransition(std::shared_ptr<rnwgpu::SurfaceInfo> info) {
  if (info == nullptr) {
    return;
  }
  auto invoker = rnwgpu::async::RuntimeContext::mainCallInvoker();
  if (invoker == nullptr) {
    return;
  }
  invoker->invokeAsync([info = std::move(info)] { info->applyPendingAttach(); });
}
} // namespace

@implementation WebGPUMetalView {
  BOOL _isConfigured;
}

#if !TARGET_OS_OSX
+ (Class)layerClass {
  return [CAMetalLayer class];
}
#else  // !TARGET_OS_OSX
- (instancetype)init {
  self = [super init];
  if (self) {
    self.wantsLayer = true;
    self.layer = [CAMetalLayer layer];
  }
  return self;
}
#endif // !TARGET_OS_OSX

- (void)configure {
  auto size = self.frame.size;
  // Retain the layer for as long as SurfaceInfo holds the pointer: the
  // latched attach (and the flush lambda that adopts it) can outlive this
  // view, e.g. across a dev reload where the registry is cleared before
  // dealloc runs. Balanced by the releaser below.
  void *nativeSurface = (void *)CFBridgingRetain(self.layer);
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  auto &dawnContext = RNSkia::DawnContext::getInstance();
  auto gpu = dawnContext.getWGPUInstance();

  // Create the surface using Dawn's API directly
  wgpu::SurfaceSourceMetalLayer metalSurfaceDesc;
  metalSurfaceDesc.layer = nativeSurface;
  wgpu::SurfaceDescriptor surfaceDescriptor;
  surfaceDescriptor.nextInChain = &metalSurfaceDesc;
  auto surface = gpu.CreateSurface(&surfaceDescriptor);

  // Find-or-create + attach runs atomically under the registry lock so a
  // concurrent destroyContext cannot orphan this surface.
  auto info = registry.attachSurface(
      [_contextId intValue], gpu, size.width, size.height, nativeSurface,
      surface, [](void *layer) {
        // The releaser can run on the rendering thread; CALayer teardown
        // belongs on the main thread.
        dispatch_async(dispatch_get_main_queue(), ^{
          CFBridgingRelease(layer);
        });
      });
  // The attach is adopted at the next frame boundary by the rendering thread;
  // schedule a flush so contexts that are not currently rendering still pick
  // it up (and present their last offscreen frame).
  flushPendingSurfaceTransition(info);
}

- (void)update {
  auto size = self.frame.size;
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  auto surfaceInfo = registry.getSurfaceInfo([_contextId intValue]);
  if (surfaceInfo) {
    surfaceInfo->resize(size.width, size.height);
  }
}

- (void)dealloc {
  // The view dies with its Canvas (contextIds are never reused), so view
  // teardown retires the registry entry. The JS-side cleanup
  // (RNWebGPU.destroyContext) only handles entries that never had a native
  // surface; see RNWebGPU::destroyContext for the ownership split.
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  if (auto info = registry.getSurfaceInfo([_contextId intValue])) {
    info->detachSurface();
  }
  registry.removeSurfaceInfo([_contextId intValue]);
}

@end

#else // SK_GRAPHITE

// Stub implementation when GRAPHITE is not enabled
@implementation WebGPUMetalView

#if !TARGET_OS_OSX
+ (Class)layerClass {
  return [CAMetalLayer class];
}
#else  // !TARGET_OS_OSX
- (instancetype)init {
  self = [super init];
  return self;
}
#endif // !TARGET_OS_OSX

- (void)configure {
  // No-op when GRAPHITE is not enabled
}

- (void)update {
  // No-op when GRAPHITE is not enabled
}

@end

#endif // SK_GRAPHITE
