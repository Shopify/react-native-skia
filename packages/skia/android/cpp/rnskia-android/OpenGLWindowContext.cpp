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

    GLint stencil;
    glGetIntegerv(GL_STENCIL_BITS, &stencil);

    GLint samples;
    glGetIntegerv(GL_SAMPLES, &samples);

    auto colorType = kRGBA_8888_SkColorType;

    auto maxSamples =
        _directContext->maxSurfaceSampleCountForColorType(colorType);

    if (samples > maxSamples) {
      samples = maxSamples;
    }

    GrGLFramebufferInfo fbInfo;
    fbInfo.fFBOID = 0;
    fbInfo.fFormat = GR_GL_RGBA8;
    // fbInfo.fProtected =
    // skgpu::Protected(fDisplayParams.fCreateProtectedNativeBackend);

    auto backendRT = GrBackendRenderTargets::MakeGL(_width, _height, samples,
                                                    stencil, fbInfo);
    sk_sp<SkColorSpace> colorSpace(nullptr);
    SkSurfaceProps surfaceProps(0, kRGB_H_SkPixelGeometry);
    _skSurface = SkSurfaces::WrapBackendRenderTarget(
        _directContext.get(), backendRT, kBottomLeft_GrSurfaceOrigin,
        kRGBA_8888_SkColorType, colorSpace, &surfaceProps);
  }
  return _skSurface;
}

void OpenGLWindowContext::present() {
  _glContext->makeCurrent(_glSurface.get());
  // TODO: is flushAndSubmit needed here?
  _directContext->flushAndSubmit();
  _glSurface->present();
}

} // namespace RNSkia
