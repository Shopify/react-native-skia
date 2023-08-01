#include "SkiaOpenGLContextProvider.h"

#include "EGL/egl.h"
#include "GLES2/gl2.h"

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
  config = display->ChooseConfig(desc);
  if (!config) {
    desc.samples = Samples::kOne;
    config = display->ChooseConfig(desc);
    if (config) {
        RNSkLogger::logToConsole("Falling back to a single sample (device doesn't support MSAA)");
    } else {
        RNSkLogger::logToConsole("Couldn't choose an offscreen config");
        return;
    }
  }

  context = display->CreateContext(*config, nullptr);
  if (!context) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }
  auto surface = display->CreatePixelBufferSurface(*config, 1, 1);
  if (!context->MakeCurrent(*surface)) {
    RNSkLogger::logToConsole("Couldn't create the root context");
    return;
  }
  // 2. Create uiThreadContext
  auto backendInterface = GrGLMakeNativeInterface();
  uiThreadContext = GrDirectContext::MakeGL(backendInterface);
  if (!uiThreadContext) {
    RNSkLogger::logToConsole("Could not create uiThreadContext");
    return;
  }

  // 3. Create jsThreadContext
  jsThreadContext = GrDirectContext::MakeGL(backendInterface);
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

sk_sp<SkSurface> SkiaOpenGLContextProvider::MakeOffscreenSurface(
    sk_sp<GrDirectContext> grContext, int width, int height) {
  if (grContext == jsThreadContext) {
    RNSkLogger::logToConsole("grContext is null");
    return nullptr;
  }
  grContext->resetContext();
  // auto display = std::make_unique<Display>();
  // ConfigDescriptor desc;
  // desc.api = API::kOpenGLES2;
  // desc.color_format = ColorFormat::kRGBA8888;
  // desc.depth_bits = DepthBits::kZero;
  // desc.stencil_bits = StencilBits::kEight;
  // desc.samples = Samples::kFour;
  // desc.surface_type = SurfaceType::kPBuffer;
  // auto config = display->ChooseConfig(desc);
  //   if (!config) {
  //   desc.samples = Samples::kOne;
  //   config = display->ChooseConfig(desc);
  //   if (config) {
  //       RNSkLogger::logToConsole("Falling back to a single sample (device doesn't support MSAA)");
  //   } else {
  //       RNSkLogger::logToConsole("Couldn't choose an offscreen config");
  //       return nullptr;
  //   }
  // }
  // display->ChooseConfig(desc);
  // Create a new PBuffer surface with desired width and height
  auto eglSurface = display->CreatePixelBufferSurface(*config, width, height);
 // auto context = display->CreateContext(*config, context.get());
  if (!context->MakeCurrent(*eglSurface)) {
    RNSkLogger::logToConsole("Couldn't make context current");
    return nullptr;
  }

  GrGLFramebufferInfo info;
  info.fFBOID = 0;
  info.fFormat = 0x8058;//GL_RGBA8;

  auto samples = static_cast<int>(Samples::kFour);
  int stencilBits = static_cast<int>(StencilBits::kEight);

  GrBackendRenderTarget backendRT(width, height, samples, stencilBits, info);
  // auto releaseProcLambda = [context = std::move(context)](void* /*unused*/) mutable {
  //   // The context's destructor will be called once this lambda goes out of scope.
  //   // We've moved the ownership of the context into the lambda.
  // };

  sk_sp<SkSurface> surface = SkSurface::MakeFromBackendRenderTarget(
      grContext.get(), backendRT, kBottomLeft_GrSurfaceOrigin,
      kRGBA_8888_SkColorType, nullptr, nullptr);
      // [](void* ctx) { 
      //     auto* lambda = static_cast<decltype(&releaseProcLambda)>(ctx);
      //     (*lambda)(nullptr); 
      // },
      // &releaseProcLambda);
  if (!surface) {
    RNSkLogger::logToConsole("Failed to create offscreen surface");
  }

  return surface;
}

} // namespace RNSkia