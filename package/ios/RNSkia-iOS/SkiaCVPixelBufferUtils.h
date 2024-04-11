//
//  SkiaCVPixelBufferUtils.h
//  react-native-skia
//
//  Created by Marc Rousavy on 10.04.24.
//

#pragma once
#import <CoreMedia/CMSampleBuffer.h>
#import <CoreVideo/CVMetalTextureCache.h>
#import <MetalKit/MetalKit.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"
#import <include/gpu/GrBackendSurface.h>
#import "include/core/SkColorSpace.h"
#pragma clang diagnostic pop

class SkiaCVPixelBufferUtils {
public:

class RGB {
public:
  struct FormatInfo {
    MTLPixelFormat metalFormat;
    SkColorType skiaFormat;
  };
  /**
   Gets RGB-specific information about a CVPixelBuffer, such as the Metal format
   and the Skia-specific format.
   */
  static FormatInfo getCVPixelBufferFormatInfo(CVPixelBufferRef pixelBuffer);
  /**
   Gets a GPU-backed Skia Texture for the given RGB CVPixelBuffer.
   */
  static GrBackendTexture getSkiaTextureForCVPixelBuffer(CVPixelBufferRef pixelBuffer);
};

private:
  static CVMetalTextureCacheRef getTextureCache();
  static GrBackendTexture getSkiaTextureForCVPixelBufferPlane(CVPixelBufferRef pixelBuffer, size_t planeIndex);
  static MTLPixelFormat getMTLPixelFormatForCVPixelBufferPlane(CVPixelBufferRef pixelBuffer, size_t planeIndex);
};
