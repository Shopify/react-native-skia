#pragma once

#include "SkiaOpenGLSurfaceFactory.h"

#include "WindowContext.h"
#include "opengl/Display.h"

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
    return RNSkia::SkiaOpenGLSurfaceFactory::makeOffscreenSurface(
        &_context, width, height);
  }

  sk_sp<SkImage> MakeImageFromBuffer(void *buffer) {
    return RNSkia::SkiaOpenGLSurfaceFactory::makeImageFromHardwareBuffer(
        &_context, buffer);
  }

  std::unique_ptr<RNSkia::WindowContext> MakeWindow(ANativeWindow *window,
                                                    int width, int height) {
    return RNSkia::SkiaOpenGLSurfaceFactory::makeContext(&_context, window,
                                                         width, height);
  }

private:
  RNSkia::SkiaOpenGLContext _context;
  std::unique_ptr<RNSkia::Display> _display;
  sk_sp<GrDirectContext> directContext;

  OpenGLContext() {
    _display = std::make_unique<RNSkia::Display>();
    RNSkia::SkiaOpenGLHelper::createSkiaDirectContextIfNecessary(&_context);
  }
};
