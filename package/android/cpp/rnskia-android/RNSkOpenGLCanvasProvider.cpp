#include <RNSkOpenGLCanvasProvider.h>

#include <memory>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkCanvas.h"
#include "SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

RNSkOpenGLCanvasProvider::RNSkOpenGLCanvasProvider(
    std::function<void()> requestRedraw,
    std::shared_ptr<RNSkia::RNSkPlatformContext> platformContext)
    : RNSkCanvasProvider(requestRedraw), _platformContext(platformContext) {}

RNSkOpenGLCanvasProvider::~RNSkOpenGLCanvasProvider() {}

float RNSkOpenGLCanvasProvider::getScaledWidth() { return _width; }

float RNSkOpenGLCanvasProvider::getScaledHeight() { return _height; }

bool RNSkOpenGLCanvasProvider::renderToCanvas(
    const std::function<void(SkCanvas *)> &cb) {

  if (_surfacefactory != nullptr && cb != nullptr) {

    // Get the surface
    if (_surface == nullptr) {
      _surface = _surfacefactory->createSkSurface();
    }
    if (_surface) {

      // If we have a render context let's make it current.
      if (!_surfacefactory->beginRender()) {
        return false;
      }

      auto canvas = _surface->getCanvas();

      // Draw into canvas using callback
      cb(canvas);

      // Commit - flush and swap buffers
      return _surfacefactory->commitRender();
    } else {
      // the render context did not provide a surface
      return false;
    }
  }

  return false;
}

void RNSkOpenGLCanvasProvider::surfaceAvailable(jobject surface, int width,
                                                int height) {
  _width = width;
  _height = height;

  // Create renderer!
  _surfacefactory =
      std::make_unique<WindowedSurfaceFactory>(surface, width, height);

  // Post redraw request to ensure we paint in the next draw cycle.
  _requestRedraw();
}
void RNSkOpenGLCanvasProvider::surfaceDestroyed() {
  // destroy the renderer (a unique pointer so the dtor will be called
  // immediately.)
  _surfacefactory = nullptr;
  _surface = nullptr;
}

void RNSkOpenGLCanvasProvider::surfaceSizeChanged(int width, int height) {
  if (width == 0 && height == 0) {
    // Setting width/height to zero is nothing we need to care about when
    // it comes to invalidating the surface.
    return;
  }

  _width = width;
  _height = height;

  // Recreate RenderContext surface based on size change???
  if (_surfacefactory->resize(width, height)) {
    // Redraw after size change
    _requestRedraw();
  }
}
} // namespace RNSkia
