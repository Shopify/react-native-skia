#pragma once

#include "RNSkLog.h"

#include <fbjni/fbjni.h>
#include <jni.h>

#include <android/native_window_jni.h>
#include <android/surface_texture.h>
#include <android/surface_texture_jni.h>
#include <condition_variable>
#include <memory>
#include <thread>
#include <unordered_map>

#include "SkiaOpenGLHelper.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkCanvas.h"
#include "include/core/SkColorSpace.h"
#include "include/core/SkSurface.h"
#include "include/gpu/GrBackendSurface.h"
#include "include/gpu/GrDirectContext.h"
#include "include/gpu/ganesh/SkSurfaceGanesh.h"
#include "include/gpu/gl/GrGLInterface.h"

#pragma clang diagnostic pop

namespace RNSkia {

/**
 * Holder of the thread local SkiaOpenGLContext member
 */
class ThreadContextHolder {
public:
  static thread_local SkiaOpenGLContext ThreadSkiaOpenGLContext;
};

/**
 * Holder of the Windowed SkSurface with support for making current
 * and presenting to screen
 */
class WindowSurfaceHolder {
public:
  WindowSurfaceHolder(jobject jSurfaceTexture, int width, int height)
      : _width(width), _height(height) {
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
    _window = ANativeWindow_fromSurface(env, jSurface);
    // Clean up local references
    env->DeleteLocalRef(jSurface);
    env->DeleteLocalRef(surfaceClass);
    env->DeleteLocalRef(surfaceTextureClass);
  }

  ~WindowSurfaceHolder() {
    JNIEnv *env = facebook::jni::Environment::current();
    env->DeleteGlobalRef(_jSurfaceTexture);
    ANativeWindow_release(_window);
  }

  int getWidth() { return _width; }
  int getHeight() { return _height; }

  /*
   * Ensures that the holder has a valid surface and returns the surface.
   */
  sk_sp<SkSurface> getSurface();

  void updateTexImage() {
    JNIEnv *env = facebook::jni::Environment::current();

    // Call updateTexImage on the SurfaceTexture object
    env->CallVoidMethod(_jSurfaceTexture, _updateTexImageMethod);

    // Check for exceptions
    if (env->ExceptionCheck()) {
      RNSkLogger::logToConsole("updateAndRelease() failed. The exception above "
                               "can safely be ignored");
      env->ExceptionClear();
    }
  }

  /**
   * Resizes the surface
   * @param width
   * @param height
   */
  void resize(int width, int height) {
    _width = width;
    _height = height;
    _skSurface = nullptr;
  }

  /**
   * Sets the current surface as the active surface
   * @return true if make current succeeds
   */
  bool makeCurrent() {
    return SkiaOpenGLHelper::makeCurrent(
        &ThreadContextHolder::ThreadSkiaOpenGLContext, _glSurface);
  }

  /**
   * Presents the current drawing operations by swapping buffers
   * @return true if make current succeeds
   */
  bool present() {
    // Flush and submit the direct context
    ThreadContextHolder::ThreadSkiaOpenGLContext.directContext
        ->flushAndSubmit();

    // Swap buffers
    return SkiaOpenGLHelper::swapBuffers(
        &ThreadContextHolder::ThreadSkiaOpenGLContext, _glSurface);
  }

private:
  ANativeWindow *_window;
  sk_sp<SkSurface> _skSurface = nullptr;
  jobject _jSurfaceTexture = nullptr;
  EGLSurface _glSurface = EGL_NO_SURFACE;
  jmethodID _updateTexImageMethod = nullptr;
  int _width = 0;
  int _height = 0;
};

class SkiaOpenGLSurfaceFactory {
public:
  /**
   * Creates a new Skia surface that is backed by a texture.
   * @param width Width of surface
   * @param height Height of surface
   * @return An SkSurface backed by a texture.
   */
  static sk_sp<SkSurface> makeOffscreenSurface(int width, int height);

  static sk_sp<SkImage> makeImageFromHardwareBuffer(void *buffer);

  /**
   * Creates a windowed Skia Surface holder.
   * @param width Initial width of surface
   * @param height Initial height of surface
   * @param window Window coming from Java
   * @return A Surface holder
   */
  static std::unique_ptr<WindowSurfaceHolder>
  makeWindowedSurface(jobject window, int width, int height) {
    return std::make_unique<WindowSurfaceHolder>(window, width, height);
  }
};

} // namespace RNSkia
