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

// pragma MARK: TextureHolder

TextureHolder::TextureHolder(CVMetalTextureRef texture) : _texture(texture) {}
TextureHolder::~TextureHolder() { CFRelease(_texture); }

GrBackendTexture TextureHolder::toGrBackendTexture() {
  // Unwrap the underlying MTLTexture
  id<MTLTexture> mtlTexture = CVMetalTextureGetTexture(_texture);
  if (mtlTexture == nil) [[unlikely]] {
    throw std::runtime_error(
        "Failed to get MTLTexture from CVMetalTextureRef!");
  }

  // Wrap MTLTexture in Skia's GrBackendTexture
  GrMtlTextureInfo textureInfo;
  textureInfo.fTexture.retain((__bridge void *)mtlTexture);
  GrBackendTexture texture =
      GrBackendTexture((int)mtlTexture.width, (int)mtlTexture.height,
                       skgpu::Mipmapped::kNo, textureInfo);
  return texture;
}

// pragma MARK: Base

SkiaCVPixelBufferUtils::CVPixelBufferBaseFormat
SkiaCVPixelBufferUtils::getCVPixelBufferBaseFormat(
    CVPixelBufferRef pixelBuffer) {
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
    [[unlikely]] throw std::runtime_error(
        "CVPixelBuffer has unknown pixel format! " +
        std::string("Expected: any RGB or YUV format, Received: ") +
        std::string(FourCC2Str(format)));
  }
}

// pragma MARK: RGB

SkColorType SkiaCVPixelBufferUtils::RGB::getCVPixelBufferColorType(
    CVPixelBufferRef pixelBuffer) {
  OSType format = CVPixelBufferGetPixelFormatType(pixelBuffer);

  switch (format) {
  case kCVPixelFormatType_32BGRA:
    [[likely]] return kBGRA_8888_SkColorType;
  case kCVPixelFormatType_32RGBA:
    return kRGBA_8888_SkColorType;
  // This can be extended with branches for specific RGB formats if Apple
  // uses new formats.
  default:
    [[unlikely]] throw std::runtime_error(
        "CVPixelBuffer has unknown RGB format! " +
        std::string(FourCC2Str(format)));
  }
}

TextureHolder *SkiaCVPixelBufferUtils::RGB::getSkiaTextureForCVPixelBuffer(
    CVPixelBufferRef pixelBuffer) {
  return getSkiaTextureForCVPixelBufferPlane(pixelBuffer, /* planeIndex */ 0);
}

// pragma MARK: YUV

GrYUVABackendTextures
SkiaCVPixelBufferUtils::YUV::getSkiaTextureForCVPixelBuffer(
    CVPixelBufferRef pixelBuffer) {
  // 1. Get all planes (YUV, Y_UV, Y_U_V or Y_U_V_A)
  size_t planesCount = CVPixelBufferGetPlaneCount(pixelBuffer);
  GrBackendTexture textures[planesCount];

  for (size_t planeIndex = 0; planeIndex < planesCount; planeIndex++) {
    textures[planeIndex] =
        getSkiaTextureForCVPixelBufferPlane(pixelBuffer, planeIndex);
  }

  // 2. Wrap info about buffer
  SkYUVAInfo info = getYUVAInfoForCVPixelBuffer(pixelBuffer);

  // 3. Return all textures
  return GrYUVABackendTextures(info, textures, kTopLeft_GrSurfaceOrigin);
}

SkYUVAInfo SkiaCVPixelBufferUtils::YUV::getYUVAInfoForCVPixelBuffer(
    CVPixelBufferRef pixelBuffer) {
  size_t width = CVPixelBufferGetWidth(pixelBuffer);
  size_t height = CVPixelBufferGetHeight(pixelBuffer);
  SkISize size =
      SkISize::Make(static_cast<int>(width), static_cast<int>(height));

  OSType format = CVPixelBufferGetPixelFormatType(pixelBuffer);
  SkYUVAInfo::PlaneConfig planeConfig = getPlaneConfig(format);
  SkYUVAInfo::Subsampling subsampling = getSubsampling(format);
  SkYUVColorSpace colorspace = getColorspace(format);

  return SkYUVAInfo(size, planeConfig, subsampling, colorspace);
}

// pragma MARK: YUV getPlaneConfig()

SkYUVAInfo::PlaneConfig
SkiaCVPixelBufferUtils::YUV::getPlaneConfig(OSType pixelFormat) {
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
    [[likely]] return SkYUVAInfo::PlaneConfig::kY_UV;
  case kCVPixelFormatType_420YpCbCr8VideoRange_8A_TriPlanar:
  case kCVPixelFormatType_444YpCbCr16VideoRange_16A_TriPlanar:
    return SkYUVAInfo::PlaneConfig::kY_U_V;
  // This can be extended with branches for specific YUV formats if Apple
  // uses new formats.
  default:
    [[unlikely]] throw std::runtime_error("Invalid pixel format! " +
                                          std::string(FourCC2Str(pixelFormat)));
  }
}

