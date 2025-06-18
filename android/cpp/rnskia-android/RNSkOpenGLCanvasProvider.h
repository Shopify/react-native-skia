#pragma once

#include <fbjni/fbjni.h>

#include <memory>

#include "RNSkView.h"
#include "WindowContext.h"

#include <android/native_window.h>

namespace RNSkia {

class RNSkOpenGLCanvasProvider
    : public RNSkia::RNSkCanvasProvider,
      public std::enable_shared_from_this<RNSkOpenGLCanvasProvider> {
public:
  RNSkOpenGLCanvasProvider(
      std::function<void()> requestRedraw,
      std::shared_ptr<RNSkia::RNSkPlatformContext> platformContext);

  ~RNSkOpenGLCanvasProvider();

  int getScaledWidth() override;

  int getScaledHeight() override;

  bool renderToCanvas(const std::function<void(SkCanvas *)> &cb) override;

  void surfaceAvailable(jobject surface, int width, int height, bool opaque);

  void surfaceDestroyed();

  void surfaceSizeChanged(jobject jSurface, int width, int height, bool opaque);

private:
  std::unique_ptr<WindowContext> _surfaceHolder = nullptr;
  std::shared_ptr<RNSkPlatformContext> _platformContext;
  jobject _jSurfaceTexture = nullptr;
  jmethodID _updateTexImageMethod = nullptr;
};
} // namespace RNSkia
