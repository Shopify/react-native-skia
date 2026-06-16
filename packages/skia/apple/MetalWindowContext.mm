#include "MetalWindowContext.h"

#include "MetalContext.h"
#include "RNSkLog.h"
#include "include/core/SkColorSpace.h"

namespace {

struct ResolvedFormat {
  MTLPixelFormat mtlPixelFormat;
  SkColorType skColorType;
};

ResolvedFormat resolveFormat(RNSkia::WindowPixelFormat fmt) {
  switch (fmt) {
  case RNSkia::WindowPixelFormat::BGRA10:
    // Note: Ganesh's Metal caps only register MTLPixelFormatBGR10A2Unorm
    // as a 10-bit render target. The extended-range XR variants are not
    // accepted by SkSurfaces::WrapBackendRenderTarget today, so this is
    // standard 10-bit Display P3 (no values >1.0).
    return {MTLPixelFormatBGR10A2Unorm, kBGRA_1010102_SkColorType};
  case RNSkia::WindowPixelFormat::RGBA16F:
    return {MTLPixelFormatRGBA16Float, kRGBA_F16_SkColorType};
  case RNSkia::WindowPixelFormat::BGRA8:
  default:
    return {MTLPixelFormatBGRA8Unorm, kBGRA_8888_SkColorType};
  }
}

// CAMetalLayer rejects pixel formats the GPU/runtime cannot present.
// In particular, the iOS simulator does not support non-default drawable
// formats. Detect this up front and fall back to BGRA8 with a console
// warning, rather than letting CoreAnimation raise an NSException.
RNSkia::WindowPixelFormat
adjustForCapabilities(RNSkia::WindowPixelFormat fmt, id<MTLDevice> device) {
  if (fmt == RNSkia::WindowPixelFormat::BGRA8) {
    return fmt;
  }

#if TARGET_OS_SIMULATOR
  RNSkia::RNSkLogger::logToConsole(
      "Non-default pixel format requested but the iOS simulator does "
      "not support it. Falling back to BGRA8.");
  return RNSkia::WindowPixelFormat::BGRA8;
#else
  (void)device;
  return fmt;
#endif
}

sk_sp<SkColorSpace> resolveColorSpace(RNSkia::WindowPixelFormat fmt,
                                      bool useP3) {
  switch (fmt) {
  case RNSkia::WindowPixelFormat::RGBA16F:
    // Extended linear Display P3 for EDR / HDR compositing.
    return SkColorSpace::MakeRGB(SkNamedTransferFn::kLinear,
                                 SkNamedGamut::kDisplayP3);
  case RNSkia::WindowPixelFormat::BGRA10:
    return SkColorSpace::MakeRGB(SkNamedTransferFn::kSRGB,
                                 SkNamedGamut::kDisplayP3);
  case RNSkia::WindowPixelFormat::BGRA8:
  default:
    return useP3 ? SkColorSpace::MakeRGB(SkNamedTransferFn::kSRGB,
                                         SkNamedGamut::kDisplayP3)
                 : nullptr;
  }
}

CGColorSpaceRef resolveCGColorSpace(RNSkia::WindowPixelFormat fmt) {
  switch (fmt) {
  case RNSkia::WindowPixelFormat::RGBA16F:
    return CGColorSpaceCreateWithName(kCGColorSpaceExtendedLinearDisplayP3);
  case RNSkia::WindowPixelFormat::BGRA10:
  case RNSkia::WindowPixelFormat::BGRA8:
  default:
    return CGColorSpaceCreateWithName(kCGColorSpaceDisplayP3);
  }
}

} // namespace

MetalWindowContext::MetalWindowContext(GrDirectContext *directContext,
                                       id<MTLDevice> device,
                                       id<MTLCommandQueue> commandQueue,
                                       CALayer *layer, int width, int height,
                                       bool useP3ColorSpace,
                                       RNSkia::WindowPixelFormat pixelFormat)
    : _directContext(directContext), _commandQueue(commandQueue),
      _pixelFormat(adjustForCapabilities(pixelFormat, device)) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunguarded-availability-new"
  _layer = (CAMetalLayer *)layer;
