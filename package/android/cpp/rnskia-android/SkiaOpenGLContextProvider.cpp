#include "SkiaOpenGLContextProvider.h"

#include "gltoolkit/Config.h"
#include "gltoolkit/Surface.h"

#include <RNSkLog.h>

namespace RNSkia {

std::mutex SkiaOpenGLContextProvider::mtx;
std::unique_ptr<SkiaOpenGLContextProvider> SkiaOpenGLContextProvider::instance =
    nullptr;

SkiaOpenGLContextProvider::SkiaOpenGLContextProvider() {
  // 1. Display is shared across thread
  display = std::make_unique<Display>();

  // 2. UI Thread context
  ConfigDescriptor desc;
  uiConfig = display->ChooseConfig(desc);
  uiContext = display->CreateContext(*uiConfig);
  if (!uiContext) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }
  uiSurface = display->CreatePixelBufferSurface(*uiConfig, 1, 1);
  if (!uiContext->MakeCurrent(*uiSurface)) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }
  uiThreadContext = GrDirectContext::MakeGL(GrGLMakeNativeInterface());
  if (!uiThreadContext) {
    RNSkLogger::logToConsole("Could not create uiThreadContext");
    return;
  }

  // 2. JS Thread context
  jsConfig = display->ChooseConfig(desc);
  jsContext = display->CreateContext(*jsConfig);
  if (!jsContext) {
    RNSkLogger::logToConsole("Couldn't create the context");
    return;
  }
  jsSurface = display->CreatePixelBufferSurface(*jsConfig, 1, 1);
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
                                        display.get(), uiConfig.get(),
                                        uiContext.get());
  return onscreenSurface;
}

sk_sp<SkSurface> SkiaOpenGLContextProvider::MakeOffscreenSurface(
    Config *config, Context *context, GrDirectContext *grContext,
    Surface *eglSurface, int width, int height) {
  if (!context->MakeCurrent(*eglSurface)) {
    RNSkLogger::logToConsole("Couldn't make context current");
    return nullptr;
  }
  auto colorType = kN32_SkColorType; // native 32-bit RGBA encoding
  auto texture = grContext->createBackendTexture(
      width, height, colorType, GrMipMapped::kNo, GrRenderable::kYes);
  SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

  sk_sp<SkSurface> surface = SkSurfaces::WrapBackendTexture(
      grContext, texture, kTopLeft_GrSurfaceOrigin, 0, colorType, nullptr,
      &props);

  if (!surface) {
    RNSkLogger::logToConsole("Failed to create offscreen surface");
  }

  return surface;
}

sk_sp<SkSurface>
SkiaOpenGLContextProvider::MakeOffscreenSurface(int width, int height,
                                                bool onJSThread) {
  if (onJSThread) {
    return MakeOffscreenSurface(jsConfig.get(), jsContext.get(),
                                jsThreadContext.get(), jsSurface.get(), width,
                                height);
  } else {
    return MakeOffscreenSurface(uiConfig.get(), uiContext.get(),
                                uiThreadContext.get(), uiSurface.get(), width,
                                height);
  }
}

} // namespace RNSkia