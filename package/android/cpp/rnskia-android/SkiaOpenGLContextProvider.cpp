#include "SkiaOpenGLContextProvider.h"

#include <RNSkLog.h>

namespace RNSkia {

std::mutex SkiaOpenGLContextProvider::mtx;
std::unique_ptr<SkiaOpenGLContextProvider> SkiaOpenGLContextProvider::instance =
    nullptr;

SkiaOpenGLContextProvider::SkiaOpenGLContextProvider() {
  // 1. Create root OpenGL Context by create a 1x1 offscreen surface
  eglDisplay = eglGetDisplay(EGL_DEFAULT_DISPLAY);
  if (eglDisplay == EGL_NO_DISPLAY) {
    RNSkLogger::logToConsole("eglGetdisplay failed : %i", glGetError());
    return;
  }

  EGLint major;
  EGLint minor;
  if (!eglInitialize(eglDisplay, &major, &minor)) {
    RNSkLogger::logToConsole("eglInitialize failed : %i", glGetError());
    return;
  }

  const char *eglExtensions = eglQueryString(eglDisplay, EGL_EXTENSIONS);
  if (eglExtensions == nullptr) {
    RNSkLogger::logToConsole("eglQueryString failed : %i", eglGetError());
    return;
  }

  bool hasSurfacelessContext =
      strstr(eglExtensions, "EGL_KHR_surfaceless_context") != nullptr;

  EGLint att[] = {EGL_RENDERABLE_TYPE,
                  EGL_OPENGL_ES2_BIT,
                  EGL_SURFACE_TYPE,
                  EGL_PBUFFER_BIT,
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
  eglConfig = 0;
  if (!eglChooseConfig(eglDisplay, att, &eglConfig, 1, &numConfigs) ||
      numConfigs == 0) {
    RNSkLogger::logToConsole("Failed to choose a config %d\n", eglGetError());
    return;
  }

  EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};
  eglContext =
      eglCreateContext(eglDisplay, eglConfig, EGL_NO_CONTEXT, contextAttribs);

  if (eglContext == EGL_NO_CONTEXT) {
    RNSkLogger::logToConsole("eglCreateContext failed: %d\n", eglGetError());
    return;
  }

  EGLSurface eglSurface = EGL_NO_SURFACE;
  if (!hasSurfacelessContext) {
    // If the EGL implementation doesn't support surfaceless contexts, create a
    // tiny pbuffer surface
    const EGLint surfaceAttribs[] = {EGL_WIDTH, 1, EGL_HEIGHT, 1, EGL_NONE};
    eglSurface = eglCreatePbufferSurface(eglDisplay, eglConfig, surfaceAttribs);
    if (eglSurface == EGL_NO_SURFACE) {
      RNSkLogger::logToConsole("eglCreatePbufferSurface failed: %d\n",
                               eglGetError());
      return;
    }
  }

  // Make the context current
  if (!eglMakeCurrent(eglDisplay, eglSurface, eglSurface, eglContext)) {
    RNSkLogger::logToConsole("eglMakeCurrent failed: %d\n", eglGetError());
    return;
  }
  // 2. Create uiThreadContext
  auto backendInterface = GrGLMakeNativeInterface();
  uiThreadContext = GrDirectContext::MakeGL(backendInterface);

  // 3. Create jsThreadContext
  jsThreadContext = GrDirectContext::MakeGL(backendInterface);
}

SkiaOpenGLContextProvider::~SkiaOpenGLContextProvider() {
  uiThreadContext->releaseResourcesAndAbandonContext();
  uiThreadContext.reset();

  jsThreadContext->releaseResourcesAndAbandonContext();
  jsThreadContext.reset();

  if (eglContext != EGL_NO_CONTEXT) {
    eglDestroyContext(eglDisplay, eglContext);
    eglContext = EGL_NO_CONTEXT;
  }

  if (eglDisplay != EGL_NO_DISPLAY) {
      eglTerminate(eglDisplay);
      eglDisplay = EGL_NO_DISPLAY;
  }
}

sk_sp<SkSurface> SkiaOpenGLContextProvider::MakeOffscreenSurface(sk_sp<GrDirectContext> grContext, int width, int height) {
  const EGLint offScreenSurfaceAttribs[] = {EGL_WIDTH, width, EGL_HEIGHT,
                                            height, EGL_NONE};
  EGLSurface eglSurface =
      eglCreatePbufferSurface(eglDisplay, eglConfig, offScreenSurfaceAttribs);
  if (!eglMakeCurrent(eglDisplay, eglSurface, eglSurface, eglContext)) {
    RNSkLogger::logToConsole("eglMakeCurrent failed on MakeOffscreenSurface: %d\n", eglGetError());
    return nullptr;
  }
  GLint buffer;
  glGetIntegerv(GL_FRAMEBUFFER_BINDING, &buffer);

  GLint stencil;
  glGetIntegerv(GL_STENCIL_BITS, &stencil);

  GLint samples;
  glGetIntegerv(GL_SAMPLES, &samples);

  auto maxSamples =
      grContext->maxSurfaceSampleCountForColorType(kRGBA_8888_SkColorType);

  if (samples > maxSamples)
    samples = maxSamples;

  GrGLFramebufferInfo fbInfo;
  fbInfo.fFBOID = buffer;
  fbInfo.fFormat = 0x8058;

  auto renderTarget =
      GrBackendRenderTarget(width, height, samples, stencil, fbInfo);

  struct OffscreenRenderContext {
    EGLDisplay display;
    EGLSurface surface;
  };
  auto ctx = new OffscreenRenderContext({eglDisplay, eglSurface});

  auto surface = SkSurface::MakeFromBackendRenderTarget(
      grContext.get(), renderTarget, kBottomLeft_GrSurfaceOrigin,
      kRGBA_8888_SkColorType, nullptr, nullptr,
      [](void *addr) {
        auto ctx = reinterpret_cast<OffscreenRenderContext *>(addr);
        eglDestroySurface(ctx->display, ctx->surface);
        delete ctx;
      },
      reinterpret_cast<void *>(ctx));
  return surface;
}

} // namespace RNSkia