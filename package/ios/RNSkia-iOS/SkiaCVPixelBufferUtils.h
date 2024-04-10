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

struct RGBFormatInfo {
  MTLPixelFormat metalFormat;
  SkColorType skiaFormat;
};

class SkiaCVPixelBufferUtils {
public:
  /**
   Get the base format of the given CVPixelBuffer.
   Returns either RGB or YUV, or throws if the pixel-buffer is in an unknown format.
   */
  static CVPixelBufferBaseFormat getCVPixelBufferBaseFormat(CVPixelBufferRef pixelBuffer);
  /**
   Gets RGB-specific information about a CVPixelBuffer, such as the Metal format and the Skia-specific format.
   */
  static RGBFormatInfo getRGBCVPixelBufferFormatInfo(CVPixelBufferRef pixelBuffer);
  /**
   Get a Skia Texture backed by a MTLTexture from the given CVPixelBuffer.
   For RGB:
   ```
   GrBackendTexture texture = getTextureFromCVPixelBuffer(pixelBuffer, 0, MTLPixelFormatBGRA8Unorm);
   ```
   For YUV use `getYUVTexturesFromCVPixelBuffer` instead, unless you want full control over the MTLPixelFormat per plane.
   */
  static GrBackendTexture getTextureFromCVPixelBuffer(CVPixelBufferRef pixelBuffer, size_t planeIndex, MTLPixelFormat pixelFormat);
  /**
   Get a Skia YUV Texture backed by multiple MTLTextures for the given CVPixelBuffer.
   The CVPixelBuffer might be multi-planar (e.g. Y + UV) or single-planar.
   Either way, it needs to be in a supported YUV format.
   */
  static GrYUVABackendTextures getYUVTexturesFromCVPixelBuffer(CVPixelBufferRef pixelBuffer);

private:
  static CVMetalTextureCacheRef getTextureCache();
  static MTLPixelFormat getMTLPixelFormatForCVPixelBufferPlane(CVPixelBufferRef pixelBuffer, size_t planeIndex);

  static SkYUVAInfo::PlaneConfig getPlaneConfig(OSType pixelFormat);
  static SkYUVAInfo::Subsampling getSubsampling(OSType pixelFormat);
  static SkYUVColorSpace getColorspace(OSType pixelFormat);
  static SkYUVAInfo getYUVAInfoForCVPixelBuffer(CVPixelBufferRef pixelBuffer);
};
