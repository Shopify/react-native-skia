#include "SkiaOpenGLRenderer.h"

#include <RNSkLog.h>
#include <android/native_window.h>
#include <android/native_window_jni.h>

namespace RNSkia {

sk_sp<SkSurface> SkiaOpenGLRenderer::MakeOffscreenGLSurface(int width,
                                                            int height) {

  SkiaOpenGLHelper::ThreadRenderContext context;
  SkiaOpenGLHelper::initializeOpenGL(&context, EGL_PBUFFER_BIT,
                                     sharedEglContext);

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

SkiaOpenGLRenderer::SkiaOpenGLRenderer(jobject surface) {
  _nativeWindow =
      ANativeWindow_fromSurface(facebook::jni::Environment::current(), surface);
}

SkiaOpenGLRenderer::~SkiaOpenGLRenderer() {
  // Tear down
  if (_glSurface != EGL_NO_SURFACE) {
    // Clear glSurface
    eglMakeCurrent(ThreadContext.glDisplay, EGL_NO_SURFACE, EGL_NO_SURFACE,
                   EGL_NO_CONTEXT);
    if (!eglDestroySurface(ThreadContext.glDisplay, _glSurface)) {
      RNSkLogger::logToConsole("eglDestroySurface failed: %d\n", eglGetError());
    }
    _glSurface = EGL_NO_SURFACE;
  }

  // Release surface
  ANativeWindow_release(_nativeWindow);
  _nativeWindow = nullptr;
}

bool SkiaOpenGLRenderer::render(const std::function<void(SkCanvas *)> &cb,
                                int width, int height) {
  // Ensure surface
  if (!ensureContextInitialized()) {
    RNSkLogger::logToConsole("Could not initialize render context.");
    return false;
  }

  if (cb != nullptr) {
    if (!eglMakeCurrent(ThreadContext.glDisplay, _glSurface, _glSurface,
                        ThreadContext.glContext)) {
      RNSkLogger::logToConsole("eglMakeCurrent failed: %d\n", eglGetError());
      return false;
    }

    // setup surface for fbo0
    GrGLFramebufferInfo fboInfo;
    fboInfo.fFBOID = 0;
    fboInfo.fFormat = 0x8058;

    auto colorType = kN32_SkColorType;

    GLint stencil;
    glGetIntegerv(GL_STENCIL_BITS, &stencil);

    GLint samples;
    glGetIntegerv(GL_SAMPLES, &samples);

    auto maxSamples =
        ThreadContext.skContext->maxSurfaceSampleCountForColorType(colorType);

    if (samples > maxSamples) {
      samples = maxSamples;
    }

    GrBackendRenderTarget renderTarget(width, height, samples, stencil,
                                       fboInfo);

    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

    sk_sp<SkSurface> surface(SkSurface::MakeFromBackendRenderTarget(
        ThreadContext.skContext.get(), renderTarget,
        kBottomLeft_GrSurfaceOrigin, colorType, nullptr, &props));

    if (surface == nullptr) {
      RNSkLogger::logToConsole(
          "Could not create Skia surface from underlying OpenGL context.");
      return false;
    }

    auto canvas = surface->getCanvas();

    // Draw into canvas using callback
    cb(canvas);

    // Flush (flushing on canvas is deprecated)
    ThreadContext.skContext->flushAndSubmit();

    if (!eglSwapBuffers(ThreadContext.glDisplay, _glSurface)) {
      RNSkLogger::logToConsole("eglSwapBuffers failed: %d\n", eglGetError());
      return false;
    }

    return true;
  }

  return false;
}

bool SkiaOpenGLRenderer::ensureContextInitialized() {
  // Check OpenGL is initialized
  if (ThreadContext.glDisplay == EGL_NO_DISPLAY) {
    // Ensure OpenGL context
    if (!SkiaOpenGLHelper::initializeOpenGL(&ThreadContext, true,
                                            sharedEglContext)) {
      RNSkLogger::logToConsole("Failed to initialize Thread OpenGL context.");
      return false;
    }

    // Save shared context if this is the first context created
    if (sharedEglContext == EGL_NO_CONTEXT) {
      sharedEglContext = ThreadContext.glContext;
    }
  }

  if (_glSurface == EGL_NO_SURFACE) {
    _glSurface =
        eglCreateWindowSurface(ThreadContext.glDisplay, ThreadContext.glConfig,
                               _nativeWindow, nullptr);

    if (_glSurface == EGL_NO_SURFACE) {
      RNSkLogger::logToConsole("eglCreateWindowSurface failed: %d\n",
                               eglGetError());
      return false;
    }

    // Make current so that we can create Skia context
    if (!eglMakeCurrent(ThreadContext.glDisplay, _glSurface, _glSurface,
                        ThreadContext.glContext)) {
      RNSkLogger::logToConsole("eglMakeCurrent failed: %d\n", eglGetError());
      return false;
    }
  }

  if (ThreadContext.skContext == nullptr) {
    // Now let's create the Skia context
    return SkiaOpenGLHelper::initializeSkiaContext(&ThreadContext);
  }
  return true;
}

} // namespace RNSkia