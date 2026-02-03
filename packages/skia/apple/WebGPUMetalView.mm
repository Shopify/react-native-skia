#import "WebGPUMetalView.h"

#ifdef SK_GRAPHITE

#import "webgpu/webgpu_cpp.h"
#import <QuartzCore/CAMetalLayer.h>

#import "rnwgpu/SurfaceRegistry.h"
#import "rnskia/RNDawnContext.h"

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
  void *nativeSurface = (__bridge void *)self.layer;
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  auto &dawnContext = RNSkia::DawnContext::getInstance();
  auto gpu = dawnContext.getWGPUInstance();

  // Create the surface using Dawn's API directly
  wgpu::SurfaceSourceMetalLayer metalSurfaceDesc;
  metalSurfaceDesc.layer = nativeSurface;
  wgpu::SurfaceDescriptor surfaceDescriptor;
  surfaceDescriptor.nextInChain = &metalSurfaceDesc;
  auto surface = gpu.CreateSurface(&surfaceDescriptor);

  registry
      .getSurfaceInfoOrCreate([_contextId intValue], gpu, size.width,
                              size.height)
      ->switchToOnscreen(nativeSurface, surface);
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
  auto &registry = rnwgpu::SurfaceRegistry::getInstance();
  // Remove the surface info from the registry
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
