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

struct SurfaceFactoryContext {
  SurfaceFactoryContext() {
    glDisplay = EGL_NO_DISPLAY;
    glContext = EGL_NO_CONTEXT;
    glConfig = 0;
    directContext = nullptr;
  }
  EGLContext glContext;
  EGLDisplay glDisplay;
  EGLConfig glConfig;
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
 * - eglCreateWindowSurface / eglCreatePBufferSurface
 * - eglMakeCurrent
 * - GrDirectContext::MakeGL()
 * - Create Skia backend and direct context
 *
 * So the principle will be: for a single thread we'll have a glDisplay,
 * glContext and a direct Skia context (GrDirectContext). The glContext will be
 * created with the shared context parameter so that we can share gpu resources
 * created by Skia on multiple threads (think javascript and main thread).
 *
 * When creating windowed surfaces we just create a glSurface using
 * eglCreateWindowedSurface, and then a SkSurface using a backend render target
 * pointing to the windowed surface.
 *
 * When creating offscreen surfaces we create a simple 1x1 pbuffer surface, and
 * then create a texture using the Skia direct context's createBackendTexture.
 * Then we can create an SkSurface wrapping the backend texture surface.
 *
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
   * @param width width of surface
   * @param height height of surface
   */
  BaseSkiaSurfaceFactory(int width, int height);

  /**
   * Returns the OpenGL configuration for the given display and render type
   * @param glDisplay Display to get config for
   * @return A valid GLConfig or 0
   */
  static EGLConfig getConfig(EGLDisplay glDisplay);

  /**
   * Creates the OpenGL context based on the given surface type
   * @param glDisplay Display to get config for
   * @param glConfig Configuration to use when creating the context
   * @param sharedglContext Shared / parent context
   * @return A valid GLContext or EGL_NO_CONTEXT
   */
  static EGLContext createOpenGLContext(EGLDisplay glDisplay,
                                        EGLConfig glConfig,
                                        EGLContext sharedglContext);

  /**
   * Creates an OpenGL surface for the given configuration found in the provided
   * context
   * @param context SurfaceFactoryContext containing the current OpenGL / Skia
   * context
   * @return A valid OpenGL surface of the requested type
   */
  virtual EGLSurface createOpenGLSurface(SurfaceFactoryContext *context) = 0;
  EGLSurface _glSurface = EGL_NO_SURFACE;

  /**
   * Creates the SkSurface from a valid Skia surface. This method is where we
   * bind the SkSurface to the created underlying surface.
   * @param context
   * @param glSurface
   * @param colorType
   * @return
   */
  virtual sk_sp<SkSurface>
  createSkSurfaceFromContext(SurfaceFactoryContext *context,
                             EGLSurface glSurface, SkColorType colorType);

  /*
   * Virtual method for providing the context that should be used. Some surface
   * types works well with sharing contexts, while others needs to have a local
   * context.
   */
  virtual SurfaceFactoryContext *getContext() {
    return &ThreadedSkiaOpenGlContext;
  }

  /**
   * Initializes OpenGL with the given context
   * @param context Context to save initialized members to
   * @return True on success
   */
  static bool initializeOpenGL(SurfaceFactoryContext *context);

  static BaseSkiaSurfaceFactory *SharedContext;
  static thread_local SurfaceFactoryContext ThreadedSkiaOpenGlContext;

  int _width;
  int _height;
};

/**
 * Factory for creating a windowed surface
 */
class WindowedSurfaceFactory : public BaseSkiaSurfaceFactory {
public:
  WindowedSurfaceFactory(jobject surface, int width, int height)
      : BaseSkiaSurfaceFactory(width, height),
        _window(ANativeWindow_fromSurface(facebook::jni::Environment::current(),
                                          surface)) {}

  ~WindowedSurfaceFactory() { ANativeWindow_release(_window); }

  bool present() {
    if (!eglSwapBuffers(getContext()->glDisplay, _glSurface)) {
      RNSkLogger::logToConsole("eglSwapBuffers failed: %d\n", eglGetError());
      return false;
    }

    return true;
  }

protected:
  EGLSurface createOpenGLSurface(SurfaceFactoryContext *context) override {
    const EGLint attribs[] = {EGL_NONE};
    return eglCreateWindowSurface(context->glDisplay, context->glConfig,
                                  _window, attribs);
  }

private:
  ANativeWindow *_window;
};

/**
 * Factory for creating an offscreen surface
 */
class OffscreenSurfaceFactory : public BaseSkiaSurfaceFactory {
public:
  OffscreenSurfaceFactory(int width, int height)
      : BaseSkiaSurfaceFactory(width, height) {}

  EGLSurface createOpenGLSurface(SurfaceFactoryContext *context) override {
    const EGLint offScreenSurfaceAttribs[] = {EGL_WIDTH, 1, EGL_HEIGHT, 1,
                                              EGL_NONE};

    return eglCreatePbufferSurface(context->glDisplay, context->glConfig,
                                   offScreenSurfaceAttribs);
  }

  sk_sp<SkSurface> createSkSurfaceFromContext(SurfaceFactoryContext *context,
                                              EGLSurface glSurface,
                                              SkColorType colorType) override {

    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

    auto texture = context->directContext->createBackendTexture(
        _width, _height, colorType, GrMipMapped::kNo, GrRenderable::kYes);

    struct ReleaseContext {
      SurfaceFactoryContext *context;
      GrBackendTexture texture;
      EGLSurface glSurface;
    };

    auto releaseCtx = new ReleaseContext({context, texture, _glSurface});

    // Create a SkSurface from the GrBackendTexture
    auto surface = SkSurface::MakeFromBackendTexture(
        context->directContext.get(), texture, kTopLeft_GrSurfaceOrigin, 0,
        colorType, nullptr, &props,
        [](void *addr) {
          auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);

          releaseCtx->context->directContext->deleteBackendTexture(
              releaseCtx->texture);

          eglMakeCurrent(releaseCtx->context->glDisplay, EGL_NO_SURFACE,
                         EGL_NO_SURFACE, EGL_NO_CONTEXT);

          eglDestroySurface(releaseCtx->context->glDisplay,
                            releaseCtx->glSurface);
        },
        releaseCtx);

    return surface;
  }
};
} // namespace RNSkia