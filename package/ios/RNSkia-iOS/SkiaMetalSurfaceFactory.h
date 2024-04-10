#import <MetalKit/MetalKit.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "include/core/SkCanvas.h"
#import <CoreMedia/CMSampleBuffer.h>
#import <CoreVideo/CVMetalTextureCache.h>
#import <include/gpu/GrDirectContext.h>

#pragma clang diagnostic pop

using SkiaMetalContext = struct SkiaMetalContext {
  id<MTLCommandQueue> commandQueue = nullptr;
  sk_sp<GrDirectContext> skContext = nullptr;
};

class ThreadContextHolder {
public:
  static thread_local SkiaMetalContext ThreadSkiaMetalContext;
};

class SkiaMetalSurfaceFactory {
public:
  static sk_sp<SkSurface> makeWindowedSurface(id<MTLTexture> texture, int width,
                                              int height);
  static sk_sp<SkSurface> makeOffscreenSurface(int width, int height);

  static sk_sp<SkImage> makeTextureFromImage(sk_sp<SkImage> image);

private:
  static id<MTLDevice> device;
  static bool
  createSkiaDirectContextIfNecessary(SkiaMetalContext *threadContext);
};
