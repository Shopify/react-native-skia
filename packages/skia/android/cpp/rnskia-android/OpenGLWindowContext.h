#pragma once

#include "RNSkLog.h"

#include <fbjni/fbjni.h>
#include <jni.h>

#include <android/native_window_jni.h>
#include <android/surface_texture.h>
#include <android/surface_texture_jni.h>
#include <condition_variable>
#include <memory>
#include <stdexcept>
#include <thread>
#include <unordered_map>

#include "RNWindowContext.h"
#include "gl/Display.h"

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

class OpenGLWindowContext : public WindowContext {
public:
  OpenGLWindowContext(GrDirectContext *directContext, gl::Display *display,
                      gl::Context *glContext, ANativeWindow *window,
                      EGLConfig config)
      : _directContext(directContext), _glContext(glContext), _window(window) {
    ANativeWindow_acquire(_window);
    _glSurface = display->makeWindowSurface(config, _window);
    _ownerThread = std::this_thread::get_id();
  }

  ~OpenGLWindowContext() override {
    _skSurface = nullptr;
    _glSurface = nullptr;
    ANativeWindow_release(_window);
  }

  sk_sp<SkSurface> getSurface() override;

  void present() override;

  int getWidth() override { return ANativeWindow_getWidth(_window); };

  int getHeight() override { return ANativeWindow_getHeight(_window); };

  void resize(int width, int height) override {
    assertThread("resize");
    if (_skSurface != nullptr) {
      // Let's make sure there is no pending work
      _glContext->makeCurrent(_glSurface.get());
      _glSurface->present();
      _skSurface = nullptr;
    }
  }

private:
  void assertThread(const char *op) const {
    if (_ownerThread != std::this_thread::get_id()) {
      RNSkLogger::logToConsole(
          "OpenGLWindowContext %s called from a different thread. "
          "The OpenGL backend is thread-affine; ensure all Skia/OpenGL calls "
          "run on a single thread.",
          op);
      throw std::runtime_error(
          "OpenGLWindowContext used from multiple threads");
    }
  }

  GrDirectContext *_directContext;
  gl::Context *_glContext = nullptr;
  ANativeWindow *_window;
  sk_sp<SkSurface> _skSurface = nullptr;
  std::unique_ptr<gl::Surface> _glSurface = nullptr;
  std::thread::id _ownerThread;
};

} // namespace RNSkia
