#include "SkiaOpenGLHelper.h"
#include <SkiaOpenGLSurfaceFactory.h>

namespace RNSkia {

/**
 * The first context created will be considered the parent / shared context and
 * will be used as the parent / shareable context when creating subsequent
 * contexts.
 */
SkiaOpenGLContext ThreadContextHolder::SharedSkiaOpenGLContext;

/**
 * This is the context that is static and local to each thread.
 */
thread_local SkiaOpenGLContext ThreadContextHolder::ThreadSkiaOpenGLContext;

sk_sp<SkSurface> SkiaOpenGLSurfaceFactory::makeOffscreenSurface(int width,
                                                                int height) {
  RNSkLogger::logToConsole("makeOffscreenSurface Setting up Skia");
  // Setup OpenGL and Skia:
  if (!SkiaOpenGLHelper::createSkiaDirectContext(
          &ThreadContextHolder::ThreadSkiaOpenGLContext,
          &ThreadContextHolder::SharedSkiaOpenGLContext)) {
    RNSkLogger::logToConsole(
        "Could not create Skia Surface from native window / surface. "
        "Failed creating Skia Direct Context");
    return nullptr;
  }

  auto colorType = kN32_SkColorType;

  SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

  // Create texture
  auto texture =
      ThreadContextHolder::ThreadSkiaOpenGLContext.directContext
          ->createBackendTexture(width, height, colorType, GrMipMapped::kNo,
                                 GrRenderable::kYes);

  struct ReleaseContext {
    SkiaOpenGLContext *context;
    GrBackendTexture texture;
  };

  auto releaseCtx = new ReleaseContext(
      {&ThreadContextHolder::ThreadSkiaOpenGLContext, texture});

  // Create a SkSurface from the GrBackendTexture
  return SkSurface::MakeFromBackendTexture(
          ThreadContextHolder::ThreadSkiaOpenGLContext.directContext.get(), texture,
          kTopLeft_GrSurfaceOrigin, 0, colorType, nullptr, &props,
          [](void *addr) {
        auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);

        releaseCtx->context->directContext->deleteBackendTexture(
            releaseCtx->texture);
      },
          releaseCtx);
}

sk_sp<SkSurface> WindowSurfaceHolder::getSurface() {
  if (_skSurface == nullptr) {

    // Do we need to setup OpenGL and Skia?
    if (ThreadContextHolder::ThreadSkiaOpenGLContext.glDisplay ==
        EGL_NO_DISPLAY) {
      // Setup OpenGL and Skia:
      if (!SkiaOpenGLHelper::createSkiaDirectContext(
              &ThreadContextHolder::ThreadSkiaOpenGLContext,
              &ThreadContextHolder::SharedSkiaOpenGLContext)) {
        RNSkLogger::logToConsole(
            "Could not create Skia Surface from native window / surface. "
            "Failed creating Skia Direct Context");
        return nullptr;
      }
    }

    // Now we can create a surface
    const EGLint attribs[] = {EGL_NONE};
    _glSurface = eglCreateWindowSurface(
            ThreadContextHolder::ThreadSkiaOpenGLContext.glDisplay,
            ThreadContextHolder::ThreadSkiaOpenGLContext.glConfig, _window,
            attribs);

    if (_glSurface == EGL_NO_SURFACE) {
      RNSkLogger::logToConsole(
          "Could not create EGL Surface from native window / surface.");
      return nullptr;
    }

    // Now make this one current
    if (!SkiaOpenGLHelper::makeCurrent(
            &ThreadContextHolder::ThreadSkiaOpenGLContext, _glSurface)) {
      RNSkLogger::logToConsole(
          "Could not create EGL Surface from native window / surface. Could "
          "not set new surface as current surface.");
      return nullptr;
    }

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

    auto colorType = kN32_SkColorType;

    auto maxSamples =
        ThreadContextHolder::ThreadSkiaOpenGLContext.directContext
            ->maxSurfaceSampleCountForColorType(colorType);

    if (samples > maxSamples) {
      samples = maxSamples;
    }

    GrBackendRenderTarget renderTarget(_width, _height, samples, stencil,
                                       fboInfo);

    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

    struct ReleaseContext {
      SkiaOpenGLContext *context;
      EGLSurface glSurface;
    };

    auto releaseCtx = new ReleaseContext(
        {&ThreadContextHolder::ThreadSkiaOpenGLContext, _glSurface});

    // Create surface object
    _skSurface = SkSurface::MakeFromBackendRenderTarget(
        ThreadContextHolder::ThreadSkiaOpenGLContext.directContext.get(),
        renderTarget, kBottomLeft_GrSurfaceOrigin, colorType, nullptr, &props,
        [](void *addr) {
          auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);

          eglMakeCurrent(releaseCtx->context->glDisplay, EGL_NO_SURFACE,
                         EGL_NO_SURFACE, EGL_NO_CONTEXT);

          eglDestroySurface(releaseCtx->context->glDisplay,
                            releaseCtx->glSurface);

          delete releaseCtx;
        },
        reinterpret_cast<void *>(releaseCtx));
  }

  return _skSurface;
}

} // namespace RNSkia