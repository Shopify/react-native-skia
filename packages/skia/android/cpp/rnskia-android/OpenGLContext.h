#pragma once

#define GL_GLEXT_PROTOTYPES
#define EGL_EGLEXT_PROTOTYPES

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

#include "include/gpu/ganesh/GrBackendSurface.h"
#include "include/gpu/ganesh/gl/GrGLTypes.h"
#include "src/gpu/ganesh/gl/GrGLDefines.h"

#include <EGL/egl.h>
#include <EGL/eglext.h>
#include <GLES/gl.h>
#include <GLES/glext.h>

typedef EGLClientBuffer (*EGLGetNativeClientBufferANDROIDProc)(
        const struct AHardwareBuffer *);
typedef EGLImageKHR (*EGLCreateImageKHRProc)(EGLDisplay, EGLContext, EGLenum,
                                             EGLClientBuffer, const EGLint *);
typedef void (*EGLImageTargetTexture2DOESProc)(EGLenum, void *);

namespace RNSkia {

class OpenGLSharedContext {
public:
  OpenGLSharedContext(const OpenGLSharedContext &) = delete;
  OpenGLSharedContext &operator=(const OpenGLSharedContext &) = delete;

  static OpenGLSharedContext &getInstance() {
    static OpenGLSharedContext instance;
    return instance;
  }

  gl::Display* getDisplay() { return _glDisplay.get(); }
  gl::Context* getContext() { return _glContext.get(); }

private:
  std::unique_ptr<gl::Display> _glDisplay;
  std::unique_ptr<gl::Context> _glContext;

  OpenGLSharedContext() {
    _glDisplay = std::make_unique<gl::Display>();
    auto glConfig = _glDisplay->chooseConfig();
    _glContext = _glDisplay->makeContext(glConfig, nullptr);
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

    sk_sp<SkImage> importImage(EGLImageKHR eglImage, int width, int height) {
        if (!eglImage) {
            return nullptr;
        }


      auto result = _glContext->makeCurrent(_glSurface.get());
         if (!result) {
             return nullptr;
         }

        // Check for required extension
        const char* extensions = (const char*)glGetString(GL_EXTENSIONS);
        if (!strstr(extensions, "GL_OES_EGL_image")) {
            return nullptr;
        }

        // Create and set up texture
        GrGLuint texID;
        glGenTextures(1, &texID);
        GrGLuint target = GR_GL_TEXTURE_2D;
        glBindTexture(target, texID);

        // Set basic texture parameters
        glTexParameteri(target, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(target, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexParameteri(target, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        glTexParameteri(target, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);

        // Bind EGLImage to texture
        if (glGetError() != GL_NO_ERROR) {
            LOG_EGL_ERROR;
            return nullptr;
        }

        glEGLImageTargetTexture2DOES(target, eglImage);
        _glContext->makeCurrent(_glSurface.get());

        // Reset context state since we modified it
        _directContext->resetContext(kTextureBinding_GrGLBackendState);

        // Create backend texture with correct dimensions
        GrGLTextureInfo textureInfo;
        textureInfo.fID = texID;
        textureInfo.fTarget = target;
        textureInfo.fFormat = GR_GL_RGBA8;
        textureInfo.fProtected = skgpu::Protected(false);

        auto backendTexture = GrBackendTextures::MakeGL(
                width, height,
                skgpu::Mipmapped::kNo,
                textureInfo
        );

        if (!backendTexture.isValid()) {
            glDeleteTextures(1, &texID);
            return nullptr;
        }

        // Create SkImage from backend texture
        auto image = SkImages::AdoptTextureFrom(
                _directContext.get(),
                backendTexture,
                kTopLeft_GrSurfaceOrigin,
                kRGBA_8888_SkColorType,
                kPremul_SkAlphaType
        );

        if (!image) {
            glDeleteTextures(1, &texID);
        }

        return image;
    }

    EGLImageKHR shareImage(sk_sp<SkImage> image) {
        // Check for required extensions
        auto display = OpenGLSharedContext::getInstance().getDisplay();
        const char* eglExtensions = eglQueryString(display->getHandle(), EGL_EXTENSIONS);
        if (!strstr(eglExtensions, "EGL_KHR_image_base")) {
            return nullptr;
        }
        auto result = _glContext->makeCurrent(_glSurface.get());
        if (!result) {
            return nullptr;
        }
      GrBackendTexture backendTexture;
      if (!SkImages::GetBackendTextureFromImage(image.get(), &backendTexture, false)) {
          return nullptr;
      }
      GrGLTextureInfo texInfo;
      if (!GrBackendTextures::GetGLTextureInfo(backendTexture, &texInfo)) {
          return nullptr;
      }
        // Create EGLImage
        EGLint attribs[] = {
                EGL_IMAGE_PRESERVED_KHR, EGL_TRUE,
                EGL_NONE
        };
      _glContext->makeCurrent(_glSurface.get());

        auto eglImage = eglCreateImageKHR(display->getHandle(), _glContext->getHandle(),
                                    EGL_GL_TEXTURE_2D_KHR, (EGLClientBuffer)texInfo.fID, attribs);
        if (eglImage == EGL_NO_IMAGE_KHR) {
            LOG_EGL_ERROR;
            return nullptr;
        }
    return eglImage;
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
        auto display = OpenGLSharedContext::getInstance().getDisplay();

    return std::make_unique<OpenGLWindowContext>(
        _directContext.get(), display, _glContext.get(), window);
  }

  GrDirectContext *getDirectContext() { return _directContext.get(); }

private:
  std::unique_ptr<gl::Context> _glContext;
  std::unique_ptr<gl::Surface> _glSurface;
  sk_sp<GrDirectContext> _directContext;

  OpenGLContext() {
    auto display = OpenGLSharedContext::getInstance().getDisplay();
    auto sharedContext = OpenGLSharedContext::getInstance().getContext();
    auto glConfig = display->chooseConfig();
    EGLint context_attribs[] = {
      EGL_CONTEXT_CLIENT_VERSION, 2,
      EGL_NONE
    };
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