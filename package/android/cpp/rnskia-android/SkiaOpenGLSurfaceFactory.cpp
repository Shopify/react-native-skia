#include <SkiaOpenGLSurfaceFactory.h>

namespace RNSkia {
/**
 * The first context created will be considered the parent / shared context and
 * will be used as the parent / shareable context when creating subsequent
 * contexts.
 */
BaseSkiaSurfaceFactory *BaseSkiaSurfaceFactory::SharedContext =
    new OffscreenSurfaceFactory(1, 1);

thread_local SurfaceFactoryContext
    BaseSkiaSurfaceFactory::ThreadedSkiaOpenGlContext;

BaseSkiaSurfaceFactory::BaseSkiaSurfaceFactory(int width, int height) {
  _glSurface = EGL_NO_SURFACE;
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

  if (eglInitialize(context->glDisplay, &major, &minor) != EGL_TRUE) {
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
                  EGL_SAMPLE_BUFFERS,
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

EGLContext BaseSkiaSurfaceFactory::createOpenGLContext(
    EGLDisplay glDisplay, EGLConfig config, EGLContext sharedContext) {
  // Create OpenGL context
  EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};

  // Initialize the offscreen context for this thread
  EGLContext newGLContext =
      eglCreateContext(glDisplay, config, sharedContext, contextAttribs);

  if (newGLContext == EGL_NO_CONTEXT) {
    RNSkLogger::logToConsole("eglCreateContext failed: %d\n", eglGetError());
    return EGL_NO_CONTEXT;
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
    // Create config for the current display
    context->glConfig = getConfig(context->glDisplay);
    context->glContext =
        createOpenGLContext(context->glDisplay, context->glConfig,
                            SharedContext->getContext()->glContext);

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

  return createSkSurfaceFromContext(
      context, _glSurface, kN32_SkColorType); // native 32-bit RGBA encoding
}

sk_sp<SkSurface> BaseSkiaSurfaceFactory::createSkSurfaceFromContext(
    SurfaceFactoryContext *context, EGLSurface glSurface,
    SkColorType colorType) {
  // Set up parameters for the render target so that it
  // matches the underlying OpenGL context.
  GrGLFramebufferInfo fboInfo;

  // We pass 0 as the framebuffer id, since the
  // underlying Skia GrGlGpu will read this when wrapping the context in the
  // render target and the GrGlGpu object.
  fboInfo.fFBOID = 0;
  fboInfo.fFormat = 0x8058; // GL_RGBA8

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
  };

  auto releaseCtx = new ReleaseContext({context, glSurface});

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