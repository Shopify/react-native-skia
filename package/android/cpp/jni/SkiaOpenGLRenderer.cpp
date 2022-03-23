#include "SkiaOpenGLRenderer.h"

namespace RNSkia
{
    /**** Initialize Static members ****/
    EGLContext SkiaOpenGLRenderer::_glContext = EGL_NO_CONTEXT;
    EGLDisplay SkiaOpenGLRenderer::_glDisplay = EGL_NO_DISPLAY;
    EGLConfig SkiaOpenGLRenderer::_glConfig = 0;
    sk_sp<GrDirectContext> SkiaOpenGLRenderer::_skContext = nullptr;

    void SkiaOpenGLRenderer::render(const sk_sp<SkPicture> picture, int width, int height) {
        switch(_renderState) {
            case RenderState::Initializing: {
                if (!init()) {
                    break;
                }
                _renderState = RenderState::Rendering;
                // Just let the case drop to drawing - we have initialized
                // and we should be able to render (if the picture is set)
            }
            case RenderState::Rendering: {
                // Ensure we have the Skia surface to draw on. We need to
                // pass width and height since the surface will be recreated
                // when the view is resized.
                if(!ensureSkiaSurface(width, height)) {
                    return;
                }

                if(picture != nullptr) {
                    // Reset context
                    _skContext->resetContext();

                    // Clear with transparent
                    glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
                    glClear(GL_COLOR_BUFFER_BIT);

                    // Draw picture into surface
                    _skSurface->getCanvas()->drawPicture(picture);

                    // Flush
                    _skSurface->getCanvas()->flush();
                    _skContext->flush();

                    if (!eglSwapBuffers(_glDisplay, _glSurface))
                    {
                        RNSkLogger::logToConsole(
                                "eglSwapBuffers failed: %d\n", eglGetError());
                    }
                }
                break;
            }
            case RenderState::Finishing: {
                finish();
                break;
            }
            case RenderState::Done: {
                // Do nothing. We're done.
                break;
            }
        }
    }

    bool SkiaOpenGLRenderer::init()
    {
        // Set up static OpenGL context
        if (!initStaticGLContext())
        {
            return false;
        }

        // Set up OpenGL Surface
        if(!initGLSurface()) {
            return false;
        }

        // Init skia static context
        if(!initStaticSkiaContext()) {
            return false;
        }

        return true;
    }

    void SkiaOpenGLRenderer::finish() {
        std::lock_guard<std::mutex> lock(_lock);

        if(_renderState != RenderState::Finishing) {
            _cv.notify_all();
            return;
        }

        finishGL();
        finishSkiaSurface();

        _renderState = RenderState::Done;

        _cv.notify_one();
    }

    void SkiaOpenGLRenderer::finishGL()
    {
        if(_glSurface != EGL_NO_SURFACE && _glDisplay != EGL_NO_DISPLAY) {
            eglDestroySurface(_glDisplay, _glSurface);
        }
    }

    void SkiaOpenGLRenderer::finishSkiaSurface() {
        if(_skSurface != nullptr) {
            _skSurface = nullptr;
        }

        if(_nativeWindow != nullptr) {
            ANativeWindow_release(_nativeWindow);
            _nativeWindow = nullptr;
        }
    }

    void SkiaOpenGLRenderer::teardown() {
        _renderState = RenderState::Finishing;
    }

    void SkiaOpenGLRenderer::waitForTeardown() {
        std::unique_lock<std::mutex> lock(_lock);
        _cv.wait(lock, [this] { return (_renderState == RenderState::Done); });
    }

    bool SkiaOpenGLRenderer::initStaticGLContext()
    {
        if (_glContext != EGL_NO_CONTEXT)
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

        _glContext = eglCreateContext(_glDisplay, _glConfig, NULL, contextAttribs);
        if (_glContext == EGL_NO_CONTEXT)
        {
            RNSkLogger::logToConsole(
                    "eglCreateContext failed: %d\n", eglGetError());
            return false;
        }

        return true;
    }

    bool SkiaOpenGLRenderer::initStaticSkiaContext()
    {
        if (_skContext != nullptr)
        {
            return true;
        }

        // Create the Skia backend context
        auto backendInterface = GrGLMakeNativeInterface();
        _skContext = GrDirectContext::MakeGL(backendInterface);
        if (_skContext == nullptr)
        {
            RNSkLogger::logToConsole("GrDirectContext::MakeGL failed");
            return false;
        }

        return true;
    }

    bool SkiaOpenGLRenderer::initGLSurface()
    {
        if (_nativeWindow == nullptr)
        {
            return false;
        }

        if (_glSurface != EGL_NO_SURFACE)
        {
            if (!eglMakeCurrent(_glDisplay, _glSurface, _glSurface, _glContext))
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

        if (!eglMakeCurrent(_glDisplay, _glSurface, _glSurface, _glContext))
        {
            RNSkLogger::logToConsole("eglMakeCurrent failed: %d\n", eglGetError());
            return false;
        }

        return true;
    }

    bool SkiaOpenGLRenderer::ensureSkiaSurface(int width, int height)
    {
        if (_skContext == nullptr)
        {
            return false;
        }

        if (_skSurface == nullptr ||
            !_skRenderTarget.isValid() ||
            _prevWidth != width ||
            _prevHeight != height)
        {
            glViewport(0, 0, width, height);

            _prevWidth = width;
            _prevHeight = height;

            GLint buffer;
            glGetIntegerv(GL_FRAMEBUFFER_BINDING, &buffer);

            GLint stencil;
            glGetIntegerv(GL_STENCIL_BITS, &stencil);

            GLint samples;
            glGetIntegerv(GL_SAMPLES, &samples);

            auto maxSamples = _skContext->maxSurfaceSampleCountForColorType(
                    kRGBA_8888_SkColorType);

            if (samples > maxSamples)
                samples = maxSamples;

            GrGLFramebufferInfo fbInfo;
            fbInfo.fFBOID = buffer;
            fbInfo.fFormat = 0x8058;

            _skRenderTarget =
                    GrBackendRenderTarget(width, height, samples, stencil, fbInfo);

            _skSurface = SkSurface::MakeFromBackendRenderTarget(
                    _skContext.get(),
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
}