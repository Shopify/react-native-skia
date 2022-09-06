#pragma once

#include <memory>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include <RNSkView.h>

#include <android/native_window.h>
#include <android/native_window_jni.h>

namespace RNSkia {
    using namespace facebook;
    using namespace jni;

    class SkiaViewProvider {
    public:
        virtual std::shared_ptr<RNSkView> getSkiaView() { return nullptr; }
    };

    class JniSkiaBaseView : public jni::HybridClass<JniSkiaBaseView>, public SkiaViewProvider {
    public:
        static auto constexpr kJavaDescriptor = "Lcom/shopify/reactnative/skia/SkiaBaseView;";

        static jni::local_ref<jhybriddata> initHybrid(jni::alias_ref<jhybridobject> jThis) {
          return makeCxxInstance(jThis);
        }

        void updateTouchPoints(jni::JArrayDouble touches) {
          throw std::runtime_error("Could not call updateTouchPoints on base Skia View instance");
        }

        void surfaceAvailable(jobject surface, int width, int height) {
          throw std::runtime_error("Could not call surfaceAvailable on base Skia View instance");
        }

        virtual void surfaceSizeChanged(int width, int height) {
          throw std::runtime_error("Could not call surfaceSizeChanged on base Skia View instance");
        }

        virtual void surfaceDestroyed() {
          throw std::runtime_error("Could not call surfaceDestroyed on base Skia View instance");
        }

        virtual void setMode(std::string mode) {
          throw std::runtime_error("Could not call setMode on base Skia View instance");
        }

        virtual void setShowDebugInfo(bool show) {
          throw std::runtime_error("Could not call setShowDebugInfo on base Skia View instance");
        }

        static void registerNatives() {
          registerHybrid({
                                 makeNativeMethod("surfaceAvailable",
                                                  JniSkiaBaseView::surfaceAvailable),
                                 makeNativeMethod("surfaceDestroyed",
                                                  JniSkiaBaseView::surfaceDestroyed),
                                 makeNativeMethod("surfaceSizeChanged",
                                                  JniSkiaBaseView::surfaceSizeChanged),
                                 makeNativeMethod("setMode", JniSkiaBaseView::setMode),
                                 makeNativeMethod("setDebugMode", JniSkiaBaseView::setShowDebugInfo),
                                 makeNativeMethod("updateTouchPoints",
                                                  JniSkiaBaseView::updateTouchPoints),
                                 makeNativeMethod("initHybrid", JniSkiaBaseView::initHybrid),
                                 makeNativeMethod("register", JniSkiaBaseView::registerView),
                                 makeNativeMethod("unregister", JniSkiaBaseView::unregisterView)
                         });
        }

        void registerView(int nativeId) {
          throw std::runtime_error("Could not call registerView on base Skia View instance");
        }

        void unregisterView() {
          throw std::runtime_error("Could not call unregisterView on base Skia View instance");
        }

    protected:

    private:
        friend HybridBase;
        jni::global_ref<JniSkiaBaseView::javaobject> javaPart_;

        explicit JniSkiaBaseView(jni::alias_ref<JniSkiaBaseView::jhybridobject> jThis) :
                javaPart_(jni::make_global(jThis)) {}
    };

} // namespace RNSkia