// pragma MARK: YUV getSubsampling()

SkYUVAInfo::Subsampling
SkiaCVPixelBufferUtils::YUV::getSubsampling(OSType pixelFormat) {
  switch (pixelFormat) {
  case kCVPixelFormatType_420YpCbCr8Planar:
  case kCVPixelFormatType_420YpCbCr8PlanarFullRange:
  case kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange:
  case kCVPixelFormatType_420YpCbCr8BiPlanarFullRange:
  case kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange:
  case kCVPixelFormatType_420YpCbCr10BiPlanarFullRange:
  case kCVPixelFormatType_420YpCbCr8VideoRange_8A_TriPlanar:
    [[likely]] return SkYUVAInfo::Subsampling::k420;
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
  // This can be extended with branches for specific YUV formats if Apple
  // uses new formats.
  default:
    [[unlikely]] throw std::runtime_error("Invalid pixel format! " +
                                          std::string(FourCC2Str(pixelFormat)));
  }
}

// pragma MARK: YUV getColorspace()

SkYUVColorSpace SkiaCVPixelBufferUtils::YUV::getColorspace(OSType pixelFormat) {
  switch (pixelFormat) {
  case kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange:
  case kCVPixelFormatType_422YpCbCr8BiPlanarVideoRange:
  case kCVPixelFormatType_444YpCbCr8BiPlanarVideoRange:
    [[likely]]
    // 8-bit limited
    return SkYUVColorSpace::kRec709_Limited_SkYUVColorSpace;
  case kCVPixelFormatType_420YpCbCr8PlanarFullRange:
  case kCVPixelFormatType_420YpCbCr8BiPlanarFullRange:
  case kCVPixelFormatType_422YpCbCr8BiPlanarFullRange:
  case kCVPixelFormatType_444YpCbCr8BiPlanarFullRange:
  case kCVPixelFormatType_422YpCbCr8FullRange:
    [[likely]]
    // 8-bit full
    return SkYUVColorSpace::kRec709_Full_SkYUVColorSpace;
  case kCVPixelFormatType_420YpCbCr10BiPlanarVideoRange:
  case kCVPixelFormatType_422YpCbCr10BiPlanarVideoRange:
  case kCVPixelFormatType_444YpCbCr10BiPlanarVideoRange:
    // 10-bit limited
    return SkYUVColorSpace::kBT2020_10bit_Limited_SkYUVColorSpace;
  case kCVPixelFormatType_420YpCbCr10BiPlanarFullRange:
  case kCVPixelFormatType_422YpCbCr10BiPlanarFullRange:
  case kCVPixelFormatType_444YpCbCr10BiPlanarFullRange:
    // 10-bit full
    return SkYUVColorSpace::kBT2020_10bit_Full_SkYUVColorSpace;
  // This can be extended with branches for specific YUV formats if Apple
  // uses new formats.
  default:
    [[unlikely]] throw std::runtime_error("Invalid pixel format! " +
                                          std::string(FourCC2Str(pixelFormat)));
  }
}

// pragma MARK: CVPixelBuffer -> Skia Texture

TextureHolder *SkiaCVPixelBufferUtils::getSkiaTextureForCVPixelBufferPlane(
    CVPixelBufferRef pixelBuffer, size_t planeIndex) {
  // 1. Get cache
  CVMetalTextureCacheRef textureCache = getTextureCache();

  // 2. Get MetalTexture from CMSampleBuffer
  size_t width = CVPixelBufferGetWidthOfPlane(pixelBuffer, planeIndex);
  size_t height = CVPixelBufferGetHeightOfPlane(pixelBuffer, planeIndex);
  MTLPixelFormat pixelFormat =
      getMTLPixelFormatForCVPixelBufferPlane(pixelBuffer, planeIndex);

  CVMetalTextureRef textureHolder;
  CVReturn result = CVMetalTextureCacheCreateTextureFromImage(
      kCFAllocatorDefault, textureCache, pixelBuffer, nil, pixelFormat, width,
      height, planeIndex, &textureHolder);

  if (result != kCVReturnSuccess) [[unlikely]] {
    throw std::runtime_error(
        "Failed to create Metal Texture from CMSampleBuffer! Result: " +
        std::to_string(result));
  }

  return new TextureHolder(textureHolder);
}

// pragma MARK: getTextureCache()

CVMetalTextureCacheRef SkiaCVPixelBufferUtils::getTextureCache() {
  static CVMetalTextureCacheRef textureCache = nil;
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
