#pragma once

#include <RNSkLog.h>

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include "android/native_window.h"
#include <fbjni/fbjni.h>
#include <jni.h>

#include <android/native_window_jni.h>
#include <condition_variable>
#include <memory>
#include <thread>
#include <unordered_map>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkCanvas.h"
#include "SkColorSpace.h"
#include "SkPicture.h"
#include "SkSurface.h"
#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLInterface.h"

#pragma clang diagnostic pop

namespace RNSkia {

enum SkiaSurfaceType { Window, Offscreen };

struct SurfaceFactoryContext {
  SurfaceFactoryContext() {
    glDisplay = EGL_NO_DISPLAY;
    glContext = EGL_NO_CONTEXT;
    directContext = nullptr;
  }
  EGLContext glContext;
  EGLDisplay glDisplay;
  sk_sp<GrDirectContext> directContext;
};

/**
 * BaseSkiaSurfaceFactory: Class that implements the base logic for setting up
 * and configuring OpenGL and Skia using either windowed or offscreen OpenGL
 * surfaces. This class and its sub classes are responsible for sharing OpenGL
 * contexts across threads while taking care of setting of OpenGL in a suitable
 * way for the given type of surface.
 *
 * OpenGL / Skia - order of initialization
 *
 * Thread:
 * - eglGetDisplay    -> default display
 * - eglInitialize    -> initializes the display if needed
 * - eglChooseConfig  -> finds the requested configuration
 * - eglCreateContext -> creates the context for the current thread
 *
 * SkiaRenderContext:
 * - eglCreateWindowSurface / eglCreatePBufferSurface
 * - eglMakeCurrent
 * - GrDirectContext::MakeGL()
 *
 * On each render:
 * - eglMakeCurrent()
 * - SkSurface::MakeFromBackendRenderTarget with release proc
 *
 * A windowed OpenGL surface can share almost anything except the surface /
 * _glSurface object (of course) since they are bound to the current window
 *
 * An offscreen OpenGL surface needs its own context since we cannot ensure that
 * this is called, so we need to have a separate OpenGL / GrDirectContext for
 * each one.
 *
 * They all share the first OpenGL context created so that shaders and textures
 * and other GPU resources are available cross surfaces.
 */
class BaseSkiaSurfaceFactory {
public:
  /**
   * Call to notify that the surface has been resized
   * @param width
   * @param height
   */
  bool resize(int width, int height);

  /**
   * Calls OpenGL makeCurrent
   * @return
   */
  bool makeCurrent();

  /**
   * Creates a new Skia Surface based on the current configuration and
   * underlying contexts. The surface will live as long as there are references
   * to it, meaning that the Skia Surface Factory that created the surface can
   * be deleted.
   * @return
   */
  sk_sp<SkSurface> createSkSurface();

protected:
  /**
   * CTOR for the Base Skia Surface Factory class
   * @param type Type, offscreen or windowed
   * @param width width of surface
   * @param height height of surface
   */
  BaseSkiaSurfaceFactory(SkiaSurfaceType type, int width, int height);

  /**
   * Returns the OpenGL configuration for the given display and render type
   * @param glDisplay Display to get config for
   * @param type Requested surface type, offscreen or windowed
   * @return A valid GLConfig or 0
   */
  static EGLConfig getConfig(EGLDisplay glDisplay, SkiaSurfaceType type);

  /**
   * Creates the OpenGL context based on the given surface type
   * @param glDisplay Display to get config for
   * @param type Requested surface type, offscreen or windowed
   * @return A valid GLContext or EGL_NO_CONTEXT
   */
  static EGLContext createOpenGLContext(EGLDisplay glDisplay,
                                        SkiaSurfaceType type);

  /**
   * Creates an OpenGL surface for the given configuration found in the provided
   * context
   * @param context SurfaceFactoryContext containing the current OpenGL / Skia
   * context
   * @return A valid OpenGL surface of the requested type
   */
  virtual EGLSurface createOpenGLSurface(SurfaceFactoryContext *context) = 0;
  EGLSurface _glSurface = EGL_NO_SURFACE;

