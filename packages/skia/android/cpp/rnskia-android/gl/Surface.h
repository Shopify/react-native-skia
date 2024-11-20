#pragma once

#include "gl/Error.h"

namespace gl {

class Surface {
public:
  ~Surface() {
    if (_surface != EGL_NO_SURFACE) {
      if (eglDestroySurface(_display, _surface) != EGL_TRUE) {
        LOG_EGL_ERROR;
      }
    }
  }

  bool isValid() { return _surface != EGL_NO_SURFACE; }

  const EGLSurface &getHandle() const { return _surface; }

  bool present() const {
    const auto result = eglSwapBuffers(_display, _surface) == EGL_TRUE;
    if (!result) {
      LOG_EGL_ERROR;
    }
    return result;
  }

private:
  friend class Display;

  EGLDisplay _display = EGL_NO_DISPLAY;
  EGLSurface _surface = EGL_NO_SURFACE;

  Surface(EGLDisplay display, EGLSurface surface)
      : _display(display), _surface(surface) {}

  Surface(const Surface &) = delete;

  Surface &operator=(const Surface &) = delete;
};

} // Namespace gl