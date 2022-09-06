#pragma once

#include <memory>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include <RNSkView.h>
#include <RNSkAndroidView.h>
#include <JniSkiaBaseView.h>
#include <JniSkiaManager.h>
#include <RNSkManager.h>

#include <android/native_window.h>
#include <android/native_window_jni.h>
#include <fbjni/detail/Hybrid.h>

namespace RNSkia {
    using namespace facebook;
    using namespace jni;

    using JavaSkiaManager = jni::alias_ref<JniSkiaManager::javaobject>;

    class JniSkiaDrawView : public jni::HybridClass<JniSkiaDrawView>, public SkiaViewProvider {
    public:
        static auto constexpr kJavaDescriptor = "Lcom/shopify/reactnative/skia/SkiaDrawView;";

        static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis,
                                                      JavaSkiaManager skiaManager) {
          return makeCxxInstance(jThis, skiaManager);
        }

        void updateTouchPoints(jni::JArrayDouble touches) {
          _skiaView->updateTouchPoints(touches);
        }

        void surfaceAvailable(jobject surface, int width, int height) {
          _skiaView->surfaceAvailable(
                  ANativeWindow_fromSurface(Environment::current(), surface), width, height);
        }

        void surfaceSizeChanged(int width, int height) {
          _skiaView->surfaceSizeChanged(width, height);
        }

        void surfaceDestroyed() {
          _skiaView->surfaceDestroyed();
        }

        void setMode(std::string mode) {
          _skiaView->setMode(mode);
        }

        void setDebugMode(bool show) {
          _skiaView->setShowDebugInfo(show);
        }

        static void registerNatives() {
          registerHybrid({
                                 makeNativeMethod("surfaceAvailable",
                                                  JniSkiaDrawView::surfaceAvailable),
                                 makeNativeMethod("surfaceDestroyed",
                                                  JniSkiaDrawView::surfaceDestroyed),
                                 makeNativeMethod("surfaceSizeChanged",
                                                  JniSkiaDrawView::surfaceSizeChanged),
                                 makeNativeMethod("setMode", JniSkiaDrawView::setMode),
                                 makeNativeMethod("setDebugMode", JniSkiaDrawView::setDebugMode),
                                 makeNativeMethod("updateTouchPoints",
                                                  JniSkiaDrawView::updateTouchPoints),
                                 makeNativeMethod("initHybrid", JniSkiaDrawView::initHybrid),
                                 makeNativeMethod("registerView", JniSkiaDrawView::registerView),
                                 makeNativeMethod("unregisterView", JniSkiaDrawView::unregisterView)
                         });
        }

        void registerView(int nativeId) {
          _manager->getSkiaManager()->registerSkiaDrawView(nativeId, _skiaView->getSkiaView());
        }

        void unregisterView() {
          _manager->getSkiaManager()->unregisterSkiaDrawView(
                  _skiaView->getSkiaView()->getNativeId());
        }

    protected:
        void releaseSurface() {
          jni::ThreadScope ts;
          static auto method = javaPart_->getClass()->getMethod<void(void)>("releaseSurface");
          method(javaPart_.get());
        };

    private:
        friend HybridBase;
        jni::global_ref<JniSkiaDrawView::javaobject> javaPart_;

        explicit JniSkiaDrawView(jni::alias_ref<JniSkiaDrawView::jhybridobject> jThis,
                                 JavaSkiaManager skiaManager) :
                javaPart_(jni::make_global(jThis)),
                _manager(skiaManager->cthis()),
                _skiaView(std::make_shared<RNSkAndroidView<RNSkia::RNSkJsView>>(
                        skiaManager->cthis()->getPlatformContext(),
                        std::bind(&JniSkiaDrawView::releaseSurface, this))) {
        }

        std::shared_ptr<RNSkBaseAndroidView> _skiaView;
        std::shared_ptr<JniSkiaManager> _manager;

    };

} // namespace RNSkia
