#pragma once

#include "OpenGLWindowContext.h"
#include "opengl/Display.h"

#include "include/core/SkCanvas.h"
#include "include/core/SkColorSpace.h"
#include "include/core/SkSurface.h"
#include "include/gpu/ganesh/GrDirectContext.h"
#include "include/gpu/ganesh/gl/GrGLDirectContext.h"
#include "include/gpu/ganesh/gl/GrGLInterface.h"

class OpenGLContext {
public:
  OpenGLContext(const OpenGLContext &) = delete;
  OpenGLContext &operator=(const OpenGLContext &) = delete;

  static OpenGLContext &getInstance() {
    static thread_local OpenGLContext instance;
    return instance;
  }

  sk_sp<SkSurface> MakeOffscreen(int width, int height) {
  auto colorType = kRGBA_8888_SkColorType;

  SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

  auto result = _ctx->makeCurrent(*_surface);
  if (!result) {
    return nullptr;
  }

  // Create texture
  auto texture = _directContext->createBackendTexture(
      width, height, colorType, skgpu::Mipmapped::kNo, GrRenderable::kYes);

  if (!texture.isValid()) {
    RNSkia::RNSkLogger::logToConsole("couldn't create offscreen texture %dx%d", width,
                             height);
  }

  struct ReleaseContext {
    GrDirectContext* directContext;
    GrBackendTexture texture;
  };

  auto releaseCtx = new ReleaseContext{
      .directContext = _directContext.get(),
      .texture = texture
  };

  // Create a SkSurface from the GrBackendTexture
  return SkSurfaces::WrapBackendTexture(
      _directContext.get(), texture, kTopLeft_GrSurfaceOrigin, 0,
      colorType, nullptr, &props,
      [](void *addr) {
        auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);
        releaseCtx->directContext->deleteBackendTexture(
            releaseCtx->texture);
        delete releaseCtx;
      },
      releaseCtx);
  }

  sk_sp<SkImage> MakeImageFromBuffer(void *buffer) {
    return nullptr;
    // return RNSkia::SkiaOpenGLSurfaceFactory::makeImageFromHardwareBuffer(
    //     &_context, buffer);
  }

  std::unique_ptr<RNSkia::WindowContext> MakeWindow(ANativeWindow *window,
                                                    int width, int height) {
    return std::make_unique<RNSkia::OpenGLWindowContext>(_display.get(), _ctx.get(), _directContext.get(), window,width,
                                                height);
  }

private:
  std::unique_ptr<RNSkia::Display> _display;
  std::unique_ptr<RNSkia::Context> _ctx;
  std::unique_ptr<RNSkia::Surface> _surface;
  sk_sp<GrDirectContext> _directContext;

  OpenGLContext() {
    _display = std::make_unique<RNSkia::Display>();
    auto config = _display->chooseConfig();
    _ctx = _display->makeContext(config, nullptr);
    _surface = _display->makePixelBufferSurface(config, 1, 1);
    _ctx->makeCurrent(*_surface);
    auto backendInterface = GrGLMakeNativeInterface();
    _directContext = GrDirectContexts::MakeGL(backendInterface);

    if (_directContext == nullptr) {
      throw std::runtime_error("GrDirectContexts::MakeGL failed");
    }
  }
};
