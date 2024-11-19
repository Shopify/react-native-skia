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

#include "WindowContext.h"
#include "opengl/Display.h"

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
  OpenGLWindowContext(Display *display, Context *context,
                      GrDirectContext *directContext, ANativeWindow *window,
                      int width, int height)
      : _directContext(directContext), _context(context), _window(window),
        _width(width), _height(height) {
    // TODO: reuse config?
    auto config = display->chooseConfig();
    _surface = display->makeWindowSurface(config, window);
  }

  ~OpenGLWindowContext() { ANativeWindow_release(_window); }

  sk_sp<SkSurface> getSurface() override;

  void present() override {
    _context->makeCurrent(*_surface);

    // Flush and submit the direct context
    _directContext->flushAndSubmit();

    // Swap buffers
    _surface->Present();
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
  std::unique_ptr<Surface> _surface;
  Context *_context;
  GrDirectContext *_directContext;
  int _width = 0;
  int _height = 0;
};

} // namespace RNSkia
