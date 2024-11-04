#pragma once

#pragma once

#include "SkiaOpenGLSurfaceFactory.h"
#include "WindowContext.h"

#include "include/core/SkSurface.h"

class OpenGLContext {
public:
  OpenGLContext(const OpenGLContext &) = delete;
  OpenGLContext &operator=(const OpenGLContext &) = delete;

  static OpenGLContext &getInstance() {
    static thread_local OpenGLContext instance;
    return instance;
  }

  sk_sp<SkSurface> MakeOffscreen(int width, int height) {
    return RNSkia::SkiaOpenGLSurfaceFactory::makeOffscreenSurface(width,
                                                                  height);
  }

  sk_sp<SkImage> MakeImageFromBuffer(void *buffer) {
    return RNSkia::SkiaOpenGLSurfaceFactory::makeImageFromHardwareBuffer(
        buffer);
  }

  std::unique_ptr<RNSkia::WindowContext> MakeWindow(ANativeWindow *window,
                                                    int width, int height) {
    return RNSkia::SkiaOpenGLSurfaceFactory::makeContext(window, width, height);
  }

private:
  OpenGLContext() {}
};
