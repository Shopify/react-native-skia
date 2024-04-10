//
//  SkiaCVPixelBufferUtils.h
//  react-native-skia
//
//  Created by Marc Rousavy on 10.04.24.
//

#pragma once
#import <MetalKit/MetalKit.h>
#import "include/gpu/GrYUVABackendTextures.h"
#import <CoreMedia/CMSampleBuffer.h>
#import <CoreVideo/CVMetalTextureCache.h>

enum class CVPixelBufferBaseFormat {
  yuv,
  rgb
};

class SkiaCVPixelBufferUtils {
public:
  static GrBackendTexture getTextureFromCVPixelBuffer(CVPixelBufferRef pixelBuffer, size_t planeIndex, MTLPixelFormat pixelFormat);
  static GrYUVABackendTextures getYUVTexturesFromCVPixelBuffer(CVPixelBufferRef pixelBuffer);
  static CVPixelBufferBaseFormat getCVPixelBufferBaseFormat(CVPixelBufferRef pixelBuffer);

private:
  static CVMetalTextureCacheRef getTextureCache();
  static MTLPixelFormat getMTLPixelFormatForCVPixelBufferPlane(CVPixelBufferRef pixelBuffer, size_t planeIndex);

  static SkYUVAInfo::PlaneConfig getPlaneConfig(OSType pixelFormat);
  static SkYUVAInfo::Subsampling getSubsampling(OSType pixelFormat);
  static SkYUVColorSpace getColorspace(OSType pixelFormat);
  static SkYUVAInfo getYUVAInfoForCVPixelBuffer(CVPixelBufferRef pixelBuffer);
};
