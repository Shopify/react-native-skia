#pragma once

#include <RNSkJsView.h>
#include <RNSkOpenGLCanvasProvider.h>
#include <android/native_window.h>

namespace RNSkia {

class RNSkAndroidJsView : public RNSkia::RNSkJsView {
public:
    RNSkAndroidJsView(
      std::shared_ptr<RNSkia::RNSkPlatformContext> context,
      std::function<void()> releaseSurfaceCallback):
      RNSkia::RNSkJsView(context,
               std::make_shared<RNSkOpenGLCanvasProvider>(
               std::bind(&RNSkia::RNSkView::requestRedraw, this),
               releaseSurfaceCallback,
               context)) {}

    void surfaceAvailable(ANativeWindow* surface, int width, int height) {
      std::static_pointer_cast<RNSkOpenGLCanvasProvider>(getCanvasProvider())->surfaceAvailable(surface, width, height);
    }
    void surfaceDestroyed()  {
      std::static_pointer_cast<RNSkOpenGLCanvasProvider>(getCanvasProvider())->surfaceDestroyed();
    }

    void surfaceSizeChanged(int width, int height) {
      std::static_pointer_cast<RNSkOpenGLCanvasProvider>(getCanvasProvider())->surfaceSizeChanged(width, height);
    }

    float getPixelDensity() {
      return getPlatformContext()->getPixelDensity();
    }
};
}
