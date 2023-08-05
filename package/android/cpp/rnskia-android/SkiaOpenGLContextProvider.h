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
  ANativeWindow *window;

  Display *display;
  Config *config;
  Context *context;
  GrDirectContext *grContext;

  std::unique_ptr<Surface> surface;

public:
  OnscreenSurface(GrDirectContext *aGrContext, ANativeWindow *aWindow,
                  Display *aDisplay, Config *aConfig, Context *aContext)
      : grContext(aGrContext), window(aWindow), display(aDisplay), config(aConfig),
        context(aContext) {
    surface = display->CreateWindowSurface(*config, window);
    if (!surface) {
      RNSkLogger::logToConsole("Couldn't create surface");
      return;
    }
  }

  ~OnscreenSurface() { ANativeWindow_release(window); }

  bool present() {
    if (!context->MakeCurrent(*surface)) {
      RNSkLogger::logToConsole("Couldn't make context current");
      return false;
    }
    grContext->flushAndSubmit();
    return surface->Present();
  }

  sk_sp<SkSurface> makeSurface(int width, int height) {
    if (!context->MakeCurrent(*surface)) {
      RNSkLogger::logToConsole("Couldn't make context current");
      return nullptr;
    }

    GrGLFramebufferInfo info;
    info.fFBOID = 0;
    info.fFormat = 0x8058; // GL_RGBA8
    auto colorType = kN32_SkColorType; // native 32-bit RGBA encoding

    auto stencil = static_cast<GLint>(config->GetDescriptor().stencil_bits);
    auto samples = static_cast<GLint>(config->GetDescriptor().samples);
    auto maxSamples = grContext->maxSurfaceSampleCountForColorType(colorType);
    if (samples > maxSamples) {
      samples = maxSamples;
    }

    GrBackendRenderTarget backendRT(width, height, samples, stencil, info);
    sk_sp<SkSurface> surface = SkSurface::MakeFromBackendRenderTarget(
        grContext, backendRT, kBottomLeft_GrSurfaceOrigin,
        colorType, nullptr, nullptr);

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

  sk_sp<SkSurface> MakeOffscreenSurface(Config *config, Context *context,
                                         GrDirectContext *grContext, int width,
                                         int height);

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
  sk_sp<SkSurface> MakeOffscreenSurface(int width, int height, bool onJSThread);
};
} // namespace RNSkia