#ifdef SK_GRAPHITE

#import <CoreGraphics/CoreGraphics.h>
#import <Foundation/Foundation.h>
#import <QuartzCore/CAMetalLayer.h>
#import <QuartzCore/CATransaction.h>

#include "rnskia/RNMetalLayerColorSpace.h"

namespace RNSkia {

// WebGPU canvas values are sRGB-encoded regardless of the texture format
// (GPUCanvasConfiguration.colorSpace defaults to "srgb"), so the same shader
// output must display identically on bgra8unorm and rgba16float surfaces.
// Core Animation interprets a float-format layer with a nil colorspace as
// extended linear sRGB, which displays the same values noticeably brighter.
// Tagging the layer as (gamma-encoded) extended sRGB matches the browser
// behavior: identical colors, with the extra precision of float16.
void applyCAMetalLayerColorSpace(void *nativeSurface,
                                 wgpu::TextureFormat format) {
  CALayer *layer = (__bridge CALayer *)nativeSurface;
  if (![layer isKindOfClass:[CAMetalLayer class]]) {
    return;
  }
  auto metalLayer = static_cast<CAMetalLayer *>(layer);
  if (format == wgpu::TextureFormat::RGBA16Float) {
    CGColorSpaceRef colorSpace =
        CGColorSpaceCreateWithName(kCGColorSpaceExtendedSRGB);
    metalLayer.colorspace = colorSpace;
    CGColorSpaceRelease(colorSpace);
  } else if (metalLayer.colorspace != nil) {
    // Restore the default (no color matching) when reconfiguring back to an
    // 8-bit format.
    metalLayer.colorspace = nil;
  }
  // The change must be set synchronously so the first present already sees
  // it, and it must reach the render server. On a non-main thread (RN JS or
  // worklet runtime) the property lands in that thread's implicit
  // CATransaction, which may never commit on threads without a spinning
  // runloop, so flush it now. On the main thread the runloop commits it.
  if (!NSThread.isMainThread) {
    [CATransaction flush];
  }
}

} // namespace RNSkia

#endif // SK_GRAPHITE
