#include <RNSkOpenGLCanvasProvider.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkSurface.h>
#include <SkCanvas.h>

#pragma clang diagnostic pop

namespace RNSkia {

  RNSkOpenGLCanvasProvider::RNSkOpenGLCanvasProvider(
          std::function<void()> requestRedraw,
          std::function<void()> releaseSurfaceCallback,
          std::shared_ptr<RNSkia::RNSkPlatformContext> context):
          RNSkCanvasProvider(requestRedraw),
          _releaseSurfaceCallback(releaseSurfaceCallback),
          _context(context) {}

  RNSkOpenGLCanvasProvider::~RNSkOpenGLCanvasProvider() {}

  float RNSkOpenGLCanvasProvider::getScaledWidth() {
    return _width;
  }

  float RNSkOpenGLCanvasProvider::getScaledHeight() {
    return _height;
  }

  void RNSkOpenGLCanvasProvider::renderToCanvas(const std::function<void(SkCanvas *)> &cb) {
    if(_renderer != nullptr) {
      _renderer->run(cb, _width, _height);
    }
  }

  void RNSkOpenGLCanvasProvider::surfaceAvailable(ANativeWindow* surface, int width, int height) {
    _width = width;
    _height = height;

    if (_renderer == nullptr)
    {
      // Create renderer!
      _renderer = std::make_unique<SkiaOpenGLRenderer>(surface);

      // Redraw
      _requestRedraw();
    }
  }
  void RNSkOpenGLCanvasProvider::surfaceDestroyed()  {
    if (_renderer != nullptr)
    {
      // Start teardown
      _renderer->teardown();

      // Teardown renderer on the render thread since OpenGL demands
      // same thread access for OpenGL contexts.
      _context->runOnRenderThread([weakSelf = weak_from_this()]() {
          auto self = weakSelf.lock();
          if(self) {
            if(self->_renderer != nullptr) {
              self->_renderer->run(nullptr, 0, 0);
            }
            // Remove renderer
            self->_renderer = nullptr;
            self->_releaseSurfaceCallback();
          }
      });
    }
  }

  void RNSkOpenGLCanvasProvider::surfaceSizeChanged(int width, int height) {
    if(width == 0 && height == 0) {
      // Setting width/height to zero is nothing we need to care about when
      // it comes to invalidating the surface.
      return;
    }
    _width = width;
    _height = height;

    // Redraw after size change
    _requestRedraw();
  }
}
