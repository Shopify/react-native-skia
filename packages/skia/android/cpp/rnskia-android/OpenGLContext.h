#pragma once

#include "GrAHardwareBufferUtils.h"
#include "OpenGLWindowContext.h"
#include "gl/Display.h"

#include "include/core/SkCanvas.h"
#include "include/core/SkColorSpace.h"
#include "include/core/SkSurface.h"
#include "include/gpu/ganesh/GrDirectContext.h"
#include "include/gpu/ganesh/SkImageGanesh.h"
#include "include/gpu/ganesh/gl/GrGLBackendSurface.h"
#include "include/gpu/ganesh/gl/GrGLDirectContext.h"
#include "include/gpu/ganesh/gl/GrGLInterface.h"
#include "src/gpu/ganesh/gl/GrGLDefines.h"

namespace RNSkia {

class OpenGLContext {
public:
  friend class OpenGLWindowContext;

  OpenGLContext(const OpenGLContext &) = delete;
  OpenGLContext &operator=(const OpenGLContext &) = delete;

  static OpenGLContext &getInstance() {
    static thread_local OpenGLContext instance;
    return instance;
  }

  sk_sp<SkSurface> MakeOffscreen(int width, int height) {
    auto colorType = kRGBA_8888_SkColorType;

    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

    auto result = _glContext->makeCurrent(_glSurface.get());
    if (!result) {
      return nullptr;
    }

    // Create texture
    auto texture = _directContext->createBackendTexture(
        width, height, colorType, skgpu::Mipmapped::kNo, GrRenderable::kYes);

    if (!texture.isValid()) {
      RNSkLogger::logToConsole("couldn't create offscreen texture %dx%d", width,
                               height);
    }

    struct ReleaseContext {
      GrDirectContext *directContext;
      GrBackendTexture texture;
    };

    auto releaseCtx = new ReleaseContext{.directContext = _directContext.get(),
                                         .texture = texture};

    // Create a SkSurface from the GrBackendTexture
    return SkSurfaces::WrapBackendTexture(
        _directContext.get(), texture, kTopLeft_GrSurfaceOrigin, 0, colorType,
        nullptr, &props,
        [](void *addr) {
          auto releaseCtx = reinterpret_cast<ReleaseContext *>(addr);
          releaseCtx->directContext->deleteBackendTexture(releaseCtx->texture);
          delete releaseCtx;
        },
        releaseCtx);
  }

  sk_sp<SkImage> MakeImageFromBuffer(void *buffer,
                                     bool requireKnownFormat = false) {
#if __ANDROID_API__ >= 26
    const AHardwareBuffer *hardwareBuffer =
        static_cast<AHardwareBuffer *>(buffer);
    DeleteImageProc deleteImageProc = nullptr;
    UpdateImageProc updateImageProc = nullptr;
    TexImageCtx deleteImageCtx = nullptr;

    AHardwareBuffer_Desc description;
    AHardwareBuffer_describe(hardwareBuffer, &description);
    GrBackendFormat format;
    switch (description.format) {
    // TODO: find out if we can detect, which graphic buffers support
    // GR_GL_TEXTURE_2D
    case AHARDWAREBUFFER_FORMAT_R8G8B8A8_UNORM:
      format = GrBackendFormats::MakeGL(GR_GL_RGBA8, GR_GL_TEXTURE_EXTERNAL);
    case AHARDWAREBUFFER_FORMAT_R16G16B16A16_FLOAT:
      format = GrBackendFormats::MakeGL(GR_GL_RGBA16F, GR_GL_TEXTURE_EXTERNAL);
    case AHARDWAREBUFFER_FORMAT_R5G6B5_UNORM:
      format = GrBackendFormats::MakeGL(GR_GL_RGB565, GR_GL_TEXTURE_EXTERNAL);
    case AHARDWAREBUFFER_FORMAT_R10G10B10A2_UNORM:
      format = GrBackendFormats::MakeGL(GR_GL_RGB10_A2, GR_GL_TEXTURE_EXTERNAL);
    case AHARDWAREBUFFER_FORMAT_R8G8B8_UNORM:
      format = GrBackendFormats::MakeGL(GR_GL_RGB8, GR_GL_TEXTURE_EXTERNAL);
#if __ANDROID_API__ >= 33
    case AHARDWAREBUFFER_FORMAT_R8_UNORM:
      format = GrBackendFormats::MakeGL(GR_GL_R8, GR_GL_TEXTURE_EXTERNAL);
#endif
    default:
      if (requireKnownFormat) {
        format = GrBackendFormat();
      } else {
        format = GrBackendFormats::MakeGL(GR_GL_RGBA8, GR_GL_TEXTURE_EXTERNAL);
      }
    }

    auto backendTex = MakeGLBackendTexture(
        _directContext.get(), const_cast<AHardwareBuffer *>(hardwareBuffer),
        description.width, description.height, &deleteImageProc,
        &updateImageProc, &deleteImageCtx, false, format, false);
    if (!backendTex.isValid()) {
      RNSkLogger::logToConsole(
          "Failed to convert HardwareBuffer to OpenGL Texture!");
      return nullptr;
    }
    sk_sp<SkImage> image = SkImages::BorrowTextureFrom(
        _directContext.get(), backendTex, kTopLeft_GrSurfaceOrigin,
        kRGBA_8888_SkColorType, kOpaque_SkAlphaType, nullptr, deleteImageProc,
        deleteImageCtx);
    return image;
#else
    throw std::runtime_error(
        "HardwareBuffers are only supported on Android API 26 or higher! Set "
        "your minSdk to 26 (or higher) and try again.");
#endif
  }

  // TODO: remove width, height
  std::unique_ptr<WindowContext> MakeWindow(ANativeWindow *window, int width,
                                            int height) {
    return std::make_unique<OpenGLWindowContext>(_directContext, _glDisplay.get(), _glContext.get(), window);
  }

private:
  EGLConfig _glConfig;
  std::unique_ptr<gl::Display> _glDisplay;
  std::unique_ptr<gl::Context> _glContext;
  std::unique_ptr<gl::Surface> _glSurface;
  sk_sp<GrDirectContext> _directContext;

  OpenGLContext() {
    _glDisplay = std::make_unique<gl::Display>();
    _glConfig = _glDisplay->chooseConfig();
    _glContext = _glDisplay->makeContext(_glConfig, nullptr);
    _glSurface = _glDisplay->makePixelBufferSurface(_glConfig, 1, 1);
    _glContext->makeCurrent(_glSurface.get());
    auto backendInterface = GrGLMakeNativeInterface();
    _directContext = GrDirectContexts::MakeGL(backendInterface);

    if (_directContext == nullptr) {
      throw std::runtime_error("GrDirectContexts::MakeGL failed");
    }
  }
};

} // namespace RNSkia