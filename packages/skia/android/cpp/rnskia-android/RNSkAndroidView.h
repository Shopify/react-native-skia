#pragma once

#include <memory>
#include <string>
#include <vector>

#include "RNSkOpenGLCanvasProvider.h"
#include <android/native_window.h>

namespace RNSkia {

class RNSkBaseAndroidView {
public:
  virtual void surfaceAvailable(jobject surface, int width, int height,
                                bool isSurface, bool highBitDepth,
                                float maxRefreshRate) = 0;

  virtual void surfaceDestroyed() = 0;

  virtual void surfaceSizeChanged(jobject surface, int width, int height,
                                  bool isSurface, bool highBitDepth,
                                  float maxRefreshRate) = 0;

  virtual float getPixelDensity() = 0;

  virtual void setShowDebugInfo(bool show) = 0;

  virtual std::shared_ptr<RNSkView> getSkiaView() = 0;
};

template <typename T>
class RNSkAndroidView : public T, public RNSkBaseAndroidView {
public:
  explicit RNSkAndroidView(std::shared_ptr<RNSkia::RNSkPlatformContext> context)
      : T(context,
          std::make_shared<RNSkOpenGLCanvasProvider>(
              std::bind(&RNSkia::RNSkView::requestRedraw, this), context)) {}

  void surfaceAvailable(jobject surface, int width, int height, bool isSurface,
                        bool highBitDepth, float maxRefreshRate) override {
    std::static_pointer_cast<RNSkOpenGLCanvasProvider>(T::getCanvasProvider())
        ->surfaceAvailable(surface, width, height, isSurface, highBitDepth,
                           maxRefreshRate);
    RNSkView::redraw();
  }

  void surfaceDestroyed() override {
    std::static_pointer_cast<RNSkOpenGLCanvasProvider>(T::getCanvasProvider())
        ->surfaceDestroyed();
  }

  void surfaceSizeChanged(jobject surface, int width, int height,
                          bool isSurface, bool highBitDepth,
                          float maxRefreshRate) override {
    std::static_pointer_cast<RNSkOpenGLCanvasProvider>(T::getCanvasProvider())
        ->surfaceSizeChanged(surface, width, height, isSurface, highBitDepth,
                             maxRefreshRate);
    // Paint the new size right away rather than on the next scheduled redraw.
    RNSkView::redraw();
  }

  float getPixelDensity() override {
    return T::getPlatformContext()->getPixelDensity();
  }

  void setShowDebugInfo(bool show) override { T::setShowDebugOverlays(show); }

  std::shared_ptr<RNSkView> getSkiaView() override {
    return T::shared_from_this();
  }
};
} // namespace RNSkia
