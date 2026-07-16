#pragma once

#include <fbjni/fbjni.h>

#include <atomic>
#include <memory>

#include "RNSkView.h"
#include "RNWindowContext.h"

#include <android/native_window.h>

namespace RNSkia {

class RNSkOpenGLCanvasProvider
    : public RNSkia::RNSkCanvasProvider,
      public std::enable_shared_from_this<RNSkOpenGLCanvasProvider> {
public:
  RNSkOpenGLCanvasProvider(
      std::function<void()> requestRedraw,
      std::shared_ptr<RNSkia::RNSkPlatformContext> platformContext);

  virtual ~RNSkOpenGLCanvasProvider();

  int getWidth() override;

  int getHeight() override;

  bool renderToCanvas(const std::function<void(SkCanvas *)> &cb) override;

  void surfaceAvailable(jobject surface, int width, int height, bool opaque,
                        bool highBitDepth);

  void surfaceDestroyed();

  void surfaceSizeChanged(jobject jSurface, int width, int height, bool opaque,
                          bool highBitDepth);

private:
  void updateCachedDimensions();

  // _surfaceHolder is created/destroyed on the UI thread (surface callbacks)
  // and must only be dereferenced there or on the render path;
  // getWidth/getHeight are called from the JS thread and read the cached
  // dimensions instead.
  std::unique_ptr<WindowContext> _surfaceHolder = nullptr;
  std::shared_ptr<RNSkPlatformContext> _platformContext;
  jobject _jSurfaceTexture = nullptr;
  jmethodID _updateTexImageMethod = nullptr;
  std::atomic<int> _width = 0;
  std::atomic<int> _height = 0;
};
} // namespace RNSkia
