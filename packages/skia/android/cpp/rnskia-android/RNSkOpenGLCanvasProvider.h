#pragma once

#include <fbjni/fbjni.h>

#include <memory>
#include <mutex>
#include <vector>

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

#if defined(SK_GRAPHITE)
  bool getGraphiteTargetInfo(RNSkGraphiteTargetInfo *info) override;

  bool presentRecordings(
      const std::vector<skgpu::graphite::Recording *> &recordings) override;
#endif

  void surfaceAvailable(jobject surface, int width, int height, bool isSurface,
                        bool highBitDepth);

  void surfaceDestroyed();

  void surfaceSizeChanged(jobject jSurface, int width, int height, bool isSurface,
                          bool highBitDepth);

private:
  // Lets the SurfaceTexture of a TextureView consume the previous frame.
  void updateTexImage();
#if defined(SK_GRAPHITE)
  // Copies the window's target description where any thread can read it.
  void updateTargetInfo();
#endif

  std::unique_ptr<WindowContext> _surfaceHolder = nullptr;
  std::shared_ptr<RNSkPlatformContext> _platformContext;
  jobject _jSurfaceTexture = nullptr;
  jmethodID _updateTexImageMethod = nullptr;
#if defined(SK_GRAPHITE)
  std::mutex _targetInfoMutex;
  RNSkGraphiteTargetInfo _targetInfo;
  bool _hasTargetInfo = false;
#endif
};
} // namespace RNSkia
