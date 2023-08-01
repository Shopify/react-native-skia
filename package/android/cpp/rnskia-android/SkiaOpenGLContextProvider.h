#pragma once

#include <memory>
#include <mutex>

#include "gltoolkit/Context.h"
#include "gltoolkit/Display.h"
#include "gltoolkit/Config.h"

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

  sk_sp<GrDirectContext> jsThreadContext = nullptr;
  sk_sp<GrDirectContext> uiThreadContext = nullptr;

public:
  ~SkiaOpenGLContextProvider();

  std::unique_ptr<Display> display = nullptr;
  std::unique_ptr<Config>  config = nullptr;
  std::unique_ptr<Context> context = nullptr;

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

  // Offscreen surfaces can be created on the UI or the JS thread
  sk_sp<SkSurface> MakeOffscreenSurface(int width, int height);
  sk_sp<SkSurface> MakeSnapshottingSurface(int width, int height);
};
} // namespace RNSkia