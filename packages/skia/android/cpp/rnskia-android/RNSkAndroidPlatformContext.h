#pragma once

// TODO: Add android flags
#if __ANDROID_API__ >= 26
#include <android/hardware_buffer.h>
#endif
#include <exception>
#include <functional>
#include <memory>
#include <string>

#include "AHardwareBufferUtils.h"
#include "JniPlatformContext.h"
#include "RNSkAndroidVideo.h"
#include "RNSkPlatformContext.h"
#include "SkiaOpenGLSurfaceFactory.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/ports/SkFontMgr_android.h"

#pragma clang diagnostic pop

namespace RNSkia {
namespace jsi = facebook::jsi;

class RNSkAndroidPlatformContext : public RNSkPlatformContext {
public:
  RNSkAndroidPlatformContext(
      JniPlatformContext *jniPlatformContext, jsi::Runtime *runtime,
      std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker)
      : RNSkPlatformContext(runtime, jsCallInvoker,
                            jniPlatformContext->getPixelDensity()),
        _jniPlatformContext(jniPlatformContext) {
    // Hook onto the notify draw loop callback in the platform context
    jniPlatformContext->setOnNotifyDrawLoop(
        [this]() { notifyDrawLoop(false); });
  }

  ~RNSkAndroidPlatformContext() { stopDrawLoop(); }

  void performStreamOperation(
      const std::string &sourceUri,
      const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) override {
    _jniPlatformContext->performStreamOperation(sourceUri, op);
  }

  void raiseError(const std::exception &err) override {
    _jniPlatformContext->raiseError(err);
  }

  sk_sp<SkSurface> makeOffscreenSurface(int width, int height) override {
    return SkiaOpenGLSurfaceFactory::makeOffscreenSurface(width, height);
  }

  sk_sp<SkImage> makeImageFromNativeBuffer(void *buffer) override {
    return SkiaOpenGLSurfaceFactory::makeImageFromHardwareBuffer(buffer);
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

  sk_sp<SkFontMgr> createFontMgr() override {
    return SkFontMgr_New_Android(nullptr);
  }

  void runOnMainThread(std::function<void()> task) override {
    _jniPlatformContext->runTaskOnMainThread(task);
  }

  sk_sp<SkImage> takeScreenshotFromViewTag(size_t tag) override {
    return _jniPlatformContext->takeScreenshotFromViewTag(tag);
  }

  void startDrawLoop() override { _jniPlatformContext->startDrawLoop(); }

  void stopDrawLoop() override { _jniPlatformContext->stopDrawLoop(); }

private:
  JniPlatformContext *_jniPlatformContext;
};

} // namespace RNSkia
