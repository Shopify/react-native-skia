#include "JniSkiaDrawView.h"
#include "RNSkLog.h"

#include <memory>
#include <string>
#include <vector>

#include <GLES2/gl2.h>
#include <EGL/eglplatform.h>
#include <android/native_window.h>
#include <android/native_window_jni.h>

#include <SkCanvas.h>
#include <SkImageInfo.h>
#include <SkSurface.h>
#include <gpu/GrDirectContext.h>
#include <gpu/GrBackendSurface.h>
#include <gpu/gl/GrGLInterface.h>
#include <gpu/gl/GrGLTypes.h>
#include <gpu/GrTypes.h>
#include <RNSkInfoParameter.h>

namespace RNSkia
{
    using namespace facebook;
    using namespace jni;

    using TSelf = local_ref<HybridClass<JniSkiaDrawView>::jhybriddata>;

    /**** DTOR ***/
    JniSkiaDrawView::~JniSkiaDrawView()
    {
#if LOG_ALL_DRAWING
        RNSkLogger::logToConsole("JniSkiaDrawView::~JniSkiaDrawView %i", getNativeId());
#endif
    }

    /**** JNI ****/

    TSelf JniSkiaDrawView::initHybrid(
        alias_ref<HybridClass::jhybridobject> jThis,
        JavaSkiaManager skiaManager)
    {
        return makeCxxInstance(jThis, skiaManager);
    }

    void JniSkiaDrawView::registerNatives()
    {
        registerHybrid({makeNativeMethod("initHybrid", JniSkiaDrawView::initHybrid),
                        makeNativeMethod("surfaceAvailable", JniSkiaDrawView::surfaceAvailable),
                        makeNativeMethod("surfaceDestroyed", JniSkiaDrawView::surfaceDestroyed),
                        makeNativeMethod("surfaceSizeChanged", JniSkiaDrawView::surfaceSizeChanged),
                        makeNativeMethod("setMode", JniSkiaDrawView::setMode),
                        makeNativeMethod("setDebugMode", JniSkiaDrawView::setDebugMode),
                        makeNativeMethod("updateTouchPoints", JniSkiaDrawView::updateTouchPoints)});
    }

    void JniSkiaDrawView::setMode(std::string mode)
    {
        if (mode.compare("continuous") == 0)
        {
            setDrawingMode(RNSkDrawingMode::Continuous);
        }
        else
        {
            setDrawingMode(RNSkDrawingMode::Default);
        }
    }

    void JniSkiaDrawView::setDebugMode(bool show)
    {
        setShowDebugOverlays(show);
    }

    void JniSkiaDrawView::updateTouchPoints(jni::JArrayDouble touches)
    {
        // Create touch points
        size_t size = touches.size();
        std::vector<jdouble> buffer(size + 1L);
        std::vector<RNSkia::RNSkTouchPoint> points;
        auto pin = touches.pin();
        auto scale = getPlatformContext()->getPixelDensity();
        for (size_t i = 0; i < pin.size(); i += 2)
        {
            RNSkTouchPoint point;
            point.x = pin[i] / scale;
            point.y = pin[i + 1] / scale;
            point.force = pin[i + 2];
            point.type = (RNSkia::RNSkTouchType)pin[i + 3];
            points.push_back(point);
        }
        updateTouchState(points);
    }

    void JniSkiaDrawView::surfaceAvailable(jobject surface, int width, int height)
    {
#if LOG_ALL_DRAWING
        RNSkLogger::logToConsole("JniSkiaDrawView::surfaceAvailable %i", getNativeId());
#endif

        _width = width;
        _height = height;

        if (_renderer == nullptr)
        {
            // Create renderer!
            _renderer = new SkiaOpenGLRenderer(
                ANativeWindow_fromSurface(Environment::current(), surface), getNativeId());

            // Set the draw function
            setNativeDrawFunc(std::bind(&JniSkiaDrawView::drawFrame, this, std::placeholders::_1));

            // Redraw
            requestRedraw();
        }
    }

    void JniSkiaDrawView::surfaceSizeChanged(int width, int height)
    {
#if LOG_ALL_DRAWING
        RNSkLogger::logToConsole("JniSkiaDrawView::surfaceSizeChanged %i", getNativeId());
#endif

        _width = width;
        _height = height;

        // Redraw after size change
        requestRedraw();
    }

    void JniSkiaDrawView::surfaceDestroyed()
    {
#if LOG_ALL_DRAWING
        RNSkLogger::logToConsole("JniSkiaDrawView::surfaceDestroyed %i", getNativeId());
#endif
        if (_renderer != nullptr)
        {
            // Turn off drawing
            setNativeDrawFunc(nullptr);

            // Start teardown
            _renderer->teardown();

            // Ask for a redraw to tear down the render pipeline. This
            // needs to be done on the render thread since OpenGL demands
            // same thread access for OpenGL contexts.
            getPlatformContext()->runOnRenderThread([this]()
                                                    {
                if(_renderer != nullptr) {
                    _renderer->run(nullptr, 0, 0);
                } });

            // Wait until the above render has finished.
            _renderer->waitForTeardown();

            // Delete renderer. All resources should be released during teardown.
            delete _renderer;
            _renderer = nullptr;
        }
    }

    /**** Render method ****/

    void JniSkiaDrawView::drawFrame(const sk_sp<SkPicture> picture)
    {
        // No need to check if the renderer is nullptr since we only get here if it is not.
        _renderer->run(picture, _width, _height);
    }
} // namespace RNSkia
