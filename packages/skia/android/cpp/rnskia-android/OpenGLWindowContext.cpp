#include "OpenGLWindowContext.h"
#include "GrAHardwareBufferUtils.h"

#include "OpenGLContext.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/gpu/ganesh/SkImageGanesh.h"
#include "include/gpu/ganesh/gl/GrGLBackendSurface.h"
#include "src/gpu/ganesh/gl/GrGLDefines.h"

#pragma clang diagnostic pop

namespace RNSkia {

sk_sp<SkSurface> OpenGLWindowContext::getSurface() {
  if (_skSurface == nullptr) {

    struct ReleaseContext {
      std::unique_ptr<gl::Surface> surface = nullptr;
    };

    if (!_window) {
      throw std::runtime_error("No native window provided");
    }
    auto releaseCtx = new ReleaseContext();
    releaseCtx->surface =
        _context->_glDisplay->makeWindowSurface(_context->_glConfig, _window);
    if (!releaseCtx->surface) {
      throw std::runtime_error("Failed to create window surface");
    }
    _glSurface = releaseCtx->surface.get();

    // Now make this one current
    auto success = _context->_glContext->makeCurrent(releaseCtx->surface.get());
    if (!success) {
      throw std::runtime_error("Failed to make window surface current");
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
        _context->_directContext->maxSurfaceSampleCountForColorType(colorType);

    if (samples > maxSamples) {
      samples = maxSamples;
    }

    auto renderTarget = GrBackendRenderTargets::MakeGL(_width, _height, samples,
                                                       stencil, fboInfo);

    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

    // Create surface object
    _skSurface = SkSurfaces::WrapBackendRenderTarget(
        _context->_directContext.get(), renderTarget,
        kBottomLeft_GrSurfaceOrigin, colorType, nullptr, &props,
        [](void *addr) {
          auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);
          delete releaseCtx;
        },
        reinterpret_cast<void *>(releaseCtx));
  }
  return _skSurface;
}

void OpenGLWindowContext::present() {
  _context->_glContext->makeCurrent(_glSurface);
  _context->_directContext->flushAndSubmit();
  _glSurface->present();
}

} // namespace RNSkia
