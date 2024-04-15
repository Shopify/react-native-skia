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

const SkiaMetalContext &SkiaMetalSurfaceFactory::getSkiaContext() {
  static const auto key = "SkiaContext";

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  dispatch_queue_t currentQueue = dispatch_get_current_queue();
#pragma clang diagnostic pop

  void *state = dispatch_queue_get_specific(currentQueue, key);
  if (state == nullptr) {
    NSLog(@"Re-creating SkiaContext...");
    SkiaMetalContext *context = new SkiaMetalContext();
    context->device = MTLCreateSystemDefaultDevice();
    context->commandQueue = [context->device newCommandQueue];
    sk_sp<GrDirectContext> skContext =
        GrDirectContext::MakeMetal((__bridge void *)context->device,
                                   (__bridge void *)context->commandQueue);
    if (skContext == nullptr) {
      throw std::runtime_error("Failed to create Metal Skia Context!");
    }
    context->skContext = skContext;

    state = reinterpret_cast<SkiaMetalContext *>(context);
    dispatch_queue_set_specific(currentQueue, key, state, [](void *data) {
      delete reinterpret_cast<SkiaMetalContext *>(data);
    });
  }

  SkiaMetalContext *currentContext =
      reinterpret_cast<SkiaMetalContext *>(state);
  return *currentContext;
}

sk_sp<SkSurface>
SkiaMetalSurfaceFactory::makeWindowedSurface(id<MTLTexture> texture, int width,
                                             int height) {
  GrMtlTextureInfo fbInfo;
  fbInfo.fTexture.retain((__bridge void *)texture);

  GrBackendRenderTarget backendRT(width, height, fbInfo);

  auto &context = getSkiaContext();
  auto skSurface = SkSurfaces::WrapBackendRenderTarget(
      context.skContext.get(), backendRT, kTopLeft_GrSurfaceOrigin,
      kBGRA_8888_SkColorType, nullptr, nullptr);

  if (skSurface == nullptr || skSurface->getCanvas() == nullptr) {
    RNSkia::RNSkLogger::logToConsole(
        "Skia surface could not be created from parameters.");
    return nullptr;
  }
  return skSurface;
}

sk_sp<SkSurface> SkiaMetalSurfaceFactory::makeOffscreenSurface(int width,
                                                               int height) {
  auto &context = getSkiaContext();
  auto ctx = new OffscreenRenderContext(context.device, context.skContext,
                                        context.commandQueue, width, height);

  // Create a GrBackendTexture from the Metal texture
  GrMtlTextureInfo info;
  info.fTexture.retain((__bridge void *)ctx->texture);
  GrBackendTexture backendTexture(width, height, skgpu::Mipmapped::kNo, info);

  // Create a SkSurface from the GrBackendTexture
  auto surface = SkSurfaces::WrapBackendTexture(
      context.skContext.get(), backendTexture, kTopLeft_GrSurfaceOrigin, 0,
      kBGRA_8888_SkColorType, nullptr, nullptr,
      [](void *addr) { delete (OffscreenRenderContext *)addr; }, ctx);

  return surface;
}

sk_sp<SkImage> SkiaMetalSurfaceFactory::makeTextureFromCMSampleBuffer(
    CMSampleBufferRef sampleBuffer) {
  auto &context = getSkiaContext();

  if (!CMSampleBufferIsValid(sampleBuffer)) [[unlikely]] {
    throw std::runtime_error("The given CMSampleBuffer is not valid!");
  }

  CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);

  SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat format =
      SkiaCVPixelBufferUtils::getCVPixelBufferBaseFormat(pixelBuffer);
  switch (format) {
  case SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat::rgb: {
    // CVPixelBuffer is in any RGB format
    SkColorType colorType =
        SkiaCVPixelBufferUtils::RGB::getCVPixelBufferColorType(pixelBuffer);
    GrBackendTexture texture =
        SkiaCVPixelBufferUtils::RGB::getSkiaTextureForCVPixelBuffer(
            pixelBuffer);
    return SkImages::AdoptTextureFrom(context.skContext.get(), texture,
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
