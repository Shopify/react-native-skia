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

class OpenGLContext;

class OpenGLWindowContext : public WindowContext {
public:
  OpenGLWindowContext(OpenGLContext *context, ANativeWindow *window);

  ~OpenGLWindowContext() {
    _skSurface = nullptr;
    _glSurface = nullptr;
    ANativeWindow_release(_window);
  }

  sk_sp<SkSurface> getSurface() override;

  void present() override;

  int getWidth() override { return _width; };

  int getHeight() override { return _height; };

private:
  OpenGLContext *_context;
  ANativeWindow *_window;
  sk_sp<SkSurface> _skSurface = nullptr;
  std::unique_ptr<gl::Surface> _glSurface;
  int _width = 0;
  int _height = 0;
};

} // namespace RNSkia
