#include <SkiaMetalSurfaceFactory.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#import "SkCanvas.h"
#import "SkColorSpace.h"
#import "SkSurface.h"

#import <include/gpu/GrBackendSurface.h>
#import <include/gpu/GrDirectContext.h>
#import <include/gpu/ganesh/SkSurfaceGanesh.h>

#pragma clang diagnostic pop

thread_local SkiaMetalContext ThreadContextHolder::ThreadMetalContext;

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

SkiaMetalContext &SkiaMetalSurfaceFactory::createSkiaDirectContextIfNecessary() {
  if (ThreadContextHolder::ThreadMetalContext.skContext == nullptr) {
    ThreadContextHolder::ThreadMetalContext.commandQueue =
        id<MTLCommandQueue>(CFRetain((GrMTLHandle)[device newCommandQueue]));
    ThreadContextHolder::ThreadMetalContext
        .skContext = GrDirectContext::MakeMetal(
        (__bridge void *)device,
        (__bridge void *)ThreadContextHolder::ThreadMetalContext.commandQueue);
  }
  return ThreadContextHolder::ThreadMetalContext;
}

sk_sp<SkSurface> SkiaMetalSurfaceFactory::makeOffscreenSurface(int width, int height) {
  auto metalContext = createSkiaDirectContextIfNecessary();
  auto ctx = new OffscreenRenderContext(
      device, metalContext.skContext, metalContext.commandQueue, width, height);

  // Create a GrBackendTexture from the Metal texture
  GrMtlTextureInfo info;
  info.fTexture.retain((__bridge void *)ctx->texture);
  GrBackendTexture backendTexture(width, height, GrMipMapped::kNo, info);

  // Create a SkSurface from the GrBackendTexture
  auto surface = SkSurfaces::WrapBackendTexture(
      metalContext.skContext.get(), backendTexture, kTopLeft_GrSurfaceOrigin, 0,
      kBGRA_8888_SkColorType, nullptr, nullptr,
      [](void *addr) { delete (OffscreenRenderContext *)addr; }, ctx);

  return surface;
}
