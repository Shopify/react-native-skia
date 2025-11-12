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
    return jni::JArrayByte::newArray(0);
  }

protected:
  std::shared_ptr<RNSkBaseAndroidView> _skiaAndroidView;

private:
  JniSkiaManager *_manager;
};

} // namespace RNSkia
