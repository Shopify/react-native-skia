#pragma once

#include "WindowContext.h"
#include "SkiaMetalSurfaceFactory.h"

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

  std::unique_ptr<RNSkia::WindowContext> MakeOffscreen(void* window, int width, int height) {
    return SkiaMetalSurfaceFactory::makeContext((__bridge *CALayer)window, width, height);
  }


private:
    MetalContext() {

    }
};