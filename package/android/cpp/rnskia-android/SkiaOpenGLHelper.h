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

#include "SkCanvas.h"
#include "SkColorSpace.h"
#include "SkPicture.h"
#include "SkSurface.h"
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

  /**
   * Initializes OpenGL render context
   * @param context
   * @param createOffscreenContext
   * @param parent
   * @return true if success, false if not.
   */
  static bool initializeRenderContext(ThreadRenderContext *context,
                                      bool createOffscreenContext = false,
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
                    createOffscreenContext ? EGL_PBUFFER_BIT : EGL_WINDOW_BIT,
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

  /**
   * Creates an offscreen Skia Surface backed by OpenGL that can be used as a
   * render target. If the parent EGLContext is provided the surface will be
   * able to share all existing OpenGL and Skia shaders and textures between
   * each other.
   * @param width Width of surface
   * @param height Height of surface
   * @param parent Parent EGLContext
   * @return Skia Surface
   */
  static sk_sp<SkSurface> MakeOffscreenGLSurface(int width, int height,
                                                 EGLContext parent) {

    ThreadRenderContext context;
    initializeRenderContext(&context, true, parent);

    // Create a new pbuffer surface
    const EGLint offScreenSurfaceAttribs[] = {EGL_WIDTH, width, EGL_HEIGHT,
                                              height, EGL_NONE};

    EGLSurface eglOffscreenSurface = eglCreatePbufferSurface(
        context.glDisplay, context.glConfig, offScreenSurfaceAttribs);

    if (!eglMakeCurrent(context.glDisplay, eglOffscreenSurface,
                        eglOffscreenSurface, context.glContext)) {
      RNSkLogger::logToConsole("eglMakeCurrent failed: %d\n", eglGetError());
      return nullptr;
    }

    GLint stencil;
    glGetIntegerv(GL_STENCIL_BITS, &stencil);

    GLint samples;
    glGetIntegerv(GL_SAMPLES, &samples);

    // Create the Skia backend context
    auto backendInterface = GrGLMakeNativeInterface();
    auto grContext = GrDirectContext::MakeGL(backendInterface);
    if (grContext == nullptr) {
      RNSkLogger::logToConsole("GrDirectContext::MakeGL failed");
      return nullptr;
    }
    auto maxSamples =
        grContext->maxSurfaceSampleCountForColorType(kRGBA_8888_SkColorType);

    if (samples > maxSamples)
      samples = maxSamples;

    GLint buffer;
    glGetIntegerv(GL_FRAMEBUFFER_BINDING, &buffer);

    GrGLFramebufferInfo fbInfo;
    fbInfo.fFBOID = buffer;
    fbInfo.fFormat = 0x8058; // GL_RGBA8

    struct OffscreenRenderContext {
      EGLDisplay display;
      EGLSurface surface;
      EGLContext context;
      GrBackendRenderTarget renderTarget;
    };

    auto ctx = new OffscreenRenderContext(
        {context.glDisplay, eglOffscreenSurface, context.glContext,
         GrBackendRenderTarget(width, height, samples, stencil, fbInfo)});

    auto surface = SkSurface::MakeFromBackendRenderTarget(
        grContext.get(), ctx->renderTarget, kBottomLeft_GrSurfaceOrigin,
        kRGBA_8888_SkColorType, nullptr, nullptr,
        [](void *addr) {
          auto ctx = reinterpret_cast<OffscreenRenderContext *>(addr);
          eglMakeCurrent(ctx->display, EGL_NO_SURFACE, EGL_NO_SURFACE,
                         EGL_NO_CONTEXT);
          eglDestroySurface(ctx->display, ctx->surface);
          eglDestroyContext(ctx->display, ctx->context);
          eglTerminate(ctx->display);
          delete ctx;
        },
        reinterpret_cast<void *>(ctx));

    return surface;
  }
};
} // namespace RNSkia