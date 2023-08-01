#include "SkiaOpenGLContextProvider.h"

#include "gltoolkit/Config.h"
#include "gltoolkit/Surface.h"

#include <RNSkLog.h>

namespace RNSkia {

std::mutex SkiaOpenGLContextProvider::mtx;
std::unique_ptr<SkiaOpenGLContextProvider> SkiaOpenGLContextProvider::instance =
    nullptr;

SkiaOpenGLContextProvider::SkiaOpenGLContextProvider() {
  // 1. Create root context
  display = std::make_unique<Display>();
  ConfigDescriptor desc;
  desc.api = API::kOpenGLES2;
  desc.color_format = ColorFormat::kRGBA8888;
  desc.depth_bits = DepthBits::kZero;
  desc.stencil_bits = StencilBits::kEight;
  desc.samples = Samples::kFour;
  desc.surface_type = SurfaceType::kPBuffer;
  uiConfig = display->ChooseConfig(desc);
  if (!uiConfig) {
    desc.samples = Samples::kOne;
    uiConfig = display->ChooseConfig(desc);
    if (uiConfig) {
      RNSkLogger::logToConsole(
          "Falling back to a single sample (device doesn't support MSAA)");
    } else {
      RNSkLogger::logToConsole("Couldn't choose an offscreen config");
      return;
    }
  }

  uiContext = display->CreateContext(*uiConfig, nullptr);
  if (!uiContext) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }
  auto uiSurface = display->CreatePixelBufferSurface(*uiConfig, 1, 1);
  if (!uiContext->MakeCurrent(*uiSurface)) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }

  // 2. Create uiThreadContext
  uiThreadContext = GrDirectContext::MakeGL(GrGLMakeNativeInterface());
  if (!uiThreadContext) {
    RNSkLogger::logToConsole("Could not create uiThreadContext");
    return;
  }

  uiConfig = display->ChooseConfig(desc);
  if (!uiConfig) {
    desc.samples = Samples::kOne;
    uiConfig = display->ChooseConfig(desc);
    if (uiConfig) {
      RNSkLogger::logToConsole(
          "Falling back to a single sample (device doesn't support MSAA)");
    } else {
      RNSkLogger::logToConsole("Couldn't choose an offscreen config");
      return;
    }
  }

  uiContext = display->CreateContext(*uiConfig, nullptr);
  if (!uiContext) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }
  auto surface = display->CreatePixelBufferSurface(*uiConfig, 1, 1);
  if (!uiContext->MakeCurrent(*surface)) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }

  jsConfig = display->ChooseConfig(desc);
  if (!jsConfig) {
    desc.samples = Samples::kOne;
    jsConfig = display->ChooseConfig(desc);
    if (jsConfig) {
      RNSkLogger::logToConsole(
          "Falling back to a single sample (device doesn't support MSAA)");
    } else {
      RNSkLogger::logToConsole("Couldn't choose an offscreen config");
      return;
    }
  }

  jsContext = display->CreateContext(*jsConfig, nullptr);
  if (!jsContext) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }
  auto jsSurface = display->CreatePixelBufferSurface(*jsConfig, 1, 1);
  if (!jsContext->MakeCurrent(*surface)) {
    RNSkLogger::logToConsole("Couldn't create the root context");
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
SkiaOpenGLContextProvider::MakeOnscreeSurface(jobject jSurface, int width,
                                              int height) {
  auto window = ANativeWindow_fromSurface(facebook::jni::Environment::current(),
                                          jSurface);
  std::unique_ptr<OnscreenSurface> onscreenSurface =
      std::make_unique<OnscreenSurface>(uiThreadContext.get(), window,
                                        display.get());
  return onscreenSurface;
}

sk_sp<SkSurface> SkiaOpenGLContextProvider::MakeOffscreenSurface(int width,
                                                                 int height) {
  // Create a new PBuffer surface with desired width and height
  auto eglSurface = display->CreatePixelBufferSurface(*jsConfig, width, height);
  // auto context = display->CreateContext(*config, context.get());
  if (!jsContext->MakeCurrent(*eglSurface)) {
    RNSkLogger::logToConsole("Couldn't make context current");
    return nullptr;
  }

  GrGLFramebufferInfo info;
  info.fFBOID = 0;
  info.fFormat = 0x8058; // GL_RGBA8;

  auto samples = static_cast<int>(Samples::kFour);
  int stencilBits = static_cast<int>(StencilBits::kEight);

  GrBackendRenderTarget backendRT(width, height, samples, stencilBits, info);

  sk_sp<SkSurface> surface = SkSurface::MakeFromBackendRenderTarget(
      jsThreadContext.get(), backendRT, kBottomLeft_GrSurfaceOrigin,
      kRGBA_8888_SkColorType, nullptr, nullptr);

  if (!surface) {
    RNSkLogger::logToConsole("Failed to create offscreen surface");
  }

  return surface;
}

sk_sp<SkSurface>
SkiaOpenGLContextProvider::MakeSnapshottingSurface(int width, int height) {
  // Create a new PBuffer surface with desired width and height
  auto eglSurface = display->CreatePixelBufferSurface(*uiConfig, width, height);
  // auto context = display->CreateContext(*config, context.get());
  if (!uiContext->MakeCurrent(*eglSurface)) {
    RNSkLogger::logToConsole("Couldn't make context current");
    return nullptr;
  }

  GrGLFramebufferInfo info;
  info.fFBOID = 0;
  info.fFormat = 0x8058; // GL_RGBA8;

  auto samples = static_cast<int>(Samples::kFour);
  int stencilBits = static_cast<int>(StencilBits::kEight);

  GrBackendRenderTarget backendRT(width, height, samples, stencilBits, info);

  sk_sp<SkSurface> surface = SkSurface::MakeFromBackendRenderTarget(
      uiThreadContext.get(), backendRT, kBottomLeft_GrSurfaceOrigin,
      kRGBA_8888_SkColorType, nullptr, nullptr);

  if (!surface) {
    RNSkLogger::logToConsole("Failed to create offscreen surface");
  }

  return surface;
}

} // namespace RNSkia