#pragma once

#include <memory>
#include <string>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include <JniSkiaManager.h>
#include <RNSkAndroidView.h>

#include <android/bitmap.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

class JniSkiaBaseView {
public:
  JniSkiaBaseView(jni::alias_ref<JniSkiaManager::javaobject> skiaManager,
                  std::shared_ptr<RNSkBaseAndroidView> skiaView)
      : _manager(skiaManager->cthis()), _skiaView(skiaView) {}

  ~JniSkiaBaseView() {}

  std::shared_ptr<RNSkManager> getSkiaManager() {
    return _manager->getSkiaManager();
  }

protected:
  virtual void updateTouchPoints(jni::JArrayDouble touches) {
    _skiaView->updateTouchPoints(touches);
  }

  virtual void surfaceAvailable(jobject surface, int width, int height) {
    _skiaView->surfaceAvailable(surface, width, height);
  }

  virtual void surfaceSizeChanged(int width, int height) {
    _skiaView->surfaceSizeChanged(width, height);
  }

  virtual void surfaceDestroyed() { _skiaView->surfaceDestroyed(); }

  virtual void setMode(std::string mode) { _skiaView->setMode(mode); }

  virtual void setDebugMode(bool show) { _skiaView->setShowDebugInfo(show); }

  virtual void registerView(int nativeId) {
    getSkiaManager()->registerSkiaView(nativeId, _skiaView->getSkiaView());
  }

  virtual void unregisterView() {
    getSkiaManager()->setSkiaView(_skiaView->getSkiaView()->getNativeId(),
                                  nullptr);
    getSkiaManager()->unregisterSkiaView(
        _skiaView->getSkiaView()->getNativeId());
    _skiaView->viewDidUnmount();
  }

  /**
   * Android specific method for rendering an offscreen GPU buffer to an Android
   * bitmap. The result can be used to render the first frame of the Skia render
   * to avoid flickering on android.
   */
  virtual jobject renderToBitmap(jobject bitmapIn, int width, int height) {
    auto platformContext = getSkiaManager()->getPlatformContext();
    auto provider = std::make_shared<RNSkImageCanvasProvider>(
        platformContext,
        std::bind(&RNSkView::requestRedraw, _skiaView->getSkiaView()), width,
        height);

    // Render into a gpu backed buffer
    _skiaView->getSkiaView()->getRenderer()->renderImmediate(provider);
    auto rect = SkRect::MakeXYWH(0, 0, width, height);
    auto image = provider->makeSnapshot(&rect);

    AndroidBitmapInfo infoIn;
    auto env = facebook::jni::Environment::current();
    void *pixels;

    // Get image info
    if (AndroidBitmap_getInfo(env, bitmapIn, &infoIn) !=
        ANDROID_BITMAP_RESULT_SUCCESS) {
      return env->NewStringUTF("failed");
    }

    // Check image
    if (infoIn.format != ANDROID_BITMAP_FORMAT_RGBA_8888 &&
        infoIn.format != ANDROID_BITMAP_FORMAT_RGB_565) {
      return env->NewStringUTF("Only support ANDROID_BITMAP_FORMAT_RGBA_8888 "
                               "and ANDROID_BITMAP_FORMAT_RGB_565");
    }

    auto imageInfo = SkImageInfo::Make(image->width(), image->height(),
                                       image->colorType(), image->alphaType());

    // Lock all images
    if (AndroidBitmap_lockPixels(env, bitmapIn, &pixels) !=
        ANDROID_BITMAP_RESULT_SUCCESS) {
      return env->NewStringUTF("AndroidBitmap_lockPixels failed!");
    }

    // Set pixels from SkImage
    image->readPixels(imageInfo, pixels, imageInfo.minRowBytes(), 0, 0);

    // Unlocks everything
    AndroidBitmap_unlockPixels(env, bitmapIn);

    image = nullptr;
    provider = nullptr;

    return bitmapIn;
  }

private:
  JniSkiaManager *_manager;
  std::shared_ptr<RNSkBaseAndroidView> _skiaView;
};

} // namespace RNSkia
