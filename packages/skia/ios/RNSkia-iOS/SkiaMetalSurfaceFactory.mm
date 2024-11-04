#import "RNSkLog.h"

#import "SkiaCVPixelBufferUtils.h"
#import "SkiaMetalSurfaceFactory.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "include/core/SkCanvas.h"
#import "include/core/SkColorSpace.h"
#import "include/core/SkSurface.h"

#import <include/gpu/ganesh/GrBackendSurface.h>
#import <include/gpu/ganesh/GrDirectContext.h>
#import <include/gpu/ganesh/SkImageGanesh.h>
#import <include/gpu/ganesh/SkSurfaceGanesh.h>
#import <include/gpu/ganesh/mtl/GrMtlBackendContext.h>
#import <include/gpu/ganesh/mtl/GrMtlBackendSurface.h>
#import <include/gpu/ganesh/mtl/GrMtlDirectContext.h>
#import <include/gpu/ganesh/mtl/SkSurfaceMetal.h>

#pragma clang diagnostic pop

struct OffscreenRenderContext {
  id<MTLTexture> texture;

  OffscreenRenderContext(id<MTLDevice> device,
                         sk_sp<GrDirectContext> skiaContext,
                         id<MTLCommandQueue> commandQueue, int width,
                         int height) {
    // Create a Metal texture descriptor
    MTLTextureDescriptor *textureDescriptor = [MTLTextureDescriptor
        texture2DDescriptorWithPixelFormat:MTLPixelFormatBGRA8Unorm
                                     width:width
                                    height:height
                                 mipmapped:NO];
    textureDescriptor.usage =
        MTLTextureUsageRenderTarget | MTLTextureUsageShaderRead;
    texture = [device newTextureWithDescriptor:textureDescriptor];
  }
};

std::unique_ptr<RNSkia::WindowContext>
SkiaMetalSurfaceFactory::makeContext(SkiaMetalContext *context,
                                     CALayer *texture, int width, int height) {
  return std::make_unique<IOSSkiaContext>(context, texture, width, height);
}

sk_sp<SkSurface> SkiaMetalSurfaceFactory::makeWindowedSurface(
    SkiaMetalContext *context, id<MTLTexture> texture, int width, int height) {
  GrMtlTextureInfo fbInfo;
  fbInfo.fTexture.retain((__bridge void *)texture);

  GrBackendRenderTarget backendRT =
      GrBackendRenderTargets::MakeMtl(width, height, fbInfo);

  auto skSurface = SkSurfaces::WrapBackendRenderTarget(
      context->skContext.get(), backendRT, kTopLeft_GrSurfaceOrigin,
      kBGRA_8888_SkColorType, nullptr, nullptr);

  if (skSurface == nullptr || skSurface->getCanvas() == nullptr) {
    RNSkia::RNSkLogger::logToConsole(
        "Skia surface could not be created from parameters.");
    return nullptr;
  }
  return skSurface;
}

sk_sp<SkSurface> SkiaMetalSurfaceFactory::makeOffscreenSurface(
    id<MTLDevice> device, SkiaMetalContext *context, int width, int height) {

  auto ctx = new OffscreenRenderContext(device, context->skContext,
                                        context->commandQueue, width, height);

  // Create a GrBackendTexture from the Metal texture
  GrMtlTextureInfo info;
  info.fTexture.retain((__bridge void *)ctx->texture);
  GrBackendTexture backendTexture =
      GrBackendTextures::MakeMtl(width, height, skgpu::Mipmapped::kNo, info);

  // Create a SkSurface from the GrBackendTexture
  auto surface = SkSurfaces::WrapBackendTexture(
      context->skContext.get(), backendTexture, kTopLeft_GrSurfaceOrigin, 0,
      kBGRA_8888_SkColorType, nullptr, nullptr,
      [](void *addr) { delete (OffscreenRenderContext *)addr; }, ctx);

  return surface;
}

sk_sp<SkImage> SkiaMetalSurfaceFactory::makeTextureFromCVPixelBuffer(
    SkiaMetalContext *context, CVPixelBufferRef pixelBuffer) {
  SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat format =
      SkiaCVPixelBufferUtils::getCVPixelBufferBaseFormat(pixelBuffer);
  switch (format) {
  case SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat::rgb: {
    // CVPixelBuffer is in any RGB format, single-plane
    return SkiaCVPixelBufferUtils::RGB::makeSkImageFromCVPixelBuffer(
        context->skContext.get(), pixelBuffer);
  }
  case SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat::yuv: {
    // CVPixelBuffer is in any YUV format, multi-plane
    return SkiaCVPixelBufferUtils::YUV::makeSkImageFromCVPixelBuffer(
        context->skContext.get(), pixelBuffer);
  }
  default:
    [[unlikely]] {
      throw std::runtime_error("Failed to convert NativeBuffer to SkImage - "
                               "NativeBuffer has unsupported PixelFormat! " +
                               std::to_string(static_cast<int>(format)));
    }
  }
}
