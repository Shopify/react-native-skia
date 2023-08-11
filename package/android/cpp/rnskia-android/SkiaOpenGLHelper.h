#pragma once

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include <fbjni/fbjni.h>
#include <jni.h>

#include <atomic>

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

/**
 * Singleton holding the default display and shared eglContext that will be the
 * first context we create so that we can share data between contexts.
 */
class OpenGLResourceHolder {
private:
  OpenGLResourceHolder() {}
  ~OpenGLResourceHolder() {
    if (glContext != EGL_NO_CONTEXT) {
      eglDestroyContext(glDisplay, glContext);
      glContext = EGL_NO_CONTEXT;
    }

    if (glDisplay != EGL_NO_DISPLAY) {
      eglTerminate(glDisplay);
      glDisplay = EGL_NO_DISPLAY;
    }
  }
  /* Explicitly disallow copying. */
  OpenGLResourceHolder(const OpenGLResourceHolder &) = delete;
  OpenGLResourceHolder &operator=(const OpenGLResourceHolder &) = delete;

public:
  static OpenGLResourceHolder &getInstance() {
    static OpenGLResourceHolder Instance;
    return Instance;
  }

  /**
   * The first context created will be considered the parent / shared context
   * and will be used as the parent / shareable context when creating subsequent
   * contexts.
   */
  EGLContext glContext = EGL_NO_CONTEXT;
  /**
   * Shared egl display
   */
  EGLDisplay glDisplay = EGL_NO_DISPLAY;
};

struct SkiaOpenGLContext {
  SkiaOpenGLContext() {
    glContext = EGL_NO_CONTEXT;
    gl1x1Surface = EGL_NO_SURFACE;
    glConfig = 0;
    directContext = nullptr;
  }
  ~SkiaOpenGLContext() {
    if (OpenGLResourceHolder::getInstance().glDisplay != EGL_NO_DISPLAY) {

      if (gl1x1Surface != EGL_NO_SURFACE) {
        eglDestroySurface(OpenGLResourceHolder::getInstance().glDisplay,
                          gl1x1Surface);
        gl1x1Surface = EGL_NO_SURFACE;
      }

      if (directContext) {
        directContext->releaseResourcesAndAbandonContext();
      }

      if (glContext != EGL_NO_CONTEXT) {
        eglDestroyContext(OpenGLResourceHolder::getInstance().glDisplay,
                          glContext);
        glContext = EGL_NO_CONTEXT;
      }
    }
  }
  EGLContext glContext;
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
    if (eglGetCurrentSurface(EGL_DRAW) != glSurface ||
        eglGetCurrentSurface(EGL_READ) != glSurface ||
        eglGetCurrentContext() != context->glContext) {

      // Make current!
      if (eglMakeCurrent(OpenGLResourceHolder::getInstance().glDisplay,
                         glSurface, glSurface,
                         context->glContext) != EGL_TRUE) {
        RNSkLogger::logToConsole("eglMakeCurrent failed: %d\n", eglGetError());
        return false;
      }
      return true;
    }
    return true;
  }

  /**
   * Creates a new windowed surface
   * @param window ANativeWindow to create surface in
   * @return EGLSurface or EGL_NO_SURFACE if the call failed
   */
  static EGLSurface createWindowedSurface(ANativeWindow *window) {
    const EGLint attribs[] = {EGL_NONE};
    return eglCreateWindowSurface(
        OpenGLResourceHolder::getInstance().glDisplay,
        getConfig(OpenGLResourceHolder::getInstance().glDisplay), window,
        attribs);
  }

  /**
   * Destroys an egl surface
   * @param glSurface
   * @return
   */
  static bool destroySurface(EGLSurface glSurface) {
    if (!eglMakeCurrent(OpenGLResourceHolder::getInstance().glDisplay,
                        EGL_NO_SURFACE, EGL_NO_SURFACE,
                        EGL_NO_CONTEXT) == EGL_TRUE) {
      RNSkLogger::logToConsole(
          "destroySurface: Could not clear selected surface");
      return false;
    }
    return eglDestroySurface(OpenGLResourceHolder::getInstance().glDisplay,
                             glSurface) == EGL_TRUE;
  }

  /**
   * Calls the eglSwapBuffer in the current thread with the provided surface
   * @param context Thread context
   * @param glSurface surface to present
   * @return true if eglSwapBuffers succeeded.
   */
  static bool swapBuffers(SkiaOpenGLContext *context, EGLSurface glSurface) {
    if (eglSwapBuffers(OpenGLResourceHolder::getInstance().glDisplay,
                       glSurface) != EGL_TRUE) {
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
  static bool createSkiaDirectContext(SkiaOpenGLContext *context) {
    // Initialize OpenGL
    if (!initializeOpenGL()) {
      return false;
    }

    // Create the OpenGL context
    if (!createOpenGLContext(context)) {
      return false;
    }

    if (context->directContext == nullptr) {
      // Create attributes for a simple 1x1 pbuffer surface that we can
      // use to activate and create Skia direct context for
      const EGLint offScreenSurfaceAttribs[] = {EGL_WIDTH, 1, EGL_HEIGHT, 1,
                                                EGL_NONE};

      context->gl1x1Surface =
          eglCreatePbufferSurface(OpenGLResourceHolder::getInstance().glDisplay,
                                  context->glConfig, offScreenSurfaceAttribs);

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
   * @return True if already initialized or if eglGetDisplay and eglInitialize
   * was successfull.
   */
  static bool initializeOpenGL() {
    if (OpenGLResourceHolder::getInstance().glDisplay == EGL_NO_DISPLAY) {
      // Get default display
      OpenGLResourceHolder::getInstance().glDisplay =
          eglGetDisplay(EGL_DEFAULT_DISPLAY);
      if (OpenGLResourceHolder::getInstance().glDisplay == EGL_NO_DISPLAY) {
        RNSkLogger::logToConsole("eglGetDisplay failed : %i", glGetError());
        return false;
      }

      EGLint major;
      EGLint minor;

      if (eglInitialize(OpenGLResourceHolder::getInstance().glDisplay, &major,
                        &minor) != EGL_TRUE) {
        RNSkLogger::logToConsole("eglInitialize failed : %i", glGetError());
        return false;
      }
    }

    return true;
  }

  /**
   * Creates a new GLContext. If the context has a valid context no new context
   * will be created.
   * @param context Context to save results in
   * @return True if the call to eglCreateContext returned a valid OpenGL
   * Context or if the context already is setup.
   */
  static bool createOpenGLContext(SkiaOpenGLContext *context) {
    // No need to create new EGL Context if it already exists.
    if (context->glContext != EGL_NO_CONTEXT) {
      return true;
    }

    // Create config
    context->glConfig =
        getConfig(OpenGLResourceHolder::getInstance().glDisplay);
    if (context->glConfig == 0) {
      return false;
    }

    // Create OpenGL context attributes
    EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};

    // Initialize the offscreen context for this thread
    context->glContext = eglCreateContext(
        OpenGLResourceHolder::getInstance().glDisplay, context->glConfig,
        OpenGLResourceHolder::getInstance().glContext, contextAttribs);

    if (context->glContext == EGL_NO_CONTEXT) {
      RNSkLogger::logToConsole("eglCreateContext failed: %d\n", eglGetError());
      return EGL_NO_CONTEXT;
    }

    // Save to shared context so that we can share data between threads in
    // OpenGL. The first context created will be the one passed to any
    // subsequent EGLContexts created.
    if (OpenGLResourceHolder::getInstance().glContext == EGL_NO_CONTEXT) {
      OpenGLResourceHolder::getInstance().glContext = context->glContext;
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