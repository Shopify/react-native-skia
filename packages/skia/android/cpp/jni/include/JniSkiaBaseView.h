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

#include "include/core/SkCanvas.h"
#include "include/core/SkPaint.h"
#include "include/core/SkSurface.h"
#include "include/core/SkImage.h"
#include "include/core/SkColorSpace.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JniSkiaBaseView {
public:
  JniSkiaBaseView(jni::alias_ref<JniSkiaManager::javaobject> skiaManager,
                  std::shared_ptr<RNSkBaseAndroidView> skiaView)
      : _skiaAndroidView(std::move(skiaView)), _manager(skiaManager->cthis()) {}

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
    // Create an offscreen Skia surface
    SkImageInfo info = SkImageInfo::MakeN32Premul(width, height);
    sk_sp<SkSurface> surface = SkSurfaces::Raster(info);

    if (!surface) {
      // Fallback to empty array if surface creation fails
      return jni::JArrayByte::newArray(0);
    }

    // Get the canvas from the surface
    SkCanvas* canvas = surface->getCanvas();

    // Clear the canvas with transparent background
    canvas->clear(SK_ColorTRANSPARENT);

    // Set up paint for cyan circle
    SkPaint paint;
    paint.setColor(SK_ColorRED);
    paint.setAntiAlias(true);

    // Draw a cyan circle with radius 100 at the center of the surface
    float centerX = width / 2.0f;
    float centerY = height / 2.0f;
    float radius = 160.0f;
    canvas->drawCircle(centerX, centerY, radius, paint);

    // Get the image from the surface
    sk_sp<SkImage> image = surface->makeImageSnapshot();

    // Read pixels from the image
    size_t bitmapSize = width * height * 4;
    std::vector<uint8_t> pixels(bitmapSize);

    SkImageInfo readInfo = SkImageInfo::Make(width, height, kRGBA_8888_SkColorType, kUnpremul_SkAlphaType);
    // Pass nullptr for GrDirectContext since we're using a raster surface
    if (!image->readPixels(nullptr, readInfo, pixels.data(), width * 4, 0, 0)) {
      // If reading pixels fails, return empty array
      return jni::JArrayByte::newArray(0);
    }

    // Create Java byte array and copy pixel data
    auto byteArray = jni::JArrayByte::newArray(bitmapSize);
    byteArray->setRegion(0, bitmapSize, reinterpret_cast<const int8_t*>(pixels.data()));

    return byteArray;
  }

protected:
  std::shared_ptr<RNSkBaseAndroidView> _skiaAndroidView;

private:
  JniSkiaManager *_manager;
};

} // namespace RNSkia
