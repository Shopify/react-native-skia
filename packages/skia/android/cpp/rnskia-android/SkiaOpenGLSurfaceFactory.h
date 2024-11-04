#pragma once

#include "RNSkLog.h"

#include <fbjni/fbjni.h>
#include <jni.h>

#include <android/native_window_jni.h>
#include <android/surface_texture.h>
#include <android/surface_texture_jni.h>
#include <condition_variable>
#include <memory>
#include <thread>
#include <unordered_map>

#include "SkiaOpenGLHelper.h"
#include "WindowContext.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkCanvas.h"
#include "include/core/SkColorSpace.h"
#include "include/core/SkSurface.h"
#include "include/gpu/ganesh/GrBackendSurface.h"
#include "include/gpu/ganesh/GrDirectContext.h"
#include "include/gpu/ganesh/SkSurfaceGanesh.h"
#include "include/gpu/ganesh/gl/GrGLInterface.h"

#pragma clang diagnostic pop

namespace RNSkia {

class AndroidSkiaContext : public WindowContext {
public:
  AndroidSkiaContext(SkiaOpenGLContext *context, ANativeWindow *window,
                     int width, int height)
      : _context(context), _window(window), _width(width), _height(height) {}

  ~AndroidSkiaContext() = default;

  sk_sp<SkSurface> getSurface() override;

  void present() override {
    if (!SkiaOpenGLHelper::makeCurrent(_context, _glSurface)) {
      RNSkLogger::logToConsole(
          "Could not create EGL Surface from native window / surface. Could "
          "not set new surface as current surface.");
      return;
    }
    // Flush and submit the direct context
    _context->directContext->flushAndSubmit();

    // Swap buffers
    SkiaOpenGLHelper::swapBuffers(_context, _glSurface);
  }

  void resize(int width, int height) override {
    _skSurface = nullptr;
    _width = width;
    _height = height;
  }

  int getWidth() override { return _width; };

  int getHeight() override { return _height; };

private:
  ANativeWindow *_window;
  sk_sp<SkSurface> _skSurface = nullptr;
  EGLSurface _glSurface = EGL_NO_SURFACE;
  SkiaOpenGLContext *_context;
  int _width = 0;
  int _height = 0;
};

class SkiaOpenGLSurfaceFactory {
public:
  /**
   * Creates a new Skia surface that is backed by a texture.
   * @param width Width of surface
   * @param height Height of surface
   * @return An SkSurface backed by a texture.
   */
  static sk_sp<SkSurface> makeOffscreenSurface(SkiaOpenGLContext *context,
                                               int width, int height);

  static sk_sp<SkImage>
  makeImageFromHardwareBuffer(SkiaOpenGLContext *context, void *buffer,
                              bool requireKnownFormat = false);

  static std::unique_ptr<AndroidSkiaContext>
  makeContext(SkiaOpenGLContext *context, ANativeWindow *surface, int width,
              int height) {
    return std::make_unique<AndroidSkiaContext>(context, surface, width,
                                                height);
  }
};

} // namespace RNSkia
