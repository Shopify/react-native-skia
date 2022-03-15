#include "JniSkiaDrawView.h"
#include "RNSkLog.h"

#include <memory>
#include <string>
#include <chrono>

#include <GLES2/gl2.h>
#include <android/native_window.h>
#include <android/native_window_jni.h>

namespace RNSkia
{
    using namespace facebook;
    using namespace jni;

    using TSelf = local_ref<HybridClass<JniSkiaDrawView>::jhybriddata>;

    /**** Initialize Static members ****/
    EGLDisplay JniSkiaDrawView::_glDisplay = EGL_NO_DISPLAY;
    EGLConfig JniSkiaDrawView::_glConfig = 0;

    /** Static members */
    std::shared_ptr<DrawingContext> JniSkiaDrawView::getThreadDrawingContext()
    {
        auto threadId = std::this_thread::get_id();
        if (threadContexts.count(threadId) == 0)
        {
            auto drawingContext = std::make_shared<DrawingContext>();
            drawingContext->glContext = EGL_NO_CONTEXT;
            drawingContext->skContext = nullptr;
            threadContexts.emplace(threadId, drawingContext);
        }
        return threadContexts.at(threadId);
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
                        makeNativeMethod("updateTouchPoints", JniSkiaDrawView::updateTouchPoints),
                        makeNativeMethod("setIsRemoved", JniSkiaDrawView::setIsRemovedExternal)
        });
    }

    void JniSkiaDrawView::setMode(std::string mode)
    {
        if (mode.compare("continuous") == 0) {
            setDrawingMode(RNSkDrawingMode::Continuous);
        }
        else {
            setDrawingMode(RNSkDrawingMode::Default);
        }
    }

    void JniSkiaDrawView::setDebugMode(bool show) {
        setShowDebugOverlays(show);
    }

    void JniSkiaDrawView::updateTouchPoints(jni::JArrayDouble touches) {
        // Create touch points
        size_t size = touches.size();
        std::vector<jdouble> buffer(size + 1L);
        std::vector<RNSkia::RNSkTouchPoint> points;
        auto pin = touches.pin();
        auto scale = getPlatformContext()->getPixelDensity();
        for (size_t i = 0; i < pin.size(); i+=2) {
            RNSkTouchPoint point;
            point.x = pin[i] / scale;
            point.y = pin[i+1] / scale;
            point.force = pin[i+2];
            point.type = (RNSkia::RNSkTouchType)pin[i+3];
            points.push_back(point);
        }
        updateTouchState(points);
    }

    void JniSkiaDrawView::surfaceAvailable(jobject surface, int width, int height)
    {
        _width = width;
        _height = height;

        _nativeWindow = ANativeWindow_fromSurface(Environment::current(), surface);

        // Redraw
        requestRedraw();
    }

    void JniSkiaDrawView::surfaceSizeChanged(int width, int height)
    {
        _width = width;
        _height = height;

        // Redraw after size change
        requestRedraw();
    }

    void JniSkiaDrawView::surfaceDestroyed()
    {
        _nativeWindow = nullptr;
        _skSurface = nullptr;

        if (_glSurface != EGL_NO_SURFACE)
        {
            eglDestroySurface(_glDisplay, _glSurface);
            _glSurface = EGL_NO_SURFACE;
        }
    }

    /**** Static Initializers ****/

    bool JniSkiaDrawView::ensureStaticOpenGLContext()
    {
        if (getThreadDrawingContext()->glContext != EGL_NO_CONTEXT)
        {
            return true;
        }

        _glDisplay = eglGetDisplay(EGL_DEFAULT_DISPLAY);
        if (_glDisplay == EGL_NO_DISPLAY)
        {
            RNSkLogger::logToConsole("eglGetdisplay failed : %i", glGetError());
            return false;
        }

        EGLint major;
        EGLint minor;
        if (!eglInitialize(_glDisplay, &major, &minor))
        {
            RNSkLogger::logToConsole("eglInitialize failed : %i", glGetError());
            return false;
        }

        EGLint att[] = {
            EGL_RENDERABLE_TYPE,
            EGL_OPENGL_ES2_BIT,
            EGL_SURFACE_TYPE,
            EGL_WINDOW_BIT,
            EGL_ALPHA_SIZE,
            8,
            EGL_BLUE_SIZE,
            8,
            EGL_GREEN_SIZE,
            8,
            EGL_RED_SIZE,
            8,
            EGL_DEPTH_SIZE,
            0,
            EGL_STENCIL_SIZE,
            0,
            EGL_NONE};

        EGLint numConfigs;
        _glConfig = 0;
        if (!eglChooseConfig(_glDisplay, att, &_glConfig, 1, &numConfigs) ||
            numConfigs == 0)
        {
            RNSkLogger::logToConsole(
                "Failed to choose a config %d\n", eglGetError());
            return false;
        }

        EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};

        getThreadDrawingContext()->glContext = eglCreateContext(_glDisplay, _glConfig, NULL, contextAttribs);
        if (getThreadDrawingContext()->glContext == EGL_NO_CONTEXT)
        {
            RNSkLogger::logToConsole(
                "eglCreateContext failed: %d\n", eglGetError());
            return false;
        }

        return true;
    }

    bool JniSkiaDrawView::ensureStaticSkiaContext()
    {
        if (getThreadDrawingContext()->skContext != nullptr)
        {
            return true;
        }

        // Create the Skia backend context
        auto backendInterface = GrGLMakeNativeInterface();
        getThreadDrawingContext()->skContext = GrDirectContext::MakeGL(backendInterface);
        if (getThreadDrawingContext()->skContext == nullptr)
        {
            RNSkLogger::logToConsole("GrDirectContext::MakeGL failed");
            return false;
        }

        return true;
    }

    bool JniSkiaDrawView::ensureOpenGLSurface()
    {
        if (_nativeWindow == nullptr)
        {
            return false;
        }

        if (_glSurface != EGL_NO_SURFACE)
        {
            if (!eglMakeCurrent(_glDisplay, _glSurface, _glSurface, getThreadDrawingContext()->glContext))
            {
                RNSkLogger::logToConsole(
                    "eglMakeCurrent failed: %d\n", eglGetError());
                return false;
            }
            return true;
        }

        // Create the opengl surface
        _glSurface =
            eglCreateWindowSurface(_glDisplay, _glConfig, _nativeWindow, nullptr);
        if (_glSurface == EGL_NO_SURFACE)
        {
            RNSkLogger::logToConsole(
                "eglCreateWindowSurface failed: %d\n", eglGetError());
            return false;
        }

        if (!eglMakeCurrent(_glDisplay, _glSurface, _glSurface, getThreadDrawingContext()->glContext))
        {
            RNSkLogger::logToConsole("eglMakeCurrent failed: %d\n", eglGetError());
            return false;
        }

        return true;
    }

    bool JniSkiaDrawView::ensureSkiaRenderTarget()
    {
        if (getThreadDrawingContext()->skContext == nullptr)
        {
            return false;
        }

        if (_skSurface == nullptr ||
            !_skRenderTarget.isValid() ||
            _prevWidth != _width ||
            _prevHeight != _height)
        {
            glViewport(0, 0, _width, _height);

            _prevWidth = _width;
            _prevHeight = _height;

            GLint buffer;
            glGetIntegerv(GL_FRAMEBUFFER_BINDING, &buffer);

            GLint stencil;
            glGetIntegerv(GL_STENCIL_BITS, &stencil);

            GLint samples;
            glGetIntegerv(GL_SAMPLES, &samples);

            auto maxSamples = getThreadDrawingContext()->skContext->maxSurfaceSampleCountForColorType(
                kRGBA_8888_SkColorType);
            if (samples > maxSamples)
                samples = maxSamples;

            GrGLFramebufferInfo fbInfo;
            fbInfo.fFBOID = buffer;
            fbInfo.fFormat = 0x8058;

            _skRenderTarget =
                GrBackendRenderTarget(_width, _height, samples, stencil, fbInfo);

            _skSurface = SkSurface::MakeFromBackendRenderTarget(
                getThreadDrawingContext()->skContext.get(),
                _skRenderTarget,
                kBottomLeft_GrSurfaceOrigin,
                kRGBA_8888_SkColorType,
                nullptr,
                nullptr);

            if (!_skSurface)
            {
                RNSkLogger::logToConsole(
                    "JniSkiaDrawView::setupSurface - skSurface could not be created!");
                return false;
            }

            return true;
        }
        return true;
    }

    void JniSkiaDrawView::drawFrame(const sk_sp<SkPicture> picture)
    {
        // Ensure we have got the surface from the java view
        if (_nativeWindow == nullptr)
        {
            return;
        }

        // Ensure we have an initialized static OpenGL context and Skia GL context
        if (!ensureStaticOpenGLContext())
        {
            RNSkLogger::logToConsole(
                "JniSkiaDrawView::drawFrame - not possible to setup global opengl context");
            return;
        }

        // Ensure we have an initialized GL surface for the surface
        if (!ensureOpenGLSurface())
        {
            RNSkLogger::logToConsole(
                "JniSkiaDrawView::drawFrame - not possible local gl surface");
            return;
        }

        // Ensure we have the initialized static Skia context
        if (!ensureStaticSkiaContext())
        {
            RNSkLogger::logToConsole(
                "JniSkiaDrawView::drawFrame - not possible to create skia context");
            return;
        }

        // Ensure that we have a skia surface on top of the gl surface
        if (!ensureSkiaRenderTarget())
        {
            RNSkLogger::logToConsole(
                "JniSkiaDrawView::drawFrame - not possible to set skia render target");
            return;
        }

        // Clear with transparent
        glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        if (getThreadDrawingContext()->skContext != nullptr)
        {
            getThreadDrawingContext()->skContext->resetContext();
        }
        else
        {
            return;
        }

        // Draw in surface!
        _skSurface->getCanvas()->drawPicture(picture);

        if (getThreadDrawingContext()->skContext != nullptr)
        {
            getThreadDrawingContext()->skContext->flush();
        }

        if (!eglSwapBuffers(_glDisplay, _glSurface))
        {
            RNSkLogger::logToConsole(
                "eglSwapBuffers failed: %d\n", eglGetError());
        }
    }

} // namespace RNSkia
