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

thread_local SkiaMetalContext ThreadContextHolder::ThreadSkiaMetalContext;

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

id<MTLDevice> SkiaMetalSurfaceFactory::device = MTLCreateSystemDefaultDevice();

bool SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary(
    SkiaMetalContext *skiaMetalContext) {
  if (skiaMetalContext->skContext == nullptr) {
    skiaMetalContext->commandQueue =
        id<MTLCommandQueue>(CFRetain((GrMTLHandle)[device newCommandQueue]));

    GrMtlBackendContext backendContext = {};
    backendContext.fDevice.reset((__bridge void *)device);
    backendContext.fQueue.reset(
        (__bridge void *)skiaMetalContext->commandQueue);
    GrContextOptions grContextOptions; // set different options here.

    // Create the Skia Direct Context
    skiaMetalContext->skContext = GrDirectContexts::MakeMetal(backendContext);
    if (skiaMetalContext->skContext == nullptr) {
      RNSkia::RNSkLogger::logToConsole("Couldn't create a Skia Metal Context");
      return false;
    }
  }
  return true;
}

std::shared_ptr<RNSkia::SkiaContext>
SkiaMetalSurfaceFactory::makeContext(CALayer *texture, int width, int height) {
  return std::make_shared<IOSSkiaContext>(texture, width, height);
}

sk_sp<SkSurface>
SkiaMetalSurfaceFactory::makeWindowedSurface(id<MTLTexture> texture, int width,
                                             int height) {
  // Get render context for current thread
  if (!SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary(
          &ThreadContextHolder::ThreadSkiaMetalContext)) {
    return nullptr;
  }
  GrMtlTextureInfo fbInfo;
  fbInfo.fTexture.retain((__bridge void *)texture);

  GrBackendRenderTarget backendRT =
      GrBackendRenderTargets::MakeMtl(width, height, fbInfo);

  auto skSurface = SkSurfaces::WrapBackendRenderTarget(
      ThreadContextHolder::ThreadSkiaMetalContext.skContext.get(), backendRT,
      kTopLeft_GrSurfaceOrigin, kBGRA_8888_SkColorType, nullptr, nullptr);

  if (skSurface == nullptr || skSurface->getCanvas() == nullptr) {
    RNSkia::RNSkLogger::logToConsole(
        "Skia surface could not be created from parameters.");
    return nullptr;
  }
  return skSurface;
}

sk_sp<SkSurface> SkiaMetalSurfaceFactory::makeOffscreenSurface(int width,
                                                               int height) {
  if (!SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary(
          &ThreadContextHolder::ThreadSkiaMetalContext)) {
    return nullptr;
  }
  auto ctx = new OffscreenRenderContext(
      device, ThreadContextHolder::ThreadSkiaMetalContext.skContext,
      ThreadContextHolder::ThreadSkiaMetalContext.commandQueue, width, height);

  // Create a GrBackendTexture from the Metal texture
  GrMtlTextureInfo info;
  info.fTexture.retain((__bridge void *)ctx->texture);
  GrBackendTexture backendTexture =
      GrBackendTextures::MakeMtl(width, height, skgpu::Mipmapped::kNo, info);

  // Create a SkSurface from the GrBackendTexture
  auto surface = SkSurfaces::WrapBackendTexture(
      ThreadContextHolder::ThreadSkiaMetalContext.skContext.get(),
      backendTexture, kTopLeft_GrSurfaceOrigin, 0, kBGRA_8888_SkColorType,
      nullptr, nullptr,
      [](void *addr) { delete (OffscreenRenderContext *)addr; }, ctx);

  return surface;
}

sk_sp<SkImage> SkiaMetalSurfaceFactory::makeTextureFromCVPixelBuffer(
    CVPixelBufferRef pixelBuffer) {
  if (!SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary(
          &ThreadContextHolder::ThreadSkiaMetalContext)) [[unlikely]] {
    throw std::runtime_error("Failed to create Skia Context for this Thread!");
  }
  const SkiaMetalContext &context = ThreadContextHolder::ThreadSkiaMetalContext;

  SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat format =
      SkiaCVPixelBufferUtils::getCVPixelBufferBaseFormat(pixelBuffer);
  switch (format) {
  case SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat::rgb: {
    // CVPixelBuffer is in any RGB format, single-plane
    return SkiaCVPixelBufferUtils::RGB::makeSkImageFromCVPixelBuffer(
        context.skContext.get(), pixelBuffer);
  }
  case SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat::yuv: {
    // CVPixelBuffer is in any YUV format, multi-plane
    return SkiaCVPixelBufferUtils::YUV::makeSkImageFromCVPixelBuffer(
        context.skContext.get(), pixelBuffer);
  }
  default:
    [[unlikely]] {
      throw std::runtime_error("Failed to convert NativeBuffer to SkImage - "
                               "NativeBuffer has unsupported PixelFormat! " +
                               std::to_string(static_cast<int>(format)));
    }
  }
}
