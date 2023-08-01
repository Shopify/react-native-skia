#pragma once

#include <memory>
#include <mutex>

#include "gltoolkit/Config.h"
#include "gltoolkit/Context.h"
#include "gltoolkit/Display.h"

#include "EGL/egl.h"
#include "GLES2/gl2.h"
#include "android/native_window.h"
#include <fbjni/fbjni.h>
#include <jni.h>

#include <android/native_window_jni.h>

#include <RNSkLog.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkCanvas.h"
#include "SkColorSpace.h"
#include "SkPicture.h"
#include "SkSurface.h"
#include "include/gpu/GrDirectContext.h"
#include "include/gpu/gl/GrGLInterface.h"

#pragma clang diagnostic pop

namespace RNSkia {

class OnscreenSurface {
private:
  GrRecordingContext *_grContext;
  ANativeWindow *_window;
  Display *_display;
  Context *_rootContext;
  std::unique_ptr<Config> config;
  std::unique_ptr<Context> context;
  std::unique_ptr<Surface> surface;

public:
  OnscreenSurface(GrRecordingContext *grContext, ANativeWindow *window,
                  Display *display, Context *rootContext)
      : _grContext(grContext), _window(window), _display(display), _rootContext(rootContext) {
    ConfigDescriptor desc;
    desc.api = API::kOpenGLES2;
    desc.color_format = ColorFormat::kRGBA8888;
    desc.depth_bits = DepthBits::kZero;
    desc.stencil_bits = StencilBits::kEight;
    desc.samples = Samples::kFour;
    desc.surface_type = SurfaceType::kWindow;
    config = display->ChooseConfig(desc);
    if (!config) {
      desc.samples = Samples::kOne;
      config = display->ChooseConfig(desc);
      if (config) {
        RNSkLogger::logToConsole(
            "Falling back to a single sample (device doesn't support MSAA)");
      } else {
        RNSkLogger::logToConsole("Couldn't choose an offscreen config");
        return;
      }
    }
    // Create a new PBuffer surface with desired width and height
    surface = display->CreateWindowSurface(*config, window);
    context = display->CreateContext(*config, _rootContext);
    if (!context) {
      RNSkLogger::logToConsole("Couldn't create context");
      return;
    }
    if (!surface) {
      RNSkLogger::logToConsole("Couldn't create surface");
      return;
    }
  }

  ~OnscreenSurface() { ANativeWindow_release(_window); }

  bool beginRender() {
    if (!context->MakeCurrent(*surface)) {
      RNSkLogger::logToConsole("Couldn't make context current");
      return false;
    }

    return true;
  }

  bool commitRender() {
    if (!eglSwapBuffers(_display, surface.get())) {
      RNSkLogger::logToConsole("eglSwapBuffers failed: %d\n", eglGetError());
      return false;
    }
    return true;
  }

  sk_sp<SkSurface> makeSurface(int width, int height) {
    if (!context->MakeCurrent(*surface)) {
      RNSkLogger::logToConsole("Couldn't make context current");
      return nullptr;
    }

    GLint buffer;
    glGetIntegerv(GL_FRAMEBUFFER_BINDING, &buffer);

    GrGLFramebufferInfo info;
    info.fFBOID = buffer;
    info.fFormat = 0x8058; // GL_RGBA8

    auto colorType = kN32_SkColorType; // native 32-bit RGBA encoding

    GLint stencil;
    glGetIntegerv(GL_STENCIL_BITS, &stencil);

    GLint samples;
    glGetIntegerv(GL_SAMPLES, &samples);

    auto maxSamples =
        _grContext->maxSurfaceSampleCountForColorType(
            colorType);

    if (samples > maxSamples) {
      samples = maxSamples;
    }

    GrBackendRenderTarget renderTarget(width, height, samples, stencil, info);

    SkSurfaceProps props(0, kUnknown_SkPixelGeometry);

    sk_sp<SkSurface> surface = SkSurface::MakeFromBackendRenderTarget(
        _grContext, renderTarget,
        kBottomLeft_GrSurfaceOrigin, colorType, nullptr, &props);

    if (!surface) {
      RNSkLogger::logToConsole("Failed to create offscreen surface");
    } else {
      RNSkLogger::logToConsole("Surface created");
    }

    return surface;
  }
};

class SkiaOpenGLContextProvider {
private:
  static std::mutex mtx; // Mutex for synchronization
  static std::unique_ptr<SkiaOpenGLContextProvider>
      instance; // Singleton instance

  SkiaOpenGLContextProvider();

  std::unique_ptr<Display> display = nullptr;

  std::unique_ptr<Config> uiConfig = nullptr;
  std::unique_ptr<Context> uiContext = nullptr;

  std::unique_ptr<Config> jsConfig = nullptr;
  std::unique_ptr<Context> jsContext = nullptr;

  sk_sp<GrDirectContext> jsThreadContext = nullptr;
  sk_sp<GrDirectContext> uiThreadContext = nullptr;

public:
  ~SkiaOpenGLContextProvider();

  // Delete copy and assignment operations
  SkiaOpenGLContextProvider(SkiaOpenGLContextProvider &other) = delete;
  void operator=(const SkiaOpenGLContextProvider &) = delete;

  static SkiaOpenGLContextProvider *getInstance() {
    if (instance == nullptr) { // First check without acquiring the lock to
                               // improve performance
      std::lock_guard<std::mutex> lock(mtx); // Acquire the lock
      if (instance == nullptr) {             // Double-check
        instance.reset(new SkiaOpenGLContextProvider());
      }
    }
    return instance.get();
  }

  std::unique_ptr<OnscreenSurface> MakeOnscreenSurface(jobject surface,
                                                       int width, int height);
  sk_sp<SkSurface> MakeOffscreenSurface(int width, int height);
  sk_sp<SkSurface> MakeSnapshottingSurface(int width, int height);
};
} // namespace RNSkia