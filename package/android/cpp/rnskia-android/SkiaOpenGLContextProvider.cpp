#include "SkiaOpenGLContextProvider.h"

#include "gltoolkit/Config.h"
#include "gltoolkit/Surface.h"

#include <RNSkLog.h>

namespace RNSkia {

std::mutex SkiaOpenGLContextProvider::mtx;
std::unique_ptr<SkiaOpenGLContextProvider> SkiaOpenGLContextProvider::instance =
    nullptr;

SkiaOpenGLContextProvider::SkiaOpenGLContextProvider() {
  display = std::make_unique<Display>();
  ConfigDescriptor desc;
  uiConfig = display->ChooseConfig(desc);
  uiContext = display->CreateContext(*uiConfig);
  if (!uiContext) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }
  auto uiSurface = display->CreatePixelBufferSurface(*uiConfig, 1, 1);
  if (!uiContext->MakeCurrent(*uiSurface)) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }

  uiThreadContext = GrDirectContext::MakeGL(GrGLMakeNativeInterface());
  if (!uiThreadContext) {
    RNSkLogger::logToConsole("Could not create uiThreadContext");
    return;
  }

  jsConfig = display->ChooseConfig(desc);
  jsContext = display->CreateContext(*jsConfig);
  if (!jsContext) {
    RNSkLogger::logToConsole("Couldn't create the context");
    return;
  }
  auto jsSurface = display->CreatePixelBufferSurface(*jsConfig, 1, 1);
  if (!jsContext->MakeCurrent(*jsSurface)) {
    RNSkLogger::logToConsole("Couldn't make the context current");
    return;
  }
  // 3. Create jsThreadContext
  jsThreadContext = GrDirectContext::MakeGL(GrGLMakeNativeInterface());
  if (!jsThreadContext) {
    RNSkLogger::logToConsole("Could not create jsThreadContext");
    return;
  }
}

SkiaOpenGLContextProvider::~SkiaOpenGLContextProvider() {
  uiThreadContext->releaseResourcesAndAbandonContext();
  uiThreadContext.reset();

  jsThreadContext->releaseResourcesAndAbandonContext();
  jsThreadContext.reset();
}

std::unique_ptr<OnscreenSurface>
SkiaOpenGLContextProvider::MakeOnscreenSurface(jobject jSurface, int width,
                                               int height) {
  auto window = ANativeWindow_fromSurface(facebook::jni::Environment::current(),
                                          jSurface);
  std::unique_ptr<OnscreenSurface> onscreenSurface =
      std::make_unique<OnscreenSurface>(uiThreadContext.get(), window,
                                        display.get(), uiConfig.get(), uiContext.get());
  return onscreenSurface;
}

sk_sp<SkSurface> SkiaOpenGLContextProvider::_MakeOffscreenSurface(
    Config *config, Context *context, GrDirectContext *grContext, int width,
    int height) {
  // Create a new PBuffer surface with desired width and height
  auto eglSurface = display->CreatePixelBufferSurface(*config, width, height);

  if (!context->MakeCurrent(*eglSurface)) {
    RNSkLogger::logToConsole("Couldn't make context current");
    return nullptr;
  }

  GrGLFramebufferInfo info;
  info.fFBOID = 0;
  info.fFormat = 0x8058; // GL_RGBA8

  auto colorType = kN32_SkColorType; // native 32-bit RGBA encoding

  auto stencil = static_cast<GLint>(config->GetDescriptor().stencil_bits);
  auto samples = static_cast<GLint>(config->GetDescriptor().samples);
  auto maxSamples = grContext->maxSurfaceSampleCountForColorType(colorType);
  if (samples > maxSamples) {
    samples = maxSamples;
  }
  GrBackendRenderTarget backendRT(width, height, samples, stencil, info);
  sk_sp<SkSurface> surface = SkSurface::MakeFromBackendRenderTarget(
      grContext, backendRT, kBottomLeft_GrSurfaceOrigin, colorType,
      nullptr, nullptr);

  if (!surface) {
    RNSkLogger::logToConsole("Failed to create offscreen surface");
  }

  return surface;
}

sk_sp<SkSurface> SkiaOpenGLContextProvider::MakeOffscreenSurface(int width,
                                                                 int height) {
  return _MakeOffscreenSurface(jsConfig.get(), jsContext.get(),
                               jsThreadContext.get(), width, height);
}

sk_sp<SkSurface>
SkiaOpenGLContextProvider::MakeSnapshottingSurface(int width, int height) {
  return _MakeOffscreenSurface(uiConfig.get(), uiContext.get(),
                               uiThreadContext.get(), width, height);
}

} // namespace RNSkia