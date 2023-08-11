#pragma once

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include <fbjni/fbjni.h>
#include <jni.h>

#include "RNSkLog.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkCanvas.h"
#include "SkColorSpace.h"
#include "SkSurface.h"
#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLInterface.h"

#pragma clang diagnostic pop

namespace RNSkia {
struct SkiaOpenGLContext {
  SkiaOpenGLContext() {
    glDisplay = EGL_NO_DISPLAY;
    glContext = EGL_NO_CONTEXT;
    gl1x1Surface = EGL_NO_SURFACE;
    glConfig = 0;
    directContext = nullptr;
  }
  EGLContext glContext;
  EGLDisplay glDisplay;
  EGLConfig glConfig;
  EGLSurface gl1x1Surface;
  sk_sp<GrDirectContext> directContext;
};

class SkiaOpenGLHelper {
public:
  /**
   * Calls eglMakeCurrent on the surface provided using the provided
   * thread context.
   * @param context Skia OpenGL context to use
   * @param surface Surface to set as current
   * @return true if eglMakeCurrent was successfull
   */
  static bool makeCurrent(SkiaOpenGLContext *context, EGLSurface glSurface) {
    // We don't need to call make current if we already are current:
    if (eglGetCurrentDisplay() != context->glDisplay ||
        eglGetCurrentSurface(EGL_DRAW) != glSurface ||
        eglGetCurrentSurface(EGL_READ) != glSurface ||
        eglGetCurrentContext() != context->glContext) {

      // Make current!
      if (eglMakeCurrent(context->glDisplay, glSurface, glSurface,
                         context->glContext) != EGL_TRUE) {
        RNSkLogger::logToConsole("eglMakeCurrent failed: %d\n", eglGetError());
        return false;
      }
      return true;
    }
    return true;
  }

  /**
   * Calls the eglSwapBuffer in the current thread with the provided surface
   * @param context Thread context
   * @param glSurface surface to present
   * @return true if eglSwapBuffers succeeded.
   */
  static bool swapBuffers(SkiaOpenGLContext *context, EGLSurface glSurface) {
    if (eglSwapBuffers(context->glDisplay, glSurface) != EGL_TRUE) {
      RNSkLogger::logToConsole("eglSwapBuffers failed: %d\n", eglGetError());
      return false;
    }
    return true;
  }

  /***
   * Creates a new Skia direct context backed by the provided eglContext in the
   * SkiaOpenGLContext.
   * @param context Context to store results in
   * @param sharedContext Shared Context
   * @return true if the call to create a skia direct context suceeded.
   */
  static bool createSkiaDirectContext(SkiaOpenGLContext *context,
                                      SkiaOpenGLContext *sharedContext) {
    // Initialize OpenGL
    if (!initializeOpenGL(context)) {
      return false;
    }

    // Create the OpenGL context
    if (!createOpenGLContext(context, sharedContext)) {
      return false;
    }

    if (context->directContext == nullptr) {
      // Create attributes for a simple 1x1 pbuffer surface that we can
      // use to activate and create Skia direct context for
      const EGLint offScreenSurfaceAttribs[] = {EGL_WIDTH, 1, EGL_HEIGHT, 1,
                                                EGL_NONE};

      context->gl1x1Surface = eglCreatePbufferSurface(
          context->glDisplay, context->glConfig, offScreenSurfaceAttribs);

      if (context->gl1x1Surface == EGL_NO_SURFACE) {
        RNSkLogger::logToConsole("Failed creating a 1x1 pbuffer surface");
        return false;
      }

      // Activate
      if (!makeCurrent(context, context->gl1x1Surface)) {
        return false;
      }

      // Create the Skia context
      auto backendInterface = GrGLMakeNativeInterface();
      context->directContext = GrDirectContext::MakeGL(backendInterface);

      if (context->directContext == nullptr) {
        RNSkLogger::logToConsole("GrDirectContext::MakeGL failed");
        return false;
      }
    }

    // It all went well!
    return true;
  }

private:
  /**
   * Initializes OpenGL using the provided SkiaOpenGLContext. This means
   * getting the default display and calling eglInitializeContext. If the
   * context already have a valid initialised display nothing will be done and
   * the method will return true.
   * @param context to store resulting eglDisplay in
   * @return True if already initialized or if eglGetDisplay and eglInitialize
   * was successfull.
   */
  static bool initializeOpenGL(SkiaOpenGLContext *context) {
    if (context->glDisplay == EGL_NO_DISPLAY) {
      // Get default display
      context->glDisplay = eglGetDisplay(EGL_DEFAULT_DISPLAY);
      if (context->glDisplay == EGL_NO_DISPLAY) {
        RNSkLogger::logToConsole("eglGetDisplay failed : %i", glGetError());
        return false;
      }

      EGLint major;
      EGLint minor;

      if (eglInitialize(context->glDisplay, &major, &minor) != EGL_TRUE) {
        RNSkLogger::logToConsole("eglInitialize failed : %i", glGetError());
        eglTerminate(context->glDisplay);
        context->glDisplay = EGL_NO_DISPLAY;
        return false;
      }
    }

    return true;
  }

  /**
   * Creates a new GLContext. If the context has a valid context no new context
   * will be created.
   * @param context Context to save results in
   * @param sharedContext Shared OpenGLContext
   * @return True if the call to eglCreateContext returned a valid OpenGL
   * Context or if the context already is setup.
   */
  static bool createOpenGLContext(SkiaOpenGLContext *context,
                                  SkiaOpenGLContext *sharedContext) {
    // No need to create new EGL Context if it already exists.
    if (context->glContext != EGL_NO_CONTEXT) {
      return true;
    }

    // Create config
    context->glConfig = getConfig(context->glDisplay);
    if (context->glConfig == 0) {
      return false;
    }

    // Create OpenGL context attributes
    EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};

    // Initialize the offscreen context for this thread
    context->glContext =
        eglCreateContext(context->glDisplay, context->glConfig,
                         sharedContext->glContext, contextAttribs);

    if (context->glContext == EGL_NO_CONTEXT) {
      RNSkLogger::logToConsole("eglCreateContext failed: %d\n", eglGetError());
      return EGL_NO_CONTEXT;
    }

    // Save to shared context so that we can share data between threads in
    // OpenGL. The first context created will be the one passed to any
    // subsequent EGLContexts created.
    if (sharedContext->glContext == EGL_NO_CONTEXT) {
      sharedContext->glContext = context->glDisplay;
    }

    return true;
  }

  /**
   * Finds the correct EGL Config for the given parameters
   * @param glDisplay
   * @return Config or zero if no matching context could be found.
   */
  static EGLConfig getConfig(EGLDisplay glDisplay) {

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
    if (eglChooseConfig(glDisplay, att, &glConfig, 1, &numConfigs) !=
            EGL_TRUE ||
        numConfigs == 0) {
      RNSkLogger::logToConsole(
          "Failed to choose a config for %s surface. Error code: %d\n",
          eglGetError());
      return 0;
    }

    return glConfig;
  }
};
} // namespace RNSkia