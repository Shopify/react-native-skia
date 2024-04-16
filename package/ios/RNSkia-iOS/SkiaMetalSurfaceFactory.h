#import <MetalKit/MetalKit.h>
#import <CoreMedia/CMSampleBuffer.h>
#import <CoreVideo/CVMetalTextureCache.h>
#import "RNSkiOSContext.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "include/core/SkCanvas.h"
#import "include/gpu/GrDirectContext.h"

#pragma clang diagnostic pop

namespace RNSkia {

class SkiaMetalSurfaceFactory {
public:
  static sk_sp<SkSurface> makeWindowedSurface(std::shared_ptr<RNSkiOSContext> skiaContext,
                                              id<MTLTexture> texture, int width,
                                              int height);
  static sk_sp<SkSurface> makeOffscreenSurface(std::shared_ptr<RNSkiOSContext> skiaContext,
                                               int width, int height);
  
  static sk_sp<SkImage>
  makeTextureFromCMSampleBuffer(std::shared_ptr<RNSkiOSContext> skiaContext,
                                CMSampleBufferRef sampleBuffer);
};

} // namespace RNSkia
