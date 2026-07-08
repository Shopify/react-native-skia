#pragma once

#include <cstring>
#include <memory>

#include "EGL/egl.h"
#include "GLES2/gl2.h"

#include "gl/Context.h"
#include "gl/Error.h"

#ifndef EGL_NO_CONFIG_KHR
#define EGL_NO_CONFIG_KHR ((EGLConfig)0)
#endif

namespace gl {

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
    _display = display;
  }

  ~Display() {
    if (_display != EGL_NO_DISPLAY) {
      if (eglTerminate(_display) != EGL_TRUE) {
        LOG_EGL_ERROR;
      }
    }
  }

  bool isValid() const { return _display != EGL_NO_DISPLAY; }

  void clearContext() {
    eglMakeCurrent(_display, EGL_NO_SURFACE, EGL_NO_SURFACE, EGL_NO_CONTEXT);
  }

  // With highBitDepth, requests a 10-bit (RGB10_A2) window config for banding
  // free gradients. Returns 0 if no matching config exists so the caller can
  // fall back to the default 8-bit config.
  EGLConfig chooseConfig(bool highBitDepth = false) {
    EGLint colorDepth = highBitDepth ? 10 : 8;
    EGLint alphaDepth = highBitDepth ? 2 : 8;
    EGLint att[] = {EGL_RENDERABLE_TYPE,
                    EGL_OPENGL_ES2_BIT,
                    EGL_SURFACE_TYPE,
                    EGL_WINDOW_BIT | EGL_PBUFFER_BIT,
                    EGL_ALPHA_SIZE,
                    alphaDepth,
                    EGL_BLUE_SIZE,
                    colorDepth,
                    EGL_GREEN_SIZE,
                    colorDepth,
                    EGL_RED_SIZE,
                    colorDepth,
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
      if (!highBitDepth) {
        LOG_EGL_ERROR;
      }
      return 0;
    }

    return glConfig;
  }

  // A context created with EGL_KHR_no_config_context is compatible with
  // surfaces of any config, which lets a single shared context (and a single
  // GrDirectContext) drive both 8-bit and 10-bit window surfaces.
  bool supportsNoConfigContext() {
    const char *extensions = eglQueryString(_display, EGL_EXTENSIONS);
    return extensions != nullptr &&
           strstr(extensions, "EGL_KHR_no_config_context") != nullptr;
  }

  std::unique_ptr<Context> makeContext(const EGLConfig &config,
                                       const Context *share_context) {
    EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};
    auto shareHandle =
        share_context != nullptr ? share_context->getHandle() : nullptr;
    EGLContext context = EGL_NO_CONTEXT;
    if (supportsNoConfigContext()) {
      context = eglCreateContext(_display, EGL_NO_CONFIG_KHR, shareHandle,
                                 contextAttribs);
    }
    if (context == EGL_NO_CONTEXT) {
      context = eglCreateContext(_display, config, shareHandle, contextAttribs);
    }

    if (context == EGL_NO_CONTEXT) {
      LOG_EGL_ERROR;
      return nullptr;
    }
    return std::unique_ptr<Context>(new Context(_display, context));
  }

  std::unique_ptr<Surface> makeWindowSurface(const EGLConfig &config,
                                             ANativeWindow *window) {
    const EGLint attribs[] = {EGL_NONE};
    auto surface = eglCreateWindowSurface(_display, config, window, attribs);
    if (surface == EGL_NO_SURFACE) {
      LOG_EGL_ERROR;
      return nullptr;
    }
    return std::make_unique<Surface>(_display, surface);
  }

  std::unique_ptr<Surface> makePixelBufferSurface(const EGLConfig &config,
                                                  size_t width, size_t height) {
    const EGLint attribs[] = {EGL_WIDTH, static_cast<EGLint>(width), EGL_HEIGHT,
                              static_cast<EGLint>(height), EGL_NONE};
    auto surface = eglCreatePbufferSurface(_display, config, attribs);
    if (surface == EGL_NO_SURFACE) {
      LOG_EGL_ERROR;
      return nullptr;
    }
    return std::make_unique<Surface>(_display, surface);
  }

  const EGLDisplay &getHandle() const { return _display; }

private:
  EGLDisplay _display = EGL_NO_DISPLAY;

  Display(const Display &) = delete;

  Display &operator=(const Display &) = delete;
};

} // namespace gl
