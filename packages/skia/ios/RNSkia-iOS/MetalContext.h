#pragma once

#include "SkiaMetalSurfaceFactory.h"
#include "WindowContext.h"

#include "include/core/SkSurface.h"

namespace RNSkia {
class RNSkiOSPlatformContext;
}

class MetalContext {

public:
  MetalContext(const MetalContext &) = delete;
  MetalContext &operator=(const MetalContext &) = delete;

  static MetalContext &getInstance() {
    static thread_local MetalContext instance;
    return instance;
  }

  sk_sp<SkSurface> MakeOffscreen(int width, int height) {
    return SkiaMetalSurfaceFactory::makeOffscreenSurface(_device, &_context,
                                                         width, height);
  }

  sk_sp<SkImage> MakeImageFromBuffer(void *buffer) {
    CVPixelBufferRef sampleBuffer = (CVPixelBufferRef)buffer;
    return SkiaMetalSurfaceFactory::makeTextureFromCVPixelBuffer(&_context,
                                                                 sampleBuffer);
  }

  std::unique_ptr<RNSkia::WindowContext> MakeWindow(CALayer *window, int width,
                                                    int height) {
    return SkiaMetalSurfaceFactory::makeContext(&_context, window, width,
                                                height);
  }

  GrDirectContext *getDirectContext() { return _context.skContext.get(); }

private:
  friend class RNSkia::RNSkiOSPlatformContext;
  id<MTLDevice> _device;
  SkiaMetalContext _context;

  MetalContext();
};
