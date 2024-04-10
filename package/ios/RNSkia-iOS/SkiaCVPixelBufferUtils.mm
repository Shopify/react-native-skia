//
//  SkiaCVPixelBufferUtils.mm
//  react-native-skia
//
//  Created by Marc Rousavy on 10.04.24.
//

#import "SkiaCVPixelBufferUtils.h"
#import "SkiaMetalSurfaceFactory.h"

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


CVMetalTextureCacheRef SkiaCVPixelBufferUtils::getTextureCache() {
  static thread_local CVMetalTextureCacheRef textureCache = nil;
  static thread_local size_t accessCounter = 0;
  if (textureCache == nil) {
    // Create a new Texture Cache
    auto result = CVMetalTextureCacheCreate(kCFAllocatorDefault, nil, MTLCreateSystemDefaultDevice(),
                                            nil, &textureCache);
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

GrBackendTexture SkiaCVPixelBufferUtils::getTextureFromCVPixelBuffer(CVPixelBufferRef pixelBuffer, size_t planeIndex, MTLPixelFormat pixelFormat) {
  // 1. Get cache
  CVMetalTextureCacheRef textureCache = getTextureCache();

  // 2. Get MetalTexture from CMSampleBuffer
  CVMetalTextureRef textureHolder;
  size_t width = CVPixelBufferGetWidthOfPlane(pixelBuffer, planeIndex);
  size_t height = CVPixelBufferGetHeightOfPlane(pixelBuffer, planeIndex);
  CVReturn result = CVMetalTextureCacheCreateTextureFromImage(kCFAllocatorDefault, textureCache, pixelBuffer, nil,
                                                              pixelFormat, width, height, planeIndex, &textureHolder);
  if (result != kCVReturnSuccess) {
    throw std::runtime_error("Failed to create Metal Texture from CMSampleBuffer! Result: " +
                             std::to_string(result));
  }

  // 2. Unwrap the underlying MTLTexture
  id<MTLTexture> mtlTexture = CVMetalTextureGetTexture(textureHolder);
  if (mtlTexture == nil) {
    throw std::runtime_error("Failed to get MTLTexture from CVMetalTextureRef!");
  }

  // 3. Wrap MTLTexture in Skia's GrBackendTexture
  GrMtlTextureInfo textureInfo;
  textureInfo.fTexture.retain((__bridge void *)mtlTexture);
  GrBackendTexture texture = GrBackendTexture((int)mtlTexture.width, (int)mtlTexture.height,
                                  skgpu::Mipmapped::kNo, textureInfo);
  CFRelease(textureHolder);
  return texture;
}

SkYUVAInfo::PlaneConfig SkiaCVPixelBufferUtils::getPlaneConfig(OSType pixelFormat) {
  switch (pixelFormat) {
    case kCVPixelFormatType_420YpCbCr8Planar:
    case kCVPixelFormatType_420YpCbCr8PlanarFullRange:
      return SkYUVAInfo::PlaneConfig::kYUV;
    case kCVPixelFormatType_422YpCbCr_4A_8BiPlanar:
    case kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_420YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_422YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_444YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_422YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_420YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_444YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr16BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr16BiPlanarVideoRange:
      return SkYUVAInfo::PlaneConfig::kY_UV;
    case kCVPixelFormatType_420YpCbCr8VideoRange_8A_TriPlanar:
    case kCVPixelFormatType_444YpCbCr16VideoRange_16A_TriPlanar:
      return SkYUVAInfo::PlaneConfig::kY_U_V;
    default:
      throw std::runtime_error("Invalid pixel format! " + std::string(FourCC2Str(pixelFormat)));
  }
}
SkYUVAInfo::Subsampling SkiaCVPixelBufferUtils::getSubsampling(OSType pixelFormat) {
  switch (pixelFormat) {
    case kCVPixelFormatType_420YpCbCr8Planar:
    case kCVPixelFormatType_420YpCbCr8PlanarFullRange:
    case kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_420YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_420YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_420YpCbCr8VideoRange_8A_TriPlanar:
      return SkYUVAInfo::Subsampling::k420;
    case kCVPixelFormatType_4444YpCbCrA8:
    case kCVPixelFormatType_4444YpCbCrA8R:
    case kCVPixelFormatType_4444AYpCbCr8:
    case kCVPixelFormatType_4444AYpCbCr16:
    case kCVPixelFormatType_4444AYpCbCrFloat:
    case kCVPixelFormatType_444YpCbCr8:
    case kCVPixelFormatType_444YpCbCr10:
    case kCVPixelFormatType_444YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_444YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_444YpCbCr16BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr16VideoRange_16A_TriPlanar:
      return SkYUVAInfo::Subsampling::k444;
    case kCVPixelFormatType_422YpCbCr8:
    case kCVPixelFormatType_422YpCbCr16:
    case kCVPixelFormatType_422YpCbCr10:
    case kCVPixelFormatType_422YpCbCr_4A_8BiPlanar:
    case kCVPixelFormatType_422YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_422YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr8_yuvs:
    case kCVPixelFormatType_422YpCbCr8FullRange:
    case kCVPixelFormatType_422YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_422YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr16BiPlanarVideoRange:
      return SkYUVAInfo::Subsampling::k422;
    default:
      throw std::runtime_error("Invalid pixel format! " + std::string(FourCC2Str(pixelFormat)));
  }
}
SkYUVColorSpace SkiaCVPixelBufferUtils::getColorspace(OSType pixelFormat) {
  switch (pixelFormat) {
    case kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_422YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_422YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_420YpCbCr8VideoRange_8A_TriPlanar:
    case kCVPixelFormatType_422YpCbCr16BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr16BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr16VideoRange_16A_TriPlanar:
      return SkYUVColorSpace::kRec709_Limited_SkYUVColorSpace;
    case kCVPixelFormatType_420YpCbCr8PlanarFullRange:
    case kCVPixelFormatType_420YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_444YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr8FullRange:
    case kCVPixelFormatType_420YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_444YpCbCr10BiPlanarFullRange:
      return SkYUVColorSpace::kRec709_Full_SkYUVColorSpace;
    default:
      throw std::runtime_error("Invalid pixel format! " + std::string(FourCC2Str(pixelFormat)));
  }
}

SkYUVAInfo SkiaCVPixelBufferUtils::getYUVAInfoForCVPixelBuffer(CVPixelBufferRef pixelBuffer) {
  size_t width = CVPixelBufferGetWidth(pixelBuffer);
  size_t height = CVPixelBufferGetHeight(pixelBuffer);
  SkISize size = SkISize::Make(static_cast<int>(width), static_cast<int>(height));

  OSType format = CVPixelBufferGetPixelFormatType(pixelBuffer);
  SkYUVAInfo::PlaneConfig planeConfig = getPlaneConfig(format);
  SkYUVAInfo::Subsampling subsampling = getSubsampling(format);
  SkYUVColorSpace colorspace = getColorspace(format);

  return SkYUVAInfo(size, planeConfig, subsampling, colorspace);
}

MTLPixelFormat SkiaCVPixelBufferUtils::getMTLPixelFormatForCVPixelBufferPlane(CVPixelBufferRef pixelBuffer, size_t planeIndex) {
  size_t width = CVPixelBufferGetWidthOfPlane(pixelBuffer, planeIndex);
  size_t bytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, planeIndex);
  double bytesPerPixel = round(static_cast<double>(bytesPerRow) / width);
  if (bytesPerPixel == 1) {
    return MTLPixelFormatR8Unorm;
  } else if (bytesPerPixel == 2) {
    return MTLPixelFormatRG8Unorm;
  } else if (bytesPerPixel == 4) {
    return MTLPixelFormatRGBA8Unorm;
  } else {
    throw std::runtime_error("Invalid bytes per row! Expected 1 (R), 2 (RG) or 4 (RGBA), but received " + std::to_string(bytesPerPixel));
  }
}

GrYUVABackendTextures SkiaCVPixelBufferUtils::getYUVTexturesFromCVPixelBuffer(CVPixelBufferRef pixelBuffer) {
  // 1. Get all planes (YUV, Y_UV, Y_U_V or Y_U_V_A)
  size_t planesCount = CVPixelBufferGetPlaneCount(pixelBuffer);
  GrBackendTexture textures[planesCount];

  for (size_t planeIndex = 0; planeIndex < planesCount; planeIndex++) {
    MTLPixelFormat pixelFormat = getMTLPixelFormatForCVPixelBufferPlane(pixelBuffer, planeIndex);
    NSLog(@"Plane %zu is in %zu", planeIndex, pixelFormat);
    GrBackendTexture texture = getTextureFromCVPixelBuffer(pixelBuffer, planeIndex, pixelFormat);
    textures[planeIndex] = texture;
  }

  // 2. Wrap info about buffer
  SkYUVAInfo info = getYUVAInfoForCVPixelBuffer(pixelBuffer);

  // 3. Return all textures
  return GrYUVABackendTextures(info, textures, kTopLeft_GrSurfaceOrigin);
}

CVPixelBufferBaseFormat SkiaCVPixelBufferUtils::getCVPixelBufferBaseFormat(CVPixelBufferRef pixelBuffer) {
  OSType format = CVPixelBufferGetPixelFormatType(pixelBuffer);
  switch (format) {
    // 8-bit YUV formats
    case kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_420YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_422YpCbCr8BiPlanarFullRange:
    case kCVPixelFormatType_444YpCbCr8BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr8BiPlanarFullRange:
    // 10-bit YUV formats
    case kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_422YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_444YpCbCr10BiPlanarVideoRange:
    case kCVPixelFormatType_420YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_422YpCbCr10BiPlanarFullRange:
    case kCVPixelFormatType_444YpCbCr10BiPlanarFullRange:
      return CVPixelBufferBaseFormat::yuv;
    case kCVPixelFormatType_24RGB:
    case kCVPixelFormatType_24BGR:
    case kCVPixelFormatType_32ARGB:
    case kCVPixelFormatType_32BGRA:
    case kCVPixelFormatType_32ABGR:
    case kCVPixelFormatType_32RGBA:
    case kCVPixelFormatType_64ARGB:
    case kCVPixelFormatType_64RGBALE:
    case kCVPixelFormatType_48RGB:
    case kCVPixelFormatType_30RGB:
      return CVPixelBufferBaseFormat::rgb;
    default:
      throw std::runtime_error("Invalid CVPixelBuffer format! " + std::string(FourCC2Str(format)));
  }
}
