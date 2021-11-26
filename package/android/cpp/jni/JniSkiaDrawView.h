#pragma once

#include <EGL/egl.h>
#include <GLES2/gl2.h>
#include <fbjni/fbjni.h>
#include <jni.h>
#include <jsi/jsi.h>
#include <thread>

#include <RNSkDrawView.h>
#include "JniPlatformContext.h"
#include "JniSkiaDrawView.h"

namespace RNSkia
{
    using namespace facebook;

    class JniSkiaManager;

    using JavaPlatformContext = jni::alias_ref<JniPlatformContext::javaobject>;

    using DrawingContext = struct
    {
        EGLContext glContext;
        sk_sp<GrDirectContext> skContext;
    };

    static std::map<std::thread::id, std::shared_ptr<DrawingContext>> threadContexts;

    class JniSkiaDrawView : public jni::HybridClass<JniSkiaDrawView>,
                            public RNSkDrawView
    {
    public:
        static auto constexpr kJavaDescriptor = "Lcom/shopify/reactnative/skia/SkiaDrawView;";
        static auto constexpr TAG = "ReactNativeSkia";

        static jni::local_ref<jhybriddata> initHybrid(
            jni::alias_ref<jhybridobject>,
            JavaPlatformContext);

        static void registerNatives();

        void surfaceAvailable(jobject, int, int);
        void surfaceDestroyed();
        void surfaceSizeChanged(int, int);

        void updateTouchPoints(jni::JArrayDouble touches);

    protected:
        void drawFrame(double timestamp) override;
        void setMode(std::string mode);
        void setDebugMode(bool show);

    private:
        friend HybridBase;

        bool ensureOpenGLSurface();
        bool ensureSkiaRenderTarget();

        static bool ensureStaticOpenGLContext();
        static bool ensureStaticSkiaContext();

        /** To be able to use static contexts (and avoid reloading the skia context for each
     * new view, we track the OpenGL and Skia drawing context per thread.
     * @return The drawing context for the current thread
     */
        static std::shared_ptr<DrawingContext> getThreadDrawingContext();

        static EGLDisplay _glDisplay;
        static EGLConfig _glConfig;

        GrBackendRenderTarget _skRenderTarget;
        EGLSurface _glSurface = EGL_NO_SURFACE;

        ANativeWindow *_nativeWindow = nullptr;

        sk_sp<SkSurface> _skSurface;
        std::shared_ptr<RNSkPlatformContext> _platformContext;

        int _width = 0;
        int _height = 0;
        int _prevWidth = 0;
        int _prevHeight = 0;

        jni::global_ref<JniSkiaDrawView::javaobject> javaPart_;

        explicit JniSkiaDrawView(
            jni::alias_ref<JniSkiaDrawView::jhybridobject> jThis,
            JavaPlatformContext platformContext)
            : javaPart_(jni::make_global(jThis)),
              _platformContext(platformContext->cthis()),
              RNSkDrawView((std::shared_ptr<RNSkia::RNSkPlatformContext>)platformContext->cthis()) {}
    };

} // namespace RNSkia
