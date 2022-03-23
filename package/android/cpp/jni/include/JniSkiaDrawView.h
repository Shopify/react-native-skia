#pragma once

#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>
#include <thread>

#include <RNSkDrawView.h>
#include "JniSkiaManager.h"
#include "JniSkiaDrawView.h"
#include "SkiaOpenGLRenderer.h"

#include <SkPicture.h>

namespace RNSkia
{
    using namespace facebook;

    using JavaSkiaManager = jni::alias_ref<JniSkiaManager::javaobject>;

    class JniSkiaDrawView : public jni::HybridClass<JniSkiaDrawView>,
                            public RNSkDrawView
    {
    public:
        static auto constexpr kJavaDescriptor = "Lcom/shopify/reactnative/skia/SkiaDrawView;";
        static auto constexpr TAG = "ReactNativeSkia";

        static jni::local_ref<jhybriddata> initHybrid(
            jni::alias_ref<jhybridobject>,
            JavaSkiaManager);

        static void registerNatives();

        void surfaceAvailable(jobject, int, int);
        void surfaceDestroyed();
        void surfaceSizeChanged(int, int);

        void updateTouchPoints(jni::JArrayDouble touches);

        ~JniSkiaDrawView();

    protected:
        int getWidth() override { return _width; }
        int getHeight() override { return _height; }

        void setMode(std::string mode);
        void setDebugMode(bool show);

    private:
        friend HybridBase;

        void drawFrame(const sk_sp<SkPicture> picture);

        int _width = 0;
        int _height = 0;

        SkiaOpenGLRenderer* _renderer = nullptr;

        jni::global_ref<JniSkiaDrawView::javaobject> javaPart_;

        explicit JniSkiaDrawView(
            jni::alias_ref<JniSkiaDrawView::jhybridobject> jThis,
            JavaSkiaManager skiaManager)
            : javaPart_(jni::make_global(jThis)),
              RNSkDrawView(skiaManager->cthis()->getPlatformContext()) {
        }
    };

} // namespace RNSkia
