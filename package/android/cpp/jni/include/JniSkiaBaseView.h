#pragma once

#include <memory>

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>

#include <JniSkiaManager.h>

namespace RNSkia {
    using namespace facebook;
    using namespace jni;

    class JniSkiaBaseView {
    public:
        JniSkiaBaseView(jni::alias_ref<JniSkiaManager::javaobject> skiaManager) :
                _manager(skiaManager->cthis()) {}

        ~JniSkiaBaseView() {}

        std::shared_ptr<RNSkManager> getSkiaManager() { return _manager->getSkiaManager(); };

        virtual std::shared_ptr<RNSkBaseAndroidView> getAndroidSkiaView() = 0;

    protected:
        virtual void updateTouchPoints(jni::JArrayDouble touches) {
          getAndroidSkiaView()->updateTouchPoints(touches);
        }

        virtual void surfaceAvailable(jobject surface, int width, int height) {
          getAndroidSkiaView()->surfaceAvailable(surface, width, height);
        }

        virtual void surfaceSizeChanged(int width, int height) {
          getAndroidSkiaView()->surfaceSizeChanged(width, height);
        }

        virtual void surfaceDestroyed() {
          getAndroidSkiaView()->surfaceDestroyed();
        }

        virtual void setMode(std::string mode) {
          getAndroidSkiaView()->setMode(mode);
        }

        virtual void setDebugMode(bool show) {
          getAndroidSkiaView()->setShowDebugInfo(show);
        }

        virtual void registerView(int nativeId) {
          getSkiaManager()->registerSkiaView(nativeId,
                                             getAndroidSkiaView()->getSkiaView());
        }

        virtual void unregisterView() {
          getSkiaManager()->unregisterSkiaView(
                  getAndroidSkiaView()->getSkiaView()->getNativeId());
        }

    private:
        JniSkiaManager *_manager;
    };

} // namespace RNSkia
