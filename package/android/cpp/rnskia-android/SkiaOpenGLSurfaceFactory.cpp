#include <SkiaOpenGLSurfaceFactory.h>

namespace RNSkia {
/**
 * The first context created will be considered the parent / shared context and
 * will be used as the parent / shareable context when creating subsequent
 * contexts.
 */
EGLContext BaseSkiaSurfaceFactory::_SharedEglContext = EGL_NO_CONTEXT;

thread_local SurfaceFactoryContext BaseSkiaSurfaceFactory::_ThreadContext;

BaseSkiaSurfaceFactory::BaseSkiaSurfaceFactory(SkiaSurfaceType type, int width,
                                               int height) {
  _glSurface = EGL_NO_SURFACE;
  _type = type;
  _width = width;
  _height = height;
}

bool BaseSkiaSurfaceFactory::resize(int width, int height) {
  _width = width;
  _height = height;

  return true;
}

bool BaseSkiaSurfaceFactory::makeCurrent() {
  if (!eglMakeCurrent(getContext()->glDisplay, _glSurface, _glSurface,
                      getContext()->glContext)) {
    RNSkLogger::logToConsole("eglMakeCurrent failed: %d\n", eglGetError());
    return false;
  }
  return true;
}

bool BaseSkiaSurfaceFactory::initializeOpenGL(SurfaceFactoryContext *context) {
  // Get default display
  context->glDisplay = eglGetDisplay(EGL_DEFAULT_DISPLAY);
  if (context->glDisplay == EGL_NO_DISPLAY) {
    RNSkLogger::logToConsole("eglGetDisplay failed : %i", glGetError());
    return false;
  }

  EGLint major;
  EGLint minor;

  if (!eglInitialize(context->glDisplay, &major, &minor)) {
    RNSkLogger::logToConsole("eglInitialize failed : %i", glGetError());
    eglTerminate(context->glDisplay);
    context->glDisplay = EGL_NO_DISPLAY;
    return false;
  }

  return true;
}

EGLConfig BaseSkiaSurfaceFactory::getConfig(EGLDisplay glDisplay) {

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
                  EGL_NONE};

  EGLint numConfigs;
  EGLConfig glConfig = 0;
  if (!eglChooseConfig(glDisplay, att, &glConfig, 1, &numConfigs) ||
      numConfigs == 0) {
    RNSkLogger::logToConsole(
        "Failed to choose a config for %s surface. Error code: %d\n",
        eglGetError());
    return 0;
  }

  return glConfig;
}

EGLContext BaseSkiaSurfaceFactory::createOpenGLContext(EGLDisplay glDisplay,
                                                       SkiaSurfaceType type) {
  // Create OpenGL context
  EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};

  // Initialize the offscreen context for this thread
  EGLContext newGLContext = eglCreateContext(
      glDisplay, getConfig(glDisplay), _SharedEglContext, contextAttribs);

  if (newGLContext == EGL_NO_CONTEXT) {
    RNSkLogger::logToConsole("eglCreateContext failed: %d\n", eglGetError());
    return EGL_NO_CONTEXT;
  }

  // If this is the initial (first) context created, we should save it and use
  // it as the share context for subsequent calls to glCreateContext:
  if (_SharedEglContext == EGL_NO_CONTEXT) {
    _SharedEglContext = newGLContext;
  }

  return newGLContext;
}

sk_sp<SkSurface> BaseSkiaSurfaceFactory::createSkSurface() {
  // Get the current context to work in:
  auto context = getContext();

  // Initialize OpenGL if necessary
  if (context->glDisplay == EGL_NO_DISPLAY) {
    if (!initializeOpenGL(context)) {
      return nullptr;
    }
  }

  // Create the OpenGL context if necessary
  if (context->glContext == EGL_NO_CONTEXT) {
    context->glContext = createOpenGLContext(context->glDisplay, _type);
    if (context->glContext == EGL_NO_CONTEXT) {
      return nullptr;
    }
  }

  // Create the desired OpenGL surface type
  _glSurface = createOpenGLSurface(context);
  if (_glSurface == EGL_NO_SURFACE) {
    RNSkLogger::logToConsole("eglCreateWindowSurface failed: %d\n",
                             eglGetError());
    return nullptr;
  }

  // Make current now that we have the surface
  if (!makeCurrent())
    return nullptr;

  // Initialize Skia if necessary
  if (context->directContext == nullptr) {
    // Create the Skia context
    auto backendInterface = GrGLMakeNativeInterface();
    context->directContext = GrDirectContext::MakeGL(backendInterface);

    if (context->directContext == nullptr) {
      RNSkLogger::logToConsole("GrDirectContext::MakeGL failed");
      return nullptr;
    }
  }

  // Create the SkSurface
  GLint buffer;
  glGetIntegerv(GL_FRAMEBUFFER_BINDING, &buffer);

  GrGLFramebufferInfo fboInfo;
  fboInfo.fFBOID = buffer;
  fboInfo.fFormat = 0x8058; // GL_RGBA8

  auto colorType = kN32_SkColorType; // native 32-bit RGBA encoding

  GLint stencil;
  glGetIntegerv(GL_STENCIL_BITS, &stencil);

  GLint samples;
  glGetIntegerv(GL_SAMPLES, &samples);

  auto maxSamples =
      getContext()->directContext->maxSurfaceSampleCountForColorType(colorType);

  if (samples > maxSamples) {
    samples = maxSamples;
  }

  GrBackendRenderTarget renderTarget(_width, _height, samples, stencil,
                                     fboInfo);

  SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

  struct ReleaseContext {
    SurfaceFactoryContext *context;
    EGLSurface glSurface;
    std::function<void(SurfaceFactoryContext *)> releaseProc;
    SkiaSurfaceType type;
  };

  auto releaseCtx = new ReleaseContext(
      {context, _glSurface, getSurfaceReleasedProc(), _type});

  // Create surface object
  auto retVal = SkSurface::MakeFromBackendRenderTarget(
      getContext()->directContext.get(), renderTarget,
      kBottomLeft_GrSurfaceOrigin, colorType, nullptr, &props,
      [](void *addr) {
        auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);

        eglMakeCurrent(releaseCtx->context->glDisplay, EGL_NO_SURFACE,
                       EGL_NO_SURFACE, EGL_NO_CONTEXT);

        eglDestroySurface(releaseCtx->context->glDisplay,
                          releaseCtx->glSurface);

        // Call subclass release proc
        releaseCtx->releaseProc(releaseCtx->context);

        delete releaseCtx;
      },
      reinterpret_cast<void *>(releaseCtx));

  if (retVal == nullptr) {
    RNSkLogger::logToConsole(
        "Could not create Skia surface from underlying OpenGL context.");
    return nullptr;
  }

  return retVal;
}

} // namespace RNSkia