#pragma once

#include <memory>
#include <string>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include "JniSkiaBaseView.h"
#include "JniSkiaManager.h"
#include "RNSkAndroidView.h"
#include "RNSkDomView.h"

#include <android/native_window.h>
#include <android/native_window_jni.h>
#include <fbjni/detail/Hybrid.h>

namespace RNSkia {

namespace jsi = facebook::jsi;
namespace jni = facebook::jni;

class JniSkiaDomView : public jni::HybridClass<JniSkiaDomView>,
                       public JniSkiaBaseView {
public:
  static auto constexpr kJavaDescriptor =
      "Lcom/shopify/reactnative/skia/SkiaDomView;";

  static jni::local_ref<jhybriddata>
  initHybrid(jni::alias_ref<jhybridobject> jThis,
             jni::alias_ref<JniSkiaManager::javaobject> skiaManager) {
    return makeCxxInstance(jThis, skiaManager);
  }

  static void registerNatives() {
    registerHybrid(
        {makeNativeMethod("initHybrid", JniSkiaDomView::initHybrid),
         makeNativeMethod("surfaceAvailable", JniSkiaDomView::surfaceAvailable),
         makeNativeMethod("surfaceDestroyed", JniSkiaDomView::surfaceDestroyed),
         makeNativeMethod("surfaceSizeChanged",
                          JniSkiaDomView::surfaceSizeChanged),
         makeNativeMethod("setDebugMode", JniSkiaDomView::setDebugMode),
         makeNativeMethod("registerView", JniSkiaDomView::registerView),
         makeNativeMethod("unregisterView", JniSkiaDomView::unregisterView)});
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

private:
  friend HybridBase;

  explicit JniSkiaDomView(
      jni::alias_ref<jhybridobject> jThis,
      jni::alias_ref<JniSkiaManager::javaobject> skiaManager)
      : JniSkiaBaseView(skiaManager,
                        std::make_shared<RNSkAndroidView<RNSkia::RNSkDomView>>(
                            skiaManager->cthis()->getPlatformContext())) {}

  jni::global_ref<javaobject> javaPart_;
};

} // namespace RNSkia
