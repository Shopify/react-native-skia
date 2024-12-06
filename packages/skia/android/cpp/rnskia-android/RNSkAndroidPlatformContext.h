#pragma once

// TODO: Add android flags
#if __ANDROID_API__ >= 26
#include <android/hardware_buffer.h>
#endif
#include <exception>
#include <functional>
#include <memory>
#include <string>

#if defined(SK_GRAPHITE)
#include "DawnContext.h"
#else
#include "OpenGLContext.h"
#endif

#include "AHardwareBufferUtils.h"
#include "JniPlatformContext.h"
#include "MainThreadDispatcher.h"
#include "RNSkAndroidVideo.h"
#include "RNSkPlatformContext.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/ports/SkFontMgr_android.h"

#pragma clang diagnostic pop

namespace RNSkia {
namespace jsi = facebook::jsi;

class RNSkAndroidPlatformContext : public RNSkPlatformContext {
public:
  RNSkAndroidPlatformContext(
      JniPlatformContext *jniPlatformContext,
      std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker)
      : RNSkPlatformContext(jsCallInvoker,
                            jniPlatformContext->getPixelDensity()),
        _jniPlatformContext(jniPlatformContext) {}

  ~RNSkAndroidPlatformContext() {}

  void performStreamOperation(
      const std::string &sourceUri,
      const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) override {
    _jniPlatformContext->performStreamOperation(sourceUri, op);
  }

  void raiseError(const std::exception &err) override {
    _jniPlatformContext->raiseError(err);
  }

  sk_sp<SkSurface> makeOffscreenSurface(int width, int height) override {
#if defined(SK_GRAPHITE)
    return DawnContext::getInstance().MakeOffscreen(width, height);
#else
    return OpenGLContext::getInstance().MakeOffscreen(width, height);
#endif
  }

  std::shared_ptr<WindowContext>
  makeContextFromNativeSurface(void *surface, int width, int height) override {
#if defined(SK_GRAPHITE)
    return DawnContext::getInstance().MakeWindow(surface, width, height);
#else
    auto aWindow = reinterpret_cast<ANativeWindow *>(surface);
    return OpenGLContext::getInstance().MakeWindow(aWindow, width, height);
#endif
  }

  sk_sp<SkImage> makeImageFromNativeBuffer(void *buffer) override {
#if defined(SK_GRAPHITE)
    return DawnContext::getInstance().MakeImageFromBuffer(buffer);
#else
    return OpenGLContext::getInstance().MakeImageFromBuffer(buffer);
#endif
  }

  sk_sp<SkImage> makeImageFromNativeTexture(jsi::Runtime &runtime,
                                            jsi::Value jsiTextureInfo,
                                            int width, int height,
                                            bool mipMapped) override {
    if (!jsiTextureInfo.isObject()) {
      throw new std::runtime_error("Invalid textureInfo");
    }
    auto jsiTextureInfoObj = jsiTextureInfo.asObject(runtime);

    GrGLTextureInfo textureInfo;
    textureInfo.fTarget =
        (GrGLenum)jsiTextureInfoObj.getProperty(runtime, "fTarget").asNumber();
    textureInfo.fID =
        (GrGLuint)jsiTextureInfoObj.getProperty(runtime, "fID").asNumber();
    textureInfo.fFormat =
        (GrGLenum)jsiTextureInfoObj.getProperty(runtime, "fFormat").asNumber();
    textureInfo.fProtected =
        jsiTextureInfoObj.getProperty(runtime, "fProtected").asBool()
            ? skgpu::Protected::kYes
            : skgpu::Protected::kNo;

    OpenGLContext::getInstance().makeCurrent();
    if (glIsTexture(textureInfo.fID) == GL_FALSE) {
      throw new std::runtime_error("Invalid textureInfo");
    }

    GrBackendTexture backendTexture = GrBackendTextures::MakeGL(
        width, height,
        mipMapped ? skgpu::Mipmapped::kYes : skgpu::Mipmapped::kNo,
        textureInfo);
    return SkImages::BorrowTextureFrom(
        OpenGLContext::getInstance().getDirectContext(), backendTexture,
        kTopLeft_GrSurfaceOrigin, kRGBA_8888_SkColorType, kUnpremul_SkAlphaType,
        nullptr);
  }

  std::shared_ptr<RNSkVideo> createVideo(const std::string &url) override {
    auto jniVideo = _jniPlatformContext->createVideo(url);
    return std::make_shared<RNSkAndroidVideo>(jniVideo);
  }

  void releaseNativeBuffer(uint64_t pointer) override {
#if __ANDROID_API__ >= 26
    AHardwareBuffer *buffer = reinterpret_cast<AHardwareBuffer *>(pointer);
    AHardwareBuffer_release(buffer);
#endif
  }

