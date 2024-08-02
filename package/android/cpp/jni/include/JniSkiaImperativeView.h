#pragma once

#include <memory>
#include <string>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include "JniSkiaBaseView.h"
#include "JniSkiaManager.h"
#include "RNSkAndroidView.h"
#include "RNSkImperativeView.h"

#include <android/native_window.h>
#include <android/native_window_jni.h>
#include <fbjni/detail/Hybrid.h>

namespace RNSkia {
namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

class JniSkiaImperativeView : public jni::HybridClass<JniSkiaImperativeView>,
                           public JniSkiaBaseView {
public:
  static auto constexpr kJavaDescriptor =
      "Lcom/shopify/reactnative/skia/SkiaImperativeView;";

  static jni::local_ref<jhybriddata>
  initHybrid(jni::alias_ref<jhybridobject> jThis,
             jni::alias_ref<JniSkiaManager::javaobject> skiaManager) {
    return makeCxxInstance(jThis, skiaManager);
  }

  static void registerNatives() {
    registerHybrid(
        {makeNativeMethod("initHybrid", JniSkiaImperativeView::initHybrid),
         makeNativeMethod("surfaceAvailable",
                          JniSkiaImperativeView::surfaceAvailable),
         makeNativeMethod("surfaceDestroyed",
                          JniSkiaImperativeView::surfaceDestroyed),
         makeNativeMethod("surfaceSizeChanged",
                          JniSkiaImperativeView::surfaceSizeChanged),
         makeNativeMethod("setMode", JniSkiaImperativeView::setMode),
         makeNativeMethod("setDebugMode", JniSkiaImperativeView::setDebugMode),
         makeNativeMethod("updateTouchPoints",
                          JniSkiaImperativeView::updateTouchPoints),
         makeNativeMethod("registerView", JniSkiaImperativeView::registerView),
         makeNativeMethod("unregisterView",
                          JniSkiaImperativeView::unregisterView)});
  }

protected:
  void updateTouchPoints(jni::JArrayDouble touches) override {
    JniSkiaBaseView::updateTouchPoints(touches);
  }

  void surfaceAvailable(jobject surface, int width, int height) override {
    JniSkiaBaseView::surfaceAvailable(surface, width, height);
  }

  void surfaceSizeChanged(int width, int height) override {
    JniSkiaBaseView::surfaceSizeChanged(width, height);
  }

  void surfaceDestroyed() override { JniSkiaBaseView::surfaceDestroyed(); }

  void setMode(std::string mode) override { JniSkiaBaseView::setMode(mode); }

  void setDebugMode(bool show) override { JniSkiaBaseView::setDebugMode(show); }

  void registerView(int nativeId) override {
    JniSkiaBaseView::registerView(nativeId);
  }

  void unregisterView() override { JniSkiaBaseView::unregisterView(); }

private:
  friend HybridBase;

  explicit JniSkiaImperativeView(
      jni::alias_ref<jhybridobject> jThis,
      jni::alias_ref<JniSkiaManager::javaobject> skiaManager)
      : JniSkiaBaseView(
            skiaManager,
            std::make_shared<RNSkAndroidView<RNSkia::RNSkImperativeView>>(
                skiaManager->cthis()->getPlatformContext())) {}

  jni::global_ref<javaobject> javaPart_;
};

} // namespace RNSkia
