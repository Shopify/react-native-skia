#include "RNSkOpenGLCanvasProvider.h"

#include <android/native_window_jni.h>
#include <fbjni/fbjni.h>
#include <jni.h>
#include <memory>

#include "RNSkLog.h"

#if defined(SK_GRAPHITE)
#include "DawnContext.h"
#else
#include "OpenGLContext.h"
#endif

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkCanvas.h"
#include "include/core/SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

RNSkOpenGLCanvasProvider::RNSkOpenGLCanvasProvider(
    std::function<void()> requestRedraw,
    std::shared_ptr<RNSkia::RNSkPlatformContext> platformContext)
    : RNSkCanvasProvider(requestRedraw), _platformContext(platformContext) {}

RNSkOpenGLCanvasProvider::~RNSkOpenGLCanvasProvider() {}

float RNSkOpenGLCanvasProvider::getScaledWidth() {
  if (_surfaceHolder) {
    return static_cast<float>(_surfaceHolder->getWidth());
  }
  return 0;
}

float RNSkOpenGLCanvasProvider::getScaledHeight() {
  if (_surfaceHolder) {
    return static_cast<float>(_surfaceHolder->getHeight());
  }
  return 0;
}

bool RNSkOpenGLCanvasProvider::renderToCanvas(
    const std::function<void(SkCanvas *)> &cb) {
  JNIEnv *env = facebook::jni::Environment::current();
  if (_surfaceHolder != nullptr && cb != nullptr) {
    // Get the surface
    auto surface = _surfaceHolder->getSurface();
    env->CallVoidMethod(_jSurfaceTexture, _updateTexImageMethod);

    // Check for exceptions
    if (env->ExceptionCheck()) {
      RNSkLogger::logToConsole("updateAndRelease() failed. The exception above "
                               "can safely be ignored");
      env->ExceptionClear();
    }
    if (surface) {
      // Draw into canvas using callback
      cb(surface->getCanvas());

      // Swap buffers and show on screen
      _surfaceHolder->present();

      return true;
    } else {
      // the render context did not provide a surface
      return false;
    }
  }
  return false;
}

void RNSkOpenGLCanvasProvider::surfaceAvailable(jobject jSurfaceTexture,
                                                int width, int height) {
  // Create renderer!
  JNIEnv *env = facebook::jni::Environment::current();

  _jSurfaceTexture = env->NewGlobalRef(jSurfaceTexture);
  jclass surfaceClass = env->FindClass("android/view/Surface");
  jmethodID surfaceConstructor = env->GetMethodID(
      surfaceClass, "<init>", "(Landroid/graphics/SurfaceTexture;)V");
  // Create a new Surface instance
  jobject jSurface =
      env->NewObject(surfaceClass, surfaceConstructor, jSurfaceTexture);

  jclass surfaceTextureClass = env->GetObjectClass(_jSurfaceTexture);
  _updateTexImageMethod =
      env->GetMethodID(surfaceTextureClass, "updateTexImage", "()V");

  // Acquire the native window from the Surface
  auto window = ANativeWindow_fromSurface(env, jSurface);
  // Clean up local references
  env->DeleteLocalRef(jSurface);
  env->DeleteLocalRef(surfaceClass);
  env->DeleteLocalRef(surfaceTextureClass);
#if defined(SK_GRAPHITE)
  _surfaceHolder = DawnContext::getInstance().MakeWindow(window, width, height);
#else
  _surfaceHolder =
      OpenGLContext::getInstance().MakeWindow(window, width, height);
#endif

  // Post redraw request to ensure we paint in the next draw cycle.
  _requestRedraw();
}
void RNSkOpenGLCanvasProvider::surfaceDestroyed() {
  // destroy the renderer (a unique pointer so the dtor will be called
  // immediately.)
  _surfaceHolder = nullptr;
  if (_jSurfaceTexture) {
    JNIEnv *env = facebook::jni::Environment::current();
    env->DeleteGlobalRef(_jSurfaceTexture);
    _jSurfaceTexture = nullptr;
  }
}

void RNSkOpenGLCanvasProvider::surfaceSizeChanged(int width, int height) {
  if (width == 0 && height == 0) {
    // Setting width/height to zero is nothing we need to care about when
    // it comes to invalidating the surface.
    return;
  }

  // Recreate RenderContext surface based on size change???
  _surfaceHolder->resize(width, height);

  // Redraw after size change
  _requestRedraw();
}
} // namespace RNSkia
