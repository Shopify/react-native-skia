#include "RNSkDomView.h"
#include "DrawingContext.h"

#include <chrono>
#include <utility>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFont.h"

#pragma clang diagnostic pop

namespace RNSkia {

RNSkDomRenderer::RNSkDomRenderer(std::function<void()> requestRedraw,
                                 std::shared_ptr<RNSkPlatformContext> context)
    : RNSkRenderer(requestRedraw), _platformContext(std::move(context)),
      _renderLock(std::make_shared<std::timed_mutex>()),
      _renderTimingInfo("SKIA/RENDER") {}

RNSkDomRenderer::~RNSkDomRenderer() {
  if (_root != nullptr) {
    _root->dispose(true);
    _root = nullptr;
  }
}

bool RNSkDomRenderer::tryRender(
    std::shared_ptr<RNSkCanvasProvider> canvasProvider) {

  // We render on the main thread
  if (_renderLock->try_lock()) {
    bool result = false;
    // If we have a Dom Node we can render directly on the main thread
    if (_root != nullptr) {
      result = canvasProvider->renderToCanvas(std::bind(
          &RNSkDomRenderer::renderCanvas, this, std::placeholders::_1,
          canvasProvider->getScaledWidth(), canvasProvider->getScaledHeight()));
    }

    _renderLock->unlock();
    return result;
  } else {
    return false;
  }
}

void RNSkDomRenderer::renderImmediate(
    std::shared_ptr<RNSkCanvasProvider> canvasProvider) {
  auto prevDebugOverlay = getShowDebugOverlays();
  setShowDebugOverlays(false);
  canvasProvider->renderToCanvas(std::bind(
      &RNSkDomRenderer::renderCanvas, this, std::placeholders::_1,
      canvasProvider->getScaledWidth(), canvasProvider->getScaledHeight()));
  setShowDebugOverlays(prevDebugOverlay);
}

void RNSkDomRenderer::setRoot(std::shared_ptr<JsiDomRenderNode> node) {
  std::lock_guard<std::mutex> lock(_rootLock);
  if (_root != nullptr) {
    _root->dispose(true);
    _root = nullptr;
  }
  _root = node;
}

void RNSkDomRenderer::renderCanvas(SkCanvas *canvas, float scaledWidth,
                                   float scaledHeight) {
  _renderTimingInfo.beginTiming();

  auto pd = _platformContext->getPixelDensity();
  canvas->clear(SK_ColorTRANSPARENT);
  canvas->save();
  canvas->scale(pd, pd);

  if (_drawingContext == nullptr) {
    _drawingContext = std::make_shared<DrawingContext>();

    _drawingContext->setRequestRedraw([weakSelf = weak_from_this()]() {
      auto self = weakSelf.lock();
      if (self) {
        self->_requestRedraw();
      }
    });
  }

  _drawingContext->setScaledWidth(scaledWidth);
  _drawingContext->setScaledHeight(scaledHeight);

  // Update canvas before drawing
  _drawingContext->setCanvas(canvas);

  try {
    // Ask the root node to render to the provided canvas
    std::lock_guard<std::mutex> lock(_rootLock);
    if (_root != nullptr) {
      _root->commitPendingChanges();
      _root->render(_drawingContext.get());
      _root->resetPendingChanges();
    }
  } catch (std::runtime_error err) {
    _platformContext->raiseError(err);
  } catch (jsi::JSError err) {
    _platformContext->raiseError(err);
  } catch (...) {
    _platformContext->raiseError(
        std::runtime_error("Error rendering the Skia view."));
  }

  renderDebugOverlays(canvas);

  canvas->restore();

  _renderTimingInfo.stopTiming();
}

void RNSkDomRenderer::renderDebugOverlays(SkCanvas *canvas) {
  if (!getShowDebugOverlays()) {
    return;
  }
  auto renderAvg = _renderTimingInfo.getAverage();
  auto fps = _renderTimingInfo.getFps();

  // Build string
  std::ostringstream stream;
  stream << "render: " << renderAvg << "ms"
         << " fps: " << fps;

  std::string debugString = stream.str();

  // Set up debug font/paints
  auto font = SkFont();
  font.setSize(14);
  auto paint = SkPaint();
  paint.setColor(SkColors::kRed);
  canvas->drawSimpleText(debugString.c_str(), debugString.size(),
                         SkTextEncoding::kUTF8, 8, 18, font, paint);
}

} // namespace RNSkia
