#pragma once

#include <RNSkLog.h>

#include "SkiaOpenGLHelper.h"

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include "android/native_window.h"
#include <fbjni/fbjni.h>
#include <jni.h>

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

static EGLContext sharedEglContext = EGL_NO_CONTEXT;

/**
 * To be able to use static contexts (and avoid reloading the skia context for
 * each new view, we track the OpenGL and Skia drawing context per thread.
 */
static thread_local SkiaOpenGLHelper::ThreadRenderContext ThreadContext;

class SkiaOpenGLRenderer {
public:
  explicit SkiaOpenGLRenderer(jobject surface);
  ~SkiaOpenGLRenderer();

  /**
   * Initializes and ensures a canvas that will be passed to the callback
   * to perform drawing operations on. After the callback is called the
   * drawing will be rendered to the underlying graphic context.
   *
   * @param callback Render callback
   * @param width Width of surface to render if there is a picture
   * @param height Height of surface to render if there is a picture
   */
  bool render(const std::function<void(SkCanvas *)> &cb, int width, int height);

  /**
   * Creates an offscreen GPU / OpenGL surface
   * @param width
   * @param height
   * @return
   */
  static sk_sp<SkSurface> MakeOffscreenGLSurface(int width, int height);

private:
  /*
   * Ensures that a valid OpenGL and Skia context is available. Used by the
   * render method to initialize on the same thread as we render.
   */
  bool ensureContextInitialized();

  ANativeWindow *_nativeWindow = nullptr;
  EGLSurface _glSurface = EGL_NO_SURFACE;
};
} // namespace RNSkia