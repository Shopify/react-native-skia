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

class OpenGLSharedContext {
public:
  OpenGLSharedContext(const OpenGLSharedContext &) = delete;
  OpenGLSharedContext &operator=(const OpenGLSharedContext &) = delete;

  static OpenGLSharedContext &getInstance() {
    static OpenGLSharedContext instance;
    return instance;
  }

  gl::Display *getDisplay() { return _glDisplay.get(); }
  gl::Context *getContext() { return _glContext.get(); }
  gl::Surface *getSurface() { return _glSurface.get(); };
  EGLConfig getConfig() { return _glConfig; }

private:
  std::unique_ptr<gl::Display> _glDisplay;
  std::unique_ptr<gl::Context> _glContext;
  std::unique_ptr<gl::Surface> _glSurface;
  EGLConfig _glConfig;

  OpenGLSharedContext() {
    _glDisplay = std::make_unique<gl::Display>();
    _glConfig = _glDisplay->chooseConfig();
    _glContext = _glDisplay->makeContext(_glConfig, nullptr);
    _glSurface = _glDisplay->makePixelBufferSurface(_glConfig, 1, 1);
    _glContext->makeCurrent(_glSurface.get());
  }
};

class OpenGLContext {
public:
  friend class OpenGLWindowContext;

  OpenGLContext(const OpenGLContext &) = delete;
  OpenGLContext &operator=(const OpenGLContext &) = delete;

  static OpenGLContext &getInstance() {
    static thread_local OpenGLContext instance;
    return instance;
  }

  sk_sp<SkSurface> MakeOffscreen(int width, int height, SkColorType colorType) {
    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

    auto result = _glContext->makeCurrent(_glSurface.get());
    if (!result) {
      return nullptr;
    }

    // Create texture with appropriate format based on colorType
    GrGLenum glInternalFormat = skColorTypeToGLFormat(colorType);
    auto format = GrBackendFormats::MakeGL(glInternalFormat, GL_TEXTURE_2D);
    auto texture = _directContext->createBackendTexture(
        width, height, format, SkColors::kTransparent, skgpu::Mipmapped::kNo,
        GrRenderable::kYes);

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
      break;
    case AHARDWAREBUFFER_FORMAT_R16G16B16A16_FLOAT:
      format = GrBackendFormats::MakeGL(GR_GL_RGBA16F, GR_GL_TEXTURE_EXTERNAL);
      break;
    case AHARDWAREBUFFER_FORMAT_R5G6B5_UNORM:
      GrBackendFormats::MakeGL(GR_GL_RGB565, GR_GL_TEXTURE_EXTERNAL);
      break;
    case AHARDWAREBUFFER_FORMAT_R10G10B10A2_UNORM:
      format = GrBackendFormats::MakeGL(GR_GL_RGB10_A2, GR_GL_TEXTURE_EXTERNAL);
      break;
    case AHARDWAREBUFFER_FORMAT_R8G8B8_UNORM:
      format = GrBackendFormats::MakeGL(GR_GL_RGB8, GR_GL_TEXTURE_EXTERNAL);
      break;
#if __ANDROID_API__ >= 33
    case AHARDWAREBUFFER_FORMAT_R8_UNORM:
      format = GrBackendFormats::MakeGL(GR_GL_R8, GR_GL_TEXTURE_EXTERNAL);
      break;
#endif
    default:
      if (requireKnownFormat) {
        format = GrBackendFormat();
      } else {
        format = GrBackendFormats::MakeGL(GR_GL_RGBA8, GR_GL_TEXTURE_EXTERNAL);
      }
    }
    auto width = static_cast<int>(description.width);
    auto height = static_cast<int>(description.height);
    auto backendTex = MakeGLBackendTexture(
        _directContext.get(), const_cast<AHardwareBuffer *>(hardwareBuffer),
        width, height, &deleteImageProc, &updateImageProc, &deleteImageCtx,
        false, format, false);
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
  std::unique_ptr<WindowContext> MakeWindow(ANativeWindow *window) {
    auto display = OpenGLSharedContext::getInstance().getDisplay();
    return std::make_unique<OpenGLWindowContext>(
        _directContext.get(), display, _glContext.get(), window,
        OpenGLSharedContext::getInstance().getConfig());
  }

  GrDirectContext *getDirectContext() { return _directContext.get(); }
  void makeCurrent() { _glContext->makeCurrent(_glSurface.get()); }

private:
  std::unique_ptr<gl::Context> _glContext;
  std::unique_ptr<gl::Surface> _glSurface;
  sk_sp<GrDirectContext> _directContext;

  GrGLenum skColorTypeToGLFormat(SkColorType colorType) {
    switch (colorType) {
      case kRGBA_8888_SkColorType:
        return 0x8058; // GL_RGBA8
      case kBGRA_8888_SkColorType:
        return 0x8058; // GL_RGBA8 (will handle swizzling in shader)
      case kRGB_565_SkColorType:
        return 0x8D62; // GL_RGB565
      case kARGB_4444_SkColorType:
        return 0x8033; // GL_RGBA4
      case kRGBA_F16_SkColorType:
      case kRGBA_F16Norm_SkColorType:
        return 0x881A; // GL_RGBA16F
      case kGray_8_SkColorType:
        return 0x8229; // GL_R8
      case kRGBA_1010102_SkColorType:
        return 0x8059; // GL_RGB10_A2
      default:
        return 0x8058; // GL_RGBA8 fallback
    }
  }

  OpenGLContext() {
    auto display = OpenGLSharedContext::getInstance().getDisplay();
    auto sharedContext = OpenGLSharedContext::getInstance().getContext();
    auto glConfig = OpenGLSharedContext::getInstance().getConfig();
    _glContext = display->makeContext(glConfig, sharedContext);
    _glSurface = display->makePixelBufferSurface(glConfig, 1, 1);
    _glContext->makeCurrent(_glSurface.get());
    auto backendInterface = GrGLMakeNativeInterface();
    _directContext = GrDirectContexts::MakeGL(backendInterface);

    if (_directContext == nullptr) {
      throw std::runtime_error("GrDirectContexts::MakeGL failed");
    }
  }
};

} // namespace RNSkia