  uint64_t makeNativeBuffer(sk_sp<SkImage> image) override {
#if __ANDROID_API__ >= 26
    auto bytesPerPixel = image->imageInfo().bytesPerPixel();
    int bytesPerRow = image->width() * bytesPerPixel;
    auto buf = SkData::MakeUninitialized(image->width() * image->height() *
                                         bytesPerPixel);
    SkImageInfo info =
        SkImageInfo::Make(image->width(), image->height(), image->colorType(),
                          image->alphaType());
    image->readPixels(nullptr, info, const_cast<void *>(buf->data()),
                      bytesPerRow, 0, 0);
    const void *pixelData = buf->data();

    // Define the buffer description
    AHardwareBuffer_Desc desc = {};
    // TODO: use image info here
    desc.width = image->width();
    desc.height = image->height();
    desc.layers = 1; // Single image layer
    desc.format = GetBufferFormatFromSkColorType(
        image->colorType()); // Assuming the image
                             // is in this format
    desc.usage = AHARDWAREBUFFER_USAGE_CPU_READ_OFTEN |
                 AHARDWAREBUFFER_USAGE_CPU_WRITE_OFTEN |
                 AHARDWAREBUFFER_USAGE_GPU_COLOR_OUTPUT |
                 AHARDWAREBUFFER_USAGE_GPU_SAMPLED_IMAGE;
    desc.stride = bytesPerRow; // Stride in pixels, not in bytes

    // Allocate the buffer
    AHardwareBuffer *buffer = nullptr;
    if (AHardwareBuffer_allocate(&desc, &buffer) != 0) {
      // Handle allocation failure
      return 0;
    }

    // Map the buffer to gain access to its memory
    void *mappedBuffer = nullptr;
    AHardwareBuffer_lock(buffer, AHARDWAREBUFFER_USAGE_CPU_WRITE_OFTEN, -1,
                         nullptr, &mappedBuffer);
    if (mappedBuffer == nullptr) {
      // Handle mapping failure
      AHardwareBuffer_release(buffer);
      return 0;
    }

    // Copy the image data to the buffer
    memcpy(mappedBuffer, pixelData, desc.height * bytesPerRow);

    // Unmap the buffer
    AHardwareBuffer_unlock(buffer, nullptr);

    // Return the buffer pointer as a uint64_t. It's the caller's responsibility
    // to manage this buffer.
    return reinterpret_cast<uint64_t>(buffer);
#else
    return 0;
#endif
  }

  jsi::Value getTexture(jsi::Runtime &runtime, sk_sp<SkImage> image) override {
    GrBackendTexture texture;
    if (!SkImages::GetBackendTextureFromImage(image, &texture, true)) {
      return jsi::Value::null();
    }
    return getJSITextureInfo(runtime, texture);
  }

  jsi::Value getTexture(jsi::Runtime &runtime,
                        sk_sp<SkSurface> surface) override {
    GrBackendTexture texture = SkSurfaces::GetBackendTexture(
        surface.get(), SkSurface::BackendHandleAccess::kFlushRead);
    return getJSITextureInfo(runtime, texture);
  }

  static jsi::Value getJSITextureInfo(jsi::Runtime &runtime,
                                      const GrBackendTexture &texture) {
    if (!texture.isValid()) {
      return jsi::Value::null();
    }
    GrGLTextureInfo textureInfo;
    if (!GrBackendTextures::GetGLTextureInfo(texture, &textureInfo)) {
      return jsi::Value::null();
    }

    OpenGLContext::getInstance().makeCurrent();
    glFlush();

    jsi::Object jsiTextureInfo = jsi::Object(runtime);
    jsiTextureInfo.setProperty(runtime, "fTarget", (int)textureInfo.fTarget);
    jsiTextureInfo.setProperty(runtime, "fFormat", (int)textureInfo.fFormat);
    jsiTextureInfo.setProperty(runtime, "fID", (int)textureInfo.fID);
    jsiTextureInfo.setProperty(runtime, "fProtected",
                               (bool)textureInfo.fProtected);

    return jsiTextureInfo;
  }

#if !defined(SK_GRAPHITE)
  GrDirectContext *getDirectContext() override {
    return OpenGLContext::getInstance().getDirectContext();
  }
#endif

  sk_sp<SkFontMgr> createFontMgr() override {
    return SkFontMgr_New_Android(nullptr);
  }

  void runOnMainThread(std::function<void()> task) override {
    MainThreadDispatcher::getInstance().post(std::move(task));
  }

  sk_sp<SkImage> takeScreenshotFromViewTag(size_t tag) override {
    return _jniPlatformContext->takeScreenshotFromViewTag(tag);
  }

private:
  JniPlatformContext *_jniPlatformContext;
};

} // namespace RNSkia