  /*
   * Virtual method for providing the context that should be used. Some surface
   * types works well with sharing contexts, while others needs to have a local
   * context.
   */
  virtual SurfaceFactoryContext *getContext() = 0;

  /**
   * Creates a function that will release any resources aquired when the surface
   * was created so that we can clean up when the Skia Surface is destroyed and
   * not when the factory is destroyed.
   * @return A function that will release any resources aquired.
   */
  virtual std::function<void(SurfaceFactoryContext *context)>
  getSurfaceReleasedProc() = 0;

  /**
   * Initializes OpenGL with the given context
   * @param context Context to save initialized members to
   * @return True on success
   */
  static bool initializeOpenGL(SurfaceFactoryContext *context);

  static thread_local SurfaceFactoryContext _ThreadContext;
  static EGLContext _SharedEglContext;

  SkiaSurfaceType _type;
  int _width;
  int _height;
};

/**
 * The window render context can use a thread local shared context for rendering
 * and will render to a native window, ie a surface from the Java side of
 * things.
 */
class WindowedSurfaceFactory : public BaseSkiaSurfaceFactory {
public:
  WindowedSurfaceFactory(jobject surface, int width, int height)
      : BaseSkiaSurfaceFactory(SkiaSurfaceType::Window, width, height),
        _window(ANativeWindow_fromSurface(facebook::jni::Environment::current(),
                                          surface)) {}

  bool beginRender() {
    if (!makeCurrent()) {
      return false;
    }

    // This is needed since we might be sharing the direct context
    getContext()->directContext->resetContext();
    return true;
  }

  bool commitRender() {
    _ThreadContext.directContext->flushAndSubmit();

    if (!eglSwapBuffers(_ThreadContext.glDisplay, _glSurface)) {
      RNSkLogger::logToConsole("eglSwapBuffers failed: %d\n", eglGetError());
      return false;
    }

    return true;
  }

protected:
  EGLSurface createOpenGLSurface(SurfaceFactoryContext *context) override {
    auto config = getConfig(context->glDisplay, _type);
    if (config == 0) {
      return EGL_NO_SURFACE;
    }

    return eglCreateWindowSurface(context->glDisplay, config, _window, nullptr);
  }

  SurfaceFactoryContext *getContext() override { return &_ThreadContext; }

  std::function<void(SurfaceFactoryContext *context)>
  getSurfaceReleasedProc() override {
    return [window = _window](SurfaceFactoryContext *) {
      ANativeWindow_release(window);
    };
  }

private:
  ANativeWindow *_window;
};

/**
 * The offscreen render context needs a separate GrDirectContext for each
 * offscreen buffer - because otherwise there will be sharing / state issues
 * that we solve by calling resetContext in the renderer (which we don't have
 * here)
 */
class OffscreenSurfaceFactory : public BaseSkiaSurfaceFactory {
public:
  OffscreenSurfaceFactory(int width, int height)
      : BaseSkiaSurfaceFactory(SkiaSurfaceType::Offscreen, width, height),
        _skiaOpenGlContext(new SurfaceFactoryContext()) {}

  EGLSurface createOpenGLSurface(SurfaceFactoryContext *context) override {
    const EGLint offScreenSurfaceAttribs[] = {EGL_WIDTH, _width, EGL_HEIGHT,
                                              _height, EGL_NONE};

    auto config = getConfig(context->glDisplay, _type);
    if (config == 0) {
      return EGL_NO_SURFACE;
    }

    return eglCreatePbufferSurface(context->glDisplay, config,
                                   offScreenSurfaceAttribs);
  }

  SurfaceFactoryContext *getContext() override { return _skiaOpenGlContext; }

  std::function<void(SurfaceFactoryContext *context)>
  getSurfaceReleasedProc() override {
    return [ctxToDelete = _skiaOpenGlContext](SurfaceFactoryContext *context) {
      // Don't destroy the shared GL Context!
      if (context->glContext != EGL_NO_CONTEXT &&
          context->glContext != _SharedEglContext) {
        eglDestroyContext(context->glDisplay, context->glContext);
        context->glContext = EGL_NO_CONTEXT;
        delete ctxToDelete;
      }
    };
  }

private:
  SurfaceFactoryContext *_skiaOpenGlContext;
};
} // namespace RNSkia