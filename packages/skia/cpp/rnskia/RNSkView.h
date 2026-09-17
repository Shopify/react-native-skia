#pragma once

#include <atomic>
#include <functional>
#include <memory>
#include <utility>

#include "RNSkPlatformContext.h"

#if defined(SK_GRAPHITE)
#include "RNDawnContext.h"
#endif

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkCanvas.h"
#include "include/core/SkImage.h"
#include "include/core/SkPicture.h"
#include "include/core/SkRect.h"
#include "include/core/SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

class RNSkCanvasProvider {
public:
  explicit RNSkCanvasProvider(std::function<void()> requestRedraw)
      : _requestRedraw(std::move(requestRedraw)) {}

  virtual ~RNSkCanvasProvider() = default;

  /**
   Returns the scaled width of the view
   */
  virtual int getWidth() = 0;

  /**
   Returns the scaled height of the view
   */
  virtual int getHeight() = 0;

  /**
   Render to a canvas
   */
  virtual bool renderToCanvas(const std::function<void(SkCanvas *)> &) = 0;

protected:
  std::function<void()> _requestRedraw;
};

class RNSkOffscreenCanvasProvider : public RNSkCanvasProvider {
public:
  RNSkOffscreenCanvasProvider(
      const std::shared_ptr<RNSkPlatformContext> &context,
      std::function<void()> requestRedraw, float width, float height)
      : RNSkCanvasProvider(std::move(requestRedraw)), _width(width),
        _height(height), _context(context) {
    _surface = context->makeOffscreenSurface(_width, _height);
    _pd = context->getPixelDensity();
  }

  virtual ~RNSkOffscreenCanvasProvider() = default;

  /**
   Returns a snapshot of the current surface/canvas
   */
  sk_sp<SkImage> makeSnapshot(SkRect *bounds) {
    if (_surface == nullptr) {
      return nullptr;
    }
    sk_sp<SkImage> image;
    if (bounds != nullptr) {
      SkIRect b =
          SkIRect::MakeXYWH(bounds->x() * _pd, bounds->y() * _pd,
                            bounds->width() * _pd, bounds->height() * _pd);
      image = _surface->makeImageSnapshot(b);
    } else {
      image = _surface->makeImageSnapshot();
    }
#if defined(SK_GRAPHITE)
    // Only Graphite-backed surfaces have a recorder to snap/submit; a raster
    // surface's snapshot is already a valid CPU image.
    if (auto *recorder = _surface->recorder()) {
      DawnContext::getInstance().submitRecording(recorder->snap().get());
    }
    return DawnContext::getInstance().MakeRasterImage(image);
#else
    auto grContext = _context->getDirectContext();
    return image->makeRasterImage(grContext);
#endif
  }

  /**
   Returns the scaled width of the view
   */
  int getWidth() override { return _width; };

  /**
   Returns the scaled height of the view
   */
  int getHeight() override { return _height; };

  /**
   Render to a canvas
   */
  bool renderToCanvas(const std::function<void(SkCanvas *)> &cb) override {
    if (_surface == nullptr) {
      return false;
    }
    cb(_surface->getCanvas());
    return true;
  };

private:
  int _width;
  int _height;
  float _pd = 1.0f;
  sk_sp<SkSurface> _surface;
  std::shared_ptr<RNSkPlatformContext> _context;
};

/**
 A Skia view: an SkPicture drawn onto the canvas of a platform-specific
 canvas provider (Metal layer, Android surface) scaled by the pixel density.
 The picture is set from the JS thread via the ViewApi while frames are drawn
 on the main thread, so it is held in an sk_sp that is copied per draw.
 */
class RNSkView : public std::enable_shared_from_this<RNSkView> {
public:
  RNSkView(std::shared_ptr<RNSkPlatformContext> context,
           std::shared_ptr<RNSkCanvasProvider> canvasProvider)
      : _platformContext(std::move(context)),
        _canvasProvider(std::move(canvasProvider)) {}

  ~RNSkView() = default;

  /**
   Sets the picture to draw and schedules a redraw. Passing nullptr clears the
   view.
   */
  void setPicture(sk_sp<SkPicture> picture) {
    _picture = std::move(picture);
    requestRedraw();
  }

  sk_sp<SkPicture> getPicture() const { return _picture; }

  /**
   Schedules a draw on the main thread. Coalesces concurrent requests so that
   at most one draw is pending at a time.
   */
  void requestRedraw() {
    if (!_redrawRequested) {
      _redrawRequested = true;
      // Capture a weak pointer to this
      auto weakThis = std::weak_ptr<RNSkView>(shared_from_this());

      _platformContext->runOnMainThread([weakThis]() {
        // Try to lock the weak pointer
        if (auto strongThis = weakThis.lock()) {
          // Only proceed if the object still exists
          if (strongThis->_redrawRequested) {
            strongThis->drawPicture(strongThis->_canvasProvider);
            strongThis->_redrawRequested = false;
          }
        }
      });
    }
  }

  /**
   Draws synchronously on the calling thread and clears any pending request.
   */
  void redraw() {
    drawPicture(_canvasProvider);
    _redrawRequested = false;
  }

  /**
   Sets the native id of the view
   */
  void setNativeId(size_t nativeId) { _nativeId = nativeId; }

  /**
   Returns the native id
   */
  size_t getNativeId() const { return _nativeId; }

  /**
   * Set to true to show the debug overlays on render
   */
  void setShowDebugOverlays(bool show) {
    _showDebugOverlays = show;
    requestRedraw();
  }

  /**
   Renders the view into an SkImage instead of the screen.
   */
  sk_sp<SkImage> makeImageSnapshot(SkRect *bounds) {
    auto provider = std::make_shared<RNSkOffscreenCanvasProvider>(
        _platformContext, []() {}, _canvasProvider->getWidth(),
        _canvasProvider->getHeight());

    drawPicture(provider);
    return provider->makeSnapshot(bounds);
  }

  /**
   Returns the scaled width of the view
   */
  int getScaledWidth() { return _canvasProvider->getWidth(); }

  /**
   Returns the scaled height of the view
   */
  int getScaledHeight() { return _canvasProvider->getHeight(); }

  std::shared_ptr<RNSkPlatformContext> getPlatformContext() {
    return _platformContext;
  }

  std::shared_ptr<RNSkCanvasProvider> getCanvasProvider() {
    return _canvasProvider;
  }

private:
  bool drawPicture(const std::shared_ptr<RNSkCanvasProvider> &canvasProvider) {
    // Capture picture pointer to ensure thread safety - _picture can be
    // modified from the JS thread while we're drawing on the render thread
    sk_sp<SkPicture> picture = _picture;
    auto pd = _platformContext->getPixelDensity();
    return canvasProvider->renderToCanvas([=](SkCanvas *canvas) {
      canvas->clear(SK_ColorTRANSPARENT);
      canvas->save();
      canvas->scale(pd, pd);
      if (picture != nullptr) {
        canvas->drawPicture(picture);
      }
      canvas->restore();
    });
  }

  std::shared_ptr<RNSkPlatformContext> _platformContext;
  std::shared_ptr<RNSkCanvasProvider> _canvasProvider;
  sk_sp<SkPicture> _picture;

  size_t _nativeId = 0;
  bool _showDebugOverlays = false;
  std::atomic<bool> _redrawRequested = {false};
};

} // namespace RNSkia