#pragma clang diagnostic pop
  _layer.framebufferOnly = NO;
  _layer.device = device;
  _layer.opaque = false;
#if !TARGET_OS_OSX
  _layer.contentsScale = [UIScreen mainScreen].scale;
#else
  _layer.contentsScale = [NSScreen mainScreen].backingScaleFactor;
#endif // !TARGET_OS_OSX

  ResolvedFormat resolved = resolveFormat(_pixelFormat);
  _layer.pixelFormat = resolved.mtlPixelFormat;
  _skColorType = resolved.skColorType;
  _layer.contentsGravity = kCAGravityBottomLeft;
  _layer.drawableSize = CGSizeMake(width, height);

  BOOL supportsWideColor = NO;
  if (useP3ColorSpace || _pixelFormat != RNSkia::WindowPixelFormat::BGRA8) {
#if !TARGET_OS_OSX
    if (@available(iOS 10.0, *)) {
      supportsWideColor = [UIScreen mainScreen].traitCollection.displayGamut ==
                          UIDisplayGamutP3;
    }
#else
    if (@available(macOS 10.12, *)) {
      NSScreen *screen = [NSScreen mainScreen];
      NSColorSpace *displayP3 = [NSColorSpace displayP3ColorSpace];
      if (screen.colorSpace && displayP3) {
        supportsWideColor = [screen.colorSpace isEqual:displayP3];
      }
    }
#endif // !TARGET_OS_OSX
  }

  // Non-default formats imply a wide-gamut intent regardless of the
  // useP3ColorSpace flag.
  if (supportsWideColor) {
    CGColorSpaceRef colorSpace = resolveCGColorSpace(_pixelFormat);
    _layer.colorspace = colorSpace;
    CGColorSpaceRelease(colorSpace);
    _useP3ColorSpace = true;
  }

  // Enable EDR for the half-float path on iOS 16+.
  if (_pixelFormat == RNSkia::WindowPixelFormat::RGBA16F) {
#if !TARGET_OS_OSX
    if (@available(iOS 16.0, *)) {
      _layer.wantsExtendedDynamicRangeContent = YES;
    }
#else
    if (@available(macOS 10.15, *)) {
      _layer.wantsExtendedDynamicRangeContent = YES;
    }
#endif // !TARGET_OS_OSX
  }
}

sk_sp<SkSurface> MetalWindowContext::getSurface() {
  if (_skSurface) {
    return _skSurface;
  }

  // Get the next drawable from the CAMetalLayer
  _currentDrawable = [_layer nextDrawable];
  if (!_currentDrawable) {
    RNSkia::RNSkLogger::logToConsole(
        "Could not retrieve drawable from CAMetalLayer");
    return nullptr;
  }

  // Get the texture from the drawable
  GrMtlTextureInfo fbInfo;
  fbInfo.fTexture.retain((__bridge void *)_currentDrawable.texture);

  GrBackendRenderTarget backendRT = GrBackendRenderTargets::MakeMtl(
      _layer.drawableSize.width, _layer.drawableSize.height, fbInfo);

  sk_sp<SkColorSpace> skColorSpace =
      resolveColorSpace(_pixelFormat, _useP3ColorSpace);

  _skSurface = SkSurfaces::WrapBackendRenderTarget(
      _directContext, backendRT, kTopLeft_GrSurfaceOrigin, _skColorType,
      skColorSpace, nullptr);

  if (!_skSurface) {
    RNSkia::RNSkLogger::logToConsole(
        "SkSurfaces::WrapBackendRenderTarget returned null. The current "
        "SkColorType is likely unsupported by the Ganesh Metal backend "
        "as a render target.");
  }

  return _skSurface;
}

void MetalWindowContext::present() {
  if (auto dContext = GrAsDirectContext(_skSurface->recordingContext())) {
    dContext->flushAndSubmit();
  }

  id<MTLCommandBuffer> commandBuffer([_commandQueue commandBuffer]);
  [commandBuffer presentDrawable:_currentDrawable];
  [commandBuffer commit];
  _skSurface = nullptr;
}
