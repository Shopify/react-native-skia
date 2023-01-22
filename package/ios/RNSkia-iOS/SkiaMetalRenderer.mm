#import <MetalKit/MetalKit.h>

#include "SkSurface.h"
#include "GrDirectContext.h"
#include "GrBackendSurface.h"
#include "GrTypes.h"
#include "SkColorType.h"

sk_sp<SkSurface> MakeOffscreenMetalSurface(int width, int height) {
  id<MTLDevice> device = MTLCreateSystemDefaultDevice();

  // Create a Metal command queue
  id<MTLCommandQueue> commandQueue = [device newCommandQueue];

  // Create a Skia GrDirectContext
  auto skiaContext = GrDirectContext::MakeMetal((__bridge void*)device, (__bridge void*)commandQueue);

  // Create a Metal texture descriptor
  MTLTextureDescriptor *textureDescriptor = [[MTLTextureDescriptor alloc] init];
  textureDescriptor.textureType = MTLTextureType2D;
  textureDescriptor.pixelFormat = MTLPixelFormatBGRA8Unorm;
  textureDescriptor.width = width;
  textureDescriptor.height = height;
  textureDescriptor.usage = MTLTextureUsageRenderTarget;

  // Create a Metal texture
  id<MTLTexture> offscreenBuffer = [device newTextureWithDescriptor:textureDescriptor];

  // Create a GrBackendTexture from the Metal texture
  GrMtlTextureInfo info;
  info.fTexture.retain((__bridge void*)offscreenBuffer);
  GrBackendTexture backendTexture(width, height, GrMipMapped::kNo, info);

  // Create a SkSurface from the GrBackendTexture
  auto surface = SkSurface::MakeFromBackendTexture(skiaContext.get(), backendTexture, kTopLeft_GrSurfaceOrigin, 0, kBGRA_8888_SkColorType, nullptr, nullptr);
  return surface;
}
