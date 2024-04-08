#import "RNSkLog.h"

#include "SkiaMetalSurfaceFactory.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "include/core/SkCanvas.h"
#import "include/core/SkColorSpace.h"
#import "include/core/SkSurface.h"

#import <include/gpu/GrBackendSurface.h>
#import <include/gpu/GrDirectContext.h>
#import <include/gpu/ganesh/SkImageGanesh.h>
#import <include/gpu/ganesh/SkSurfaceGanesh.h>

#pragma clang diagnostic pop

#include <TargetConditionals.h>
#if TARGET_RT_BIG_ENDIAN
#define FourCC2Str(fourcc)                                                     \
  (const char[]) {                                                             \
    *((char *)&fourcc), *(((char *)&fourcc) + 1), *(((char *)&fourcc) + 2),    \
        *(((char *)&fourcc) + 3), 0                                            \
  }
#else
#define FourCC2Str(fourcc)                                                     \
  (const char[]) {                                                             \
    *(((char *)&fourcc) + 3), *(((char *)&fourcc) + 2),                        \
        *(((char *)&fourcc) + 1), *(((char *)&fourcc) + 0), 0                  \
  }
#endif

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
    skiaMetalContext->skContext = GrDirectContext::MakeMetal(
        (__bridge void *)device,
        (__bridge void *)skiaMetalContext->commandQueue);
    if (skiaMetalContext->skContext == nullptr) {
      RNSkia::RNSkLogger::logToConsole("Couldn't create a Skia Metal Context");
      return false;
    }
  }
  return true;
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

  GrBackendRenderTarget backendRT(width, height, fbInfo);

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
  GrBackendTexture backendTexture(width, height, skgpu::Mipmapped::kNo, info);

  // Create a SkSurface from the GrBackendTexture
  auto surface = SkSurfaces::WrapBackendTexture(
      ThreadContextHolder::ThreadSkiaMetalContext.skContext.get(),
      backendTexture, kTopLeft_GrSurfaceOrigin, 0, kBGRA_8888_SkColorType,
      nullptr, nullptr,
      [](void *addr) { delete (OffscreenRenderContext *)addr; }, ctx);

  return surface;
}

inline CVMetalTextureCacheRef getTextureCache() {
  static thread_local CVMetalTextureCacheRef textureCache = nil;
  if (textureCache == nil) {
    // Create a new Texture Cache
    auto result = CVMetalTextureCacheCreate(kCFAllocatorDefault, nil,
                                            MTLCreateSystemDefaultDevice(), nil,
                                            &textureCache);
    if (result != kCVReturnSuccess || textureCache == nil) {
      throw std::runtime_error("Failed to create Metal Texture Cache!");
    }
  }
  return textureCache;
}

sk_sp<SkImage> SkiaMetalSurfaceFactory::makeImageFromCMSampleBuffer(
    CMSampleBufferRef sampleBuffer) {
  if (!SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary(
          &ThreadContextHolder::ThreadSkiaMetalContext)) {
    throw std::runtime_error("Failed to create Skia Context for this Thread!");
  }

  if (!CMSampleBufferIsValid(sampleBuffer)) {
    throw std::runtime_error("The given CMSampleBuffer is not valid!");
  }

  CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer);
  double width = CVPixelBufferGetWidth(pixelBuffer);
  double height = CVPixelBufferGetHeight(pixelBuffer);

  // Make sure the format is RGB (BGRA_8888)
  OSType format = CVPixelBufferGetPixelFormatType(pixelBuffer);
  if (format != kCVPixelFormatType_32BGRA) {
    // TODO: Also support YUV (kCVPixelFormatType_420YpCbCr8Planar) as that is
    // much more efficient!
    auto error = std::string("CMSampleBuffer has unknown Pixel Format (") +
                 FourCC2Str(format) +
                 std::string(") - cannot convert to SkImage!");
    throw std::runtime_error(error);
  }

  CVMetalTextureCacheRef textureCache = getTextureCache();

  // Convert CMSampleBuffer* -> CVMetalTexture*
  CVMetalTextureRef cvTexture;
  CVReturn result = CVMetalTextureCacheCreateTextureFromImage(
      kCFAllocatorDefault, textureCache, pixelBuffer, nil,
      MTLPixelFormatBGRA8Unorm, width, height,
      0, // plane index
      &cvTexture);
  if (result != kCVReturnSuccess) {
    throw std::runtime_error(
        "Failed to craete Metal Texture from CMSampleBuffer! Result: " +
        std::to_string(result));
  }

  id<MTLTexture> mtlTexture = CVMetalTextureGetTexture(cvTexture);
  if (mtlTexture == nil) {
    throw std::runtime_error(
        "Failed to convert CMSampleBuffer to SkImage - cannot get MTLTexture!");
  }

  // Convert the rendered MTLTexture to an SkImage
  GrMtlTextureInfo textureInfo;
  textureInfo.fTexture.retain((__bridge void *)mtlTexture);
  GrBackendTexture backendTexture((int)mtlTexture.width, (int)mtlTexture.height,
                                  skgpu::Mipmapped::kNo, textureInfo);

  auto context = ThreadContextHolder::ThreadSkiaMetalContext.skContext;
  // TODO: Adopt or Borrow?
  auto image = SkImages::AdoptTextureFrom(
      context.get(), backendTexture, kTopLeft_GrSurfaceOrigin,
      kBGRA_8888_SkColorType, kOpaque_SkAlphaType, SkColorSpace::MakeSRGB());

  // Release the Texture wrapper (it will still be strong)
  CFRelease(cvTexture);

  return image;
}
