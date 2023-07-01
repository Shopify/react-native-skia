#pragma once

#include <memory>
#include <vector>

#include "Display.h"
#include "Config.h"
#include "Context.h"
#include "Surface.h"
#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include "SkSurface.h"
#include "SkCanvas.h"

#include "RNSkLog.h"

#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLInterface.h"

#define GL_RGBA8 0x8058

namespace RNSkia {

class OpenGLSurfaceProvider {
 public:
  static OpenGLSurfaceProvider& Instance() {
    static OpenGLSurfaceProvider instance;
    return instance;
  }

  OpenGLSurfaceProvider(const OpenGLSurfaceProvider&) = delete;
  OpenGLSurfaceProvider& operator=(const OpenGLSurfaceProvider&) = delete;
  OpenGLSurfaceProvider(OpenGLSurfaceProvider&&) = delete;
  OpenGLSurfaceProvider& operator=(OpenGLSurfaceProvider&&) = delete;

  sk_sp<SkSurface> MakeOnscreen(ANativeWindow* window, size_t width, size_t height) {
    std::lock_guard<std::mutex> lock(mutex_);
      ConfigDescriptor desc;
      desc.api = API::kOpenGLES2;
      desc.color_format = ColorFormat::kRGBA8888;
      desc.depth_bits = DepthBits::kZero;
      desc.stencil_bits = StencilBits::kEight;
      desc.samples = Samples::kFour;
      desc.surface_type = SurfaceType::kWindow;
      auto onscreen_config = display_->ChooseConfig(desc);
      if (!onscreen_config) {
        RNSkLogger::logToConsole("ONSCREEN CONFIG IS NULL");
        LOG_EGL_ERROR;
        return nullptr;
      }
     auto onscreen_context =
      display_->CreateContext(*onscreen_config, context_.get());

    auto onscreen_surface_ = display_->CreateWindowSurface(*onscreen_config, window);
    onscreen_context->MakeCurrent(*onscreen_surface_);

    GrBackendRenderTarget backendRT(width, height, 0, 0, GrGLFramebufferInfo{0, GL_RGBA8});
    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);
    SkColorType colorType;
    colorType = kN32_SkColorType;

    sk_sp<SkSurface> onscreen = SkSurface::MakeFromBackendRenderTarget(
          gr_context_.get(), backendRT,
          kBottomLeft_GrSurfaceOrigin, colorType, nullptr, &props);
    return onscreen;
  }

  sk_sp<SkSurface> MakeOffscreen(size_t width, size_t height) {
    std::lock_guard<std::mutex> lock(mutex_);
          ConfigDescriptor desc;
      desc.api = API::kOpenGLES2;
      desc.color_format = ColorFormat::kRGBA8888;
      desc.depth_bits = DepthBits::kZero;
      desc.stencil_bits = StencilBits::kEight;
      desc.samples = Samples::kFour;
      desc.surface_type = SurfaceType::kPBuffer;
      auto offscreen_config = display_->ChooseConfig(desc);
      if (!offscreen_config) {
        LOG_EGL_ERROR;
        return nullptr;
      }
     auto offscreen_context =
      display_->CreateContext(*offscreen_config, context_.get());

    auto surface = display_->CreatePixelBufferSurface(*offscreen_config, width, height);
    offscreen_context->MakeCurrent(*surface);
    GrBackendRenderTarget backendRT(width, height, 0, 0, GrGLFramebufferInfo{0, GL_RGBA8});
    sk_sp<SkSurface> offscreen =  SkSurface::MakeFromBackendRenderTarget(
      gr_context_.get(), backendRT, kBottomLeft_GrSurfaceOrigin,
      kRGBA_8888_SkColorType, nullptr, nullptr,
      [](void *addr) {
       
      },
      nullptr);
    return offscreen;
  }

 private:
  OpenGLSurfaceProvider()
      : display_(std::make_unique<Display>()),
        config_(display_->ChooseConfig(ConfigDescriptor{})),
        context_(display_->CreateContext(*config_, nullptr)) {
    auto interface = GrGLMakeNativeInterface();
    if (interface) {
        gr_context_ = GrDirectContext::MakeGL(std::move(interface));
    }
  }

  std::mutex mutex_;
  std::unique_ptr<Display> display_;
  std::unique_ptr<Config> config_;
  std::unique_ptr<Context> context_;
  sk_sp<GrDirectContext> gr_context_;
};

}  // namespace RNSkia