//
//  SkiaCVPixelBufferUtils.mm
//  react-native-skia
//
//  Created by Marc Rousavy on 10.04.24.
//

#import "SkiaCVPixelBufferUtils.h"
#import "SkiaMetalSurfaceFactory.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"
#import "include/core/SkColorSpace.h"
#import <include/gpu/GrBackendSurface.h>
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

// pragma MARK: RGB

SkColorType SkiaCVPixelBufferUtils::RGB::getCVPixelBufferColorType(
    CVPixelBufferRef pixelBuffer) {
  OSType format = CVPixelBufferGetPixelFormatType(pixelBuffer);

  switch (format) {
  case kCVPixelFormatType_32BGRA:
    [[likely]] return kBGRA_8888_SkColorType;
  case kCVPixelFormatType_32RGBA:
    return kRGBA_8888_SkColorType;
  // This can be extended with branches for specific RGB formats if new Apple
  // uses new formats.
  default:
    [[unlikely]] throw std::runtime_error(
        "CVPixelBuffer has unknown RGB format! " +
        std::string(FourCC2Str(format)));
  }
}

GrBackendTexture SkiaCVPixelBufferUtils::RGB::getSkiaTextureForCVPixelBuffer(
    CVPixelBufferRef pixelBuffer) {
  return getSkiaTextureForCVPixelBufferPlane(pixelBuffer, /* planeIndex */ 0);
}

// pragma MARK: CVPixelBuffer -> Skia Texture

GrBackendTexture SkiaCVPixelBufferUtils::getSkiaTextureForCVPixelBufferPlane(
    CVPixelBufferRef pixelBuffer, size_t planeIndex) {
  // 1. Get cache
  CVMetalTextureCacheRef textureCache = getTextureCache();

  // 2. Get MetalTexture from CMSampleBuffer
  CVMetalTextureRef textureHolder;
  size_t width = CVPixelBufferGetWidthOfPlane(pixelBuffer, planeIndex);
  size_t height = CVPixelBufferGetHeightOfPlane(pixelBuffer, planeIndex);
  MTLPixelFormat pixelFormat =
      getMTLPixelFormatForCVPixelBufferPlane(pixelBuffer, planeIndex);
  CVReturn result = CVMetalTextureCacheCreateTextureFromImage(
      kCFAllocatorDefault, textureCache, pixelBuffer, nil, pixelFormat, width,
      height, planeIndex, &textureHolder);
  if (result != kCVReturnSuccess) [[unlikely]] {
    throw std::runtime_error(
        "Failed to create Metal Texture from CMSampleBuffer! Result: " +
        std::to_string(result));
  }

  // 2. Unwrap the underlying MTLTexture
  id<MTLTexture> mtlTexture = CVMetalTextureGetTexture(textureHolder);
  if (mtlTexture == nil) [[unlikely]] {
    throw std::runtime_error(
        "Failed to get MTLTexture from CVMetalTextureRef!");
  }

  // 3. Wrap MTLTexture in Skia's GrBackendTexture
  GrMtlTextureInfo textureInfo;
  textureInfo.fTexture.retain((__bridge void *)mtlTexture);
  GrBackendTexture texture =
      GrBackendTexture((int)mtlTexture.width, (int)mtlTexture.height,
                       skgpu::Mipmapped::kNo, textureInfo);
  CFRelease(textureHolder);
  return texture;
}

// pragma MARK: getTextureCache()

CVMetalTextureCacheRef SkiaCVPixelBufferUtils::getTextureCache() {
  static thread_local CVMetalTextureCacheRef textureCache = nil;
  static thread_local size_t accessCounter = 0;
  if (textureCache == nil) {
    // Create a new Texture Cache
    auto result = CVMetalTextureCacheCreate(kCFAllocatorDefault, nil,
                                            MTLCreateSystemDefaultDevice(), nil,
                                            &textureCache);
    if (result != kCVReturnSuccess || textureCache == nil) {
      throw std::runtime_error("Failed to create Metal Texture Cache!");
    }
  }
  accessCounter++;
  if (accessCounter > 30) {
    // Every 30 accesses, we perform some internal recycling/housekeeping
    // operations.
    CVMetalTextureCacheFlush(textureCache, 0);
    accessCounter = 0;
  }
  return textureCache;
}

// pragma MARK: Get CVPixelBuffer MTLPixelFormat

MTLPixelFormat SkiaCVPixelBufferUtils::getMTLPixelFormatForCVPixelBufferPlane(
    CVPixelBufferRef pixelBuffer, size_t planeIndex) {
  size_t width = CVPixelBufferGetWidthOfPlane(pixelBuffer, planeIndex);
  size_t bytesPerRow =
      CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, planeIndex);
  double bytesPerPixel = round(static_cast<double>(bytesPerRow) / width);
  if (bytesPerPixel == 1) {
    return MTLPixelFormatR8Unorm;
  } else if (bytesPerPixel == 2) {
    return MTLPixelFormatRG8Unorm;
  } else if (bytesPerPixel == 4) {
    return MTLPixelFormatBGRA8Unorm;
  } else [[unlikely]] {
    throw std::runtime_error("Invalid bytes per row! Expected 1 (R), 2 (RG) or "
                             "4 (RGBA), but received " +
                             std::to_string(bytesPerPixel));
  }
}
