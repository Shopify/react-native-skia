#pragma once

#include <memory>
#include <string>
#include <vector>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include "JniSkiaManager.h"
#include "RNSkAndroidView.h"

#include <android/bitmap.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

class JniSkiaBaseView {
public:
  JniSkiaBaseView(jni::alias_ref<JniSkiaManager::javaobject> skiaManager,
                  std::shared_ptr<RNSkBaseAndroidView> skiaView)
      : _manager(skiaManager->cthis()), _skiaAndroidView(std::move(skiaView)) {}

  ~JniSkiaBaseView() = default;

  std::shared_ptr<RNSkManager> getSkiaManager() {
    return _manager->getSkiaManager();
  }

protected:
  virtual void surfaceAvailable(jobject surface, int width, int height,
                                bool opaque) {
    _skiaAndroidView->surfaceAvailable(surface, width, height, opaque);
  }

  virtual void surfaceSizeChanged(jobject surface, int width, int height,
                                  bool opaque) {
    _skiaAndroidView->surfaceSizeChanged(surface, width, height, opaque);
  }

  virtual void surfaceDestroyed() { _skiaAndroidView->surfaceDestroyed(); }

  virtual void setDebugMode(bool show) {
    _skiaAndroidView->setShowDebugInfo(show);
  }

  virtual void registerView(int nativeId) {
    getSkiaManager()->registerSkiaView(nativeId,
                                       _skiaAndroidView->getSkiaView());
  }

  virtual void unregisterView() {
    getSkiaManager()->setSkiaView(
        _skiaAndroidView->getSkiaView()->getNativeId(), nullptr);
    getSkiaManager()->unregisterSkiaView(
        _skiaAndroidView->getSkiaView()->getNativeId());
  }

  virtual jni::local_ref<jni::JArrayByte> getBitmap(int width, int height) {
    // Default implementation - creates a green RGBA bitmap
    size_t bitmapSize = width * height * 4;
    auto byteArray = jni::JArrayByte::newArray(bitmapSize);

    // Create a vector with unsigned bytes for easier manipulation
    std::vector<uint8_t> pixels(bitmapSize);

    for (int y = 0; y < height; y++) {
      for (int x = 0; x < width; x++) {
        size_t pixelIndex = (y * width + x) * 4;
        pixels[pixelIndex] = 0;        // Red
        pixels[pixelIndex + 1] = 255;  // Green
        pixels[pixelIndex + 2] = 0;    // Blue
        pixels[pixelIndex + 3] = 255;  // Alpha
      }
    }

    // Convert unsigned bytes to signed bytes for JNI
    byteArray->setRegion(0, bitmapSize, reinterpret_cast<const int8_t*>(pixels.data()));
    return byteArray;
  }

private:
  JniSkiaManager *_manager;
  std::shared_ptr<RNSkBaseAndroidView> _skiaAndroidView;
};

} // namespace RNSkia
