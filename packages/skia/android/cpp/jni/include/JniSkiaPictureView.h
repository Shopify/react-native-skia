#pragma once

#include <memory>
#include <string>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include "JniSkiaBaseView.h"
#include "JniSkiaManager.h"
#include "RNSkAndroidView.h"
#include "RNSkPictureView.h"

#include <android/native_window.h>
#include <android/native_window_jni.h>
#include <fbjni/detail/Hybrid.h>

#include "include/core/SkBitmap.h"
#include "include/core/SkCanvas.h"
#include "include/core/SkPictureRecorder.h"
#include "include/core/SkPaint.h"
#include "include/core/SkSurface.h"
#include "include/core/SkImage.h"
#include "include/core/SkPicture.h"
#include "OpenGLContext.h"

namespace RNSkia {
namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

class JniSkiaPictureView : public jni::HybridClass<JniSkiaPictureView>,
                           public JniSkiaBaseView {
public:
  static auto constexpr kJavaDescriptor =
      "Lcom/shopify/reactnative/skia/SkiaPictureView;";

  static jni::local_ref<jhybriddata>
  initHybrid(jni::alias_ref<jhybridobject> jThis,
             jni::alias_ref<JniSkiaManager::javaobject> skiaManager) {
    return makeCxxInstance(jThis, skiaManager);
  }

  static void registerNatives() {
    registerHybrid(
        {makeNativeMethod("initHybrid", JniSkiaPictureView::initHybrid),
         makeNativeMethod("surfaceAvailable",
                          JniSkiaPictureView::surfaceAvailable),
         makeNativeMethod("surfaceDestroyed",
                          JniSkiaPictureView::surfaceDestroyed),
         makeNativeMethod("surfaceSizeChanged",
                          JniSkiaPictureView::surfaceSizeChanged),
         makeNativeMethod("setDebugMode", JniSkiaPictureView::setDebugMode),
         makeNativeMethod("registerView", JniSkiaPictureView::registerView),
         makeNativeMethod("unregisterView",
                          JniSkiaPictureView::unregisterView),
         makeNativeMethod("getBitmap", JniSkiaPictureView::getBitmap)});
  }

protected:
  void surfaceAvailable(jobject surface, int width, int height,
                        bool opaque) override {
    JniSkiaBaseView::surfaceAvailable(surface, width, height, opaque);
  }

  void surfaceSizeChanged(jobject surface, int width, int height,
                          bool opaque) override {
    JniSkiaBaseView::surfaceSizeChanged(surface, width, height, opaque);
  }

  void surfaceDestroyed() override { JniSkiaBaseView::surfaceDestroyed(); }

  void setDebugMode(bool show) override { JniSkiaBaseView::setDebugMode(show); }

  void registerView(int nativeId) override {
    JniSkiaBaseView::registerView(nativeId);
  }

  void unregisterView() override { JniSkiaBaseView::unregisterView(); }

  jni::local_ref<jni::JArrayByte> getBitmap(int width, int height) override {
    // Get the RNSkPictureView from the android view
    auto pictureView = std::static_pointer_cast<RNSkAndroidView<RNSkia::RNSkPictureView>>(_skiaAndroidView);
    if (!pictureView) {
      return JniSkiaBaseView::getBitmap(width, height);
    }

    // Get the renderer and cast it to RNSkPictureRenderer
    auto renderer = std::static_pointer_cast<RNSkia::RNSkPictureRenderer>(pictureView->getRenderer());
    if (!renderer) {
      return JniSkiaBaseView::getBitmap(width, height);
    }

    // Get the SkPicture from the renderer
    sk_sp<SkPicture> picture = renderer->getPicture();

    // Create a GPU offscreen surface using OpenGLContext
    sk_sp<SkSurface> surface = OpenGLContext::getInstance().MakeOffscreen(width, height);

    if (!surface) {
      return jni::JArrayByte::newArray(0);
    }

    // Get the canvas from the surface
    SkCanvas* canvas = surface->getCanvas();

    // Clear the canvas with transparent background
    canvas->clear(SK_ColorTRANSPARENT);

    // Draw the picture if available
    if (picture) {
      // Get pixel density for scaling
      auto pd = pictureView->getPixelDensity();
      canvas->save();
      canvas->scale(pd, pd);
      canvas->drawPicture(picture);
      canvas->restore();
    }

    // Get the image from the surface
    sk_sp<SkImage> image = surface->makeImageSnapshot()->makeNonTextureImage();

    // Read pixels from the image
    size_t bitmapSize = width * height * 4;
    std::vector<uint8_t> pixels(bitmapSize);

    SkImageInfo readInfo = SkImageInfo::Make(width, height, kRGBA_8888_SkColorType, kUnpremul_SkAlphaType);
    if (!image->readPixels(nullptr, readInfo, pixels.data(), width * 4, 0, 0)) {
      return jni::JArrayByte::newArray(0);
    }

    // Create Java byte array and copy pixel data
    auto byteArray = jni::JArrayByte::newArray(bitmapSize);
    byteArray->setRegion(0, bitmapSize, reinterpret_cast<const int8_t*>(pixels.data()));

    return byteArray;
  }

private:
  friend HybridBase;

  explicit JniSkiaPictureView(
      jni::alias_ref<jhybridobject> jThis,
      jni::alias_ref<JniSkiaManager::javaobject> skiaManager)
      : JniSkiaBaseView(
            skiaManager,
            std::make_shared<RNSkAndroidView<RNSkia::RNSkPictureView>>(
                skiaManager->cthis()->getPlatformContext())) {}

  jni::global_ref<javaobject> javaPart_;
};

} // namespace RNSkia
