#include <memory>
#include <mutex>

#include "EGL/egl.h"
#include "GLES2/gl2.h"

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
class SkiaOpenGLContextProvider {
private:
  static std::mutex mtx; // Mutex for synchronization
  static std::unique_ptr<SkiaOpenGLContextProvider>
      instance; // Singleton instance

  SkiaOpenGLContextProvider();

  EGLDisplay eglDisplay = EGL_NO_DISPLAY;
  EGLConfig  eglConfig = nullptr;
  EGLContext eglContext = EGL_NO_CONTEXT;

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

  sk_sp<GrDirectContext> getJSContext() { return jsThreadContext; }
  sk_sp<GrDirectContext> getUIContext() { return uiThreadContext; }

  // Offscreen surfaces can be created on the UI or the JS thread
  sk_sp<SkSurface> MakeOffscreenSurface(sk_sp<GrDirectContext> context, int width, int height);
};
} // namespace RNSkia