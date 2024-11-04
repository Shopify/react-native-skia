#pragma once

#include "SkiaMetalSurfaceFactory.h"
#include "WindowContext.h"

#include "include/core/SkSurface.h"

class MetalContext {
public:
  MetalContext(const MetalContext &) = delete;
  MetalContext &operator=(const MetalContext &) = delete;

  static MetalContext &getInstance() {
    static thread_local MetalContext instance;
    return instance;
  }

  sk_sp<SkSurface> MakeOffscreen(int width, int height) {
    return SkiaMetalSurfaceFactory::makeOffscreenSurface(width, height);
  }
	
  sk_sp<SkImage> MakeImageFromBuffer(void *buffer) {
	CVPixelBufferRef sampleBuffer = (CVPixelBufferRef)buffer;
	return SkiaMetalSurfaceFactory::makeTextureFromCVPixelBuffer(sampleBuffer);
  }

  std::unique_ptr<RNSkia::WindowContext> MakeWindow(CALayer *window, int width,
                                                    int height) {
    return SkiaMetalSurfaceFactory::makeContext(window, width, height);
  }

private:
  MetalContext() {}
};
