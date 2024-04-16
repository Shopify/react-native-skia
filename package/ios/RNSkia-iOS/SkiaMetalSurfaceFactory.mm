#import "RNSkLog.h"

#import "SkiaCVPixelBufferUtils.h"
#import "SkiaMetalSurfaceFactory.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "include/core/SkCanvas.h"
#import "include/core/SkColorSpace.h"
#import "include/core/SkSurface.h"

#import <include/gpu/GrBackendSurface.h>
#import <include/gpu/GrDirectContext.h>
#import <include/gpu/ganesh/SkImageGanesh.h>
#import <include/gpu/ganesh/SkSurfaceGanesh.h>
#import <include/gpu/ganesh/mtl/SkSurfaceMetal.h>

#pragma clang diagnostic pop

namespace RNSkia {

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

sk_sp<SkSurface>
SkiaMetalSurfaceFactory::makeWindowedSurface(std::shared_ptr<RNSkiOSContext> skiaContext,
                                             id<MTLTexture> texture, int width,
                                             int height) {
  GrMtlTextureInfo fbInfo;
  fbInfo.fTexture.retain((__bridge void *)texture);
  
  GrBackendRenderTarget backendRT(width, height, fbInfo);
  
  auto skSurface = SkSurfaces::WrapBackendRenderTarget(skiaContext->getDirectContext().get(), backendRT,
                                                       kTopLeft_GrSurfaceOrigin, kBGRA_8888_SkColorType, nullptr, nullptr);
  
  if (skSurface == nullptr || skSurface->getCanvas() == nullptr) {
    RNSkia::RNSkLogger::logToConsole(
                                     "Skia surface could not be created from parameters.");
    return nullptr;
  }
  return skSurface;
}

sk_sp<SkSurface> SkiaMetalSurfaceFactory::makeOffscreenSurface(std::shared_ptr<RNSkiOSContext> skiaContext,
                                                               int width,
                                                               int height) {
  auto ctx = new OffscreenRenderContext(skiaContext->getDevice(), skiaContext->getDirectContext(),
                                        skiaContext->getCommandQueue(), width, height);
  
  // Create a GrBackendTexture from the Metal texture
  GrMtlTextureInfo info;
  info.fTexture.retain((__bridge void *)ctx->texture);
  GrBackendTexture backendTexture(width, height, skgpu::Mipmapped::kNo, info);
  
  // Create a SkSurface from the GrBackendTexture
  auto surface = SkSurfaces::WrapBackendTexture(skiaContext->getDirectContext().get(),
                                                backendTexture, kTopLeft_GrSurfaceOrigin, 0, kBGRA_8888_SkColorType,
                                                nullptr, nullptr,
                                                [](void *addr) { delete (OffscreenRenderContext *)addr; }, ctx);
  
  return surface;
}

sk_sp<SkImage> SkiaMetalSurfaceFactory::makeTextureFromCMSampleBuffer(std::shared_ptr<RNSkiOSContext> skiaContext,
                                                                      CMSampleBufferRef sampleBuffer) {
  if (!CMSampleBufferIsValid(sampleBuffer)) [[unlikely]] {
    throw std::runtime_error("The given CMSampleBuffer is not valid!");
  }
  
  CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
  
  SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat format =
  SkiaCVPixelBufferUtils::getCVPixelBufferBaseFormat(pixelBuffer);
  switch (format) {
    case SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat::rgb: {
      // CVPixelBuffer is in any RGB format.
      SkColorType colorType =
      SkiaCVPixelBufferUtils::RGB::getCVPixelBufferColorType(pixelBuffer);
      GrBackendTexture texture =
      SkiaCVPixelBufferUtils::RGB::getSkiaTextureForCVPixelBuffer(
                                                                  pixelBuffer);
      return SkImages::AdoptTextureFrom(skiaContext->getDirectContext().get(), texture,
                                        kTopLeft_GrSurfaceOrigin, colorType,
                                        kOpaque_SkAlphaType);
    }
    default:
      [[unlikely]] {
        throw std::runtime_error("Failed to convert PlatformBuffer to SkImage - "
                                 "PlatformBuffer has unsupported PixelFormat! " +
                                 std::to_string(static_cast<int>(format)));
      }
  }
}

} // namespace RNSkia
