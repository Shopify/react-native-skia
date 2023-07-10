#pragma once

#include <RNSkLog.h>

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include "android/native_window.h"
#include <fbjni/fbjni.h>
#include <jni.h>

#include <condition_variable>
#include <memory>
#include <thread>
#include <unordered_map>

#define STENCIL_BUFFER_SIZE 8

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLInterface.h"

#pragma clang diagnostic pop

namespace RNSkia {

class SkiaOpenGLHelper {
public:
  struct ThreadRenderContext {
    ThreadRenderContext() {
      glConfig = 0;
      glContext = EGL_NO_CONTEXT;
      glDisplay = EGL_NO_DISPLAY;
      skContext = nullptr;
    }
    EGLContext glContext;
    EGLDisplay glDisplay;
    EGLConfig glConfig;
    sk_sp<GrDirectContext> skContext;
  };

  static bool initializeSkiaContext(ThreadRenderContext *context) {
    // Create the Skia Context
    auto backendInterface = GrGLMakeNativeInterface();
    context->skContext = GrDirectContext::MakeGL(backendInterface);

    if (context->skContext == nullptr) {
      RNSkLogger::logToConsole("GrDirectContext::MakeGL failed");
      return false;
    }

    return true;
  }

  static bool initializeOpenGL(ThreadRenderContext *context,
                               int surfaceType = EGL_WINDOW_BIT,
                               EGLContext parent = EGL_NO_CONTEXT) {
    // Get default context
    context->glDisplay = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    if (context->glDisplay == EGL_NO_DISPLAY) {
      RNSkLogger::logToConsole("eglGetdisplay failed : %i", glGetError());
      return false;
    }

    EGLint major;
    EGLint minor;

    if (!eglInitialize(context->glDisplay, &major, &minor)) {
      RNSkLogger::logToConsole("eglInitialize failed : %i", glGetError());
      return false;
    }

    EGLint att[] = {EGL_RENDERABLE_TYPE,
                    EGL_OPENGL_ES2_BIT,
                    EGL_SURFACE_TYPE,
                    surfaceType,
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
                    EGL_NONE};

    EGLint numConfigs;
    context->glConfig = 0;
    if (!eglChooseConfig(context->glDisplay, att, &context->glConfig, 1,
                         &numConfigs) ||
        numConfigs == 0) {
      RNSkLogger::logToConsole("Failed to choose a config %d\n", eglGetError());
      return false;
    }

    EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};

    context->glContext = eglCreateContext(context->glDisplay, context->glConfig,
                                          parent, contextAttribs);

    if (context->glContext == EGL_NO_CONTEXT) {
      RNSkLogger::logToConsole("eglCreateContext failed: %d\n", eglGetError());
      return false;
    }

    return true;
  }
};
} // namespace RNSkia