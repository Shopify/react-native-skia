#import <MetalKit/MetalKit.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "include/core/SkCanvas.h"
#import <CoreMedia/CMSampleBuffer.h>
#import <CoreVideo/CVMetalTextureCache.h>
#import <include/gpu/GrDirectContext.h>

#pragma clang diagnostic pop

using SkiaMetalContext = struct SkiaMetalContext {
  id<MTLDevice> device = nil;
  id<MTLCommandQueue> commandQueue = nil;
  sk_sp<GrDirectContext> skContext = nullptr;
};

class SkiaMetalSurfaceFactory {
public:
  static sk_sp<SkSurface> makeWindowedSurface(id<MTLTexture> texture, int width,
                                              int height);
  static sk_sp<SkSurface> makeOffscreenSurface(int width, int height);

  static sk_sp<SkImage>
  makeTextureFromCMSampleBuffer(CMSampleBufferRef sampleBuffer);

  static const SkiaMetalContext &getSkiaContext();
};
