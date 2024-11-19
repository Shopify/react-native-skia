#pragma once

#include <memory>

#include "EGL/egl.h"
#include "GLES2/gl2.h"

#include "opengl/Error.h"

namespace RNSkia {

class Context;
class Surface;

class Display {
public:
  Display() {
    EGLDisplay display = eglGetDisplay(EGL_DEFAULT_DISPLAY);

    if (eglInitialize(display, nullptr, nullptr) != EGL_TRUE) {
      LOG_EGL_ERROR;
      return;
    }
    display_ = display;
  }

  virtual ~Display() {
    if (display_ != EGL_NO_DISPLAY) {
      if (eglTerminate(display_) != EGL_TRUE) {
        LOG_EGL_ERROR;
      }
    }
  }

  bool isValid() const { return _display != EGL_NO_DISPLAY; }

  EGLConfig ChooseConfig() const {

    EGLint att[] = {EGL_RENDERABLE_TYPE,
                    EGL_OPENGL_ES2_BIT,
                    EGL_ALPHA_SIZE,
                    8,
                    EGL_BLUE_SIZE,
                    8,
                    EGL_GREEN_SIZE,
                    8,
                    EGL_RED_SIZE,
                    8,
                    EGL_DEPTH_SIZE,
                    0,
                    EGL_STENCIL_SIZE,
                    0,
                    EGL_SAMPLE_BUFFERS,
                    0,
                    EGL_NONE};

    EGLint numConfigs;
    EGLConfig glConfig = 0;
    if (eglChooseConfig(_display, att, &glConfig, 1, &numConfigs) != EGL_TRUE ||
        numConfigs == 0) {
      LOG_EGL_ERROR;
      return 0;
    }

    return glConfig;
  }

  std::unique_ptr<Context> CreateContext(const Config &config,
                                         const Context *share_context) {}

  std::unique_ptr<Surface> CreateWindowSurface(const Config &config,
                                               EGLNativeWindowType window) {
    const EGLint attribs[] = {EGL_NONE};
    auto surface = eglCreateWindowSurface(display_,           // display
                                          config.GetHandle(), // config
                                          window,             // window
                                          attribs             // attrib_list
    );
    if (surface == EGL_NO_SURFACE) {
      IMPELLER_LOG_EGL_ERROR;
      return nullptr;
    }
    return std::unique_ptr<Surface>(new Surface(display_, surface));
  }

  std::unique_ptr<Surface>
  CreatePixelBufferSurface(const Config &config, size_t width, size_t height) {
    const EGLint attribs[] = {EGL_WIDTH, static_cast<EGLint>(width), EGL_HEIGHT,
                              static_cast<EGLint>(height), EGL_NONE};
    auto surface =
        eglCreatePbufferSurface(_display, config.getHandle(), attribs);
    if (surface == EGL_NO_SURFACE) {
      LOG_EGL_ERROR;
      return nullptr;
    }
    return std::unique_ptr<Surface>(new Surface(_display, surface));
  }

  const EGLDisplay &GetHandle() const { return _display; }

private:
  EGLDisplay _display = EGL_NO_DISPLAY;

  Display(const Display &) = delete;

  Display &operator=(const Display &) = delete;
};

} // namespace RNSkia
