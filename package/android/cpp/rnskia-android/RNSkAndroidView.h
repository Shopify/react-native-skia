#pragma once

#include <RNSkJsView.h>
#include <RNSkOpenGLCanvasProvider.h>
#include <android/native_window.h>

namespace RNSkia {

class RNSkBaseAndroidView {
public:
    virtual void surfaceAvailable(ANativeWindow* surface, int width, int height) = 0;
    virtual void surfaceDestroyed() = 0;
    virtual void surfaceSizeChanged(int width, int height) = 0;
    virtual float getPixelDensity() = 0;
    virtual std::shared_ptr<RNSkia::RNSkView> getDrawView() = 0;
};

template <class T>
class RNSkAndroidView : public T, public RNSkBaseAndroidView {
public:
    RNSkAndroidView(
      std::shared_ptr<RNSkia::RNSkPlatformContext> context,
      std::function<void()> releaseSurfaceCallback):
      T(context,
        std::make_shared<RNSkOpenGLCanvasProvider>(
                std::bind(&RNSkia::RNSkView::requestRedraw, this),
                releaseSurfaceCallback,
                context)
        ) {}

    void surfaceAvailable(ANativeWindow* surface, int width, int height) override {
      std::static_pointer_cast<RNSkOpenGLCanvasProvider>(this->getCanvasProvider())->surfaceAvailable(surface, width, height);
    }
    void surfaceDestroyed() override {
      std::static_pointer_cast<RNSkOpenGLCanvasProvider>(this->getCanvasProvider())->surfaceDestroyed();
    }

    void surfaceSizeChanged(int width, int height) override {
      std::static_pointer_cast<RNSkOpenGLCanvasProvider>(this->getCanvasProvider())->surfaceSizeChanged(width, height);
    }

    float getPixelDensity() override {
      return this->getPlatformContext()->getPixelDensity();
    }

    std::shared_ptr<RNSkia::RNSkView> getDrawView() override {
      return this->shared_from_this();
    }
};
}
