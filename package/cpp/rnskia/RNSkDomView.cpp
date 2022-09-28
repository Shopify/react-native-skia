#include "RNSkDomView.h"
#include "JsiDrawingContext.h"

namespace RNSkia
{

RNSkDomRenderer::RNSkDomRenderer(std::function<void()> requestRedraw,
                                 std::shared_ptr<RNSkPlatformContext> context) :
  RNSkRenderer(requestRedraw),
  _platformContext(std::move(context)),
  _renderLock(std::make_shared<std::timed_mutex>()),
  _touchCallbackLock(std::make_shared<std::timed_mutex>()),
  _jsTimingInfo("SKIA/JS"),
  _renderTimingInfo("SKIA/RENDER") {
}

bool RNSkDomRenderer::tryRender(std::shared_ptr<RNSkCanvasProvider> canvasProvider) {
  // If we have touches we need to call the touch callback as well
  if(_currentTouches.size() > 0) {
    callOnTouch();
  }
  
  // We render on the main thread
  if(_renderLock->try_lock()) {
    // If we have a Dom Node we can render directly on the main thread
    if(_root != nullptr) {
      // Set up drawing context
      canvasProvider->renderToCanvas(std::bind(&RNSkDomRenderer::renderCanvas, this, std::placeholders::_1));
    }
    
    _renderLock->unlock();
    return true;
  } else {
#ifdef DEBUG
    _jsTimingInfo.markSkipped();
#endif
    return false;
  }
};

void RNSkDomRenderer::renderImmediate(std::shared_ptr<RNSkCanvasProvider> canvasProvider) {
  auto prevDebugOverlay = getShowDebugOverlays();
  setShowDebugOverlays(false);
  canvasProvider->renderToCanvas(std::bind(&RNSkDomRenderer::renderCanvas, this, std::placeholders::_1));
  setShowDebugOverlays(prevDebugOverlay);
};

void RNSkDomRenderer::setRoot(std::shared_ptr<JsiDomRenderNode> node) {
  _root = node;
}

void RNSkDomRenderer::setOnTouchCallback(std::shared_ptr<jsi::Function> onTouchCallback) {
  _touchCallback = onTouchCallback;
}
  
void RNSkDomRenderer::renderCanvas(SkCanvas* canvas) {
  _renderTimingInfo.beginTiming();
  
  auto pd = _platformContext->getPixelDensity();
  
  canvas->save();
  canvas->scale(pd, pd);
  
  if (_rootPaint == nullptr) {
    _rootPaint = std::make_shared<SkPaint>();
  }
  
  auto drawingContext = std::make_shared<JsiDrawingContext>(canvas, _rootPaint, 1.0f);
  _root->render(drawingContext);
  
  renderDebugOverlays(canvas);
  
  canvas->restore();
  canvas->flush();
  
  _renderTimingInfo.stopTiming();
}

void RNSkDomRenderer::updateTouches(std::vector<RNSkTouchInfo>& touches) {
  std::lock_guard<std::mutex> lock(_touchMutex);
  // Add timestamp
  auto ms = std::chrono::duration_cast<milliseconds>(
      system_clock::now().time_since_epoch()).count();
  
  for(size_t i=0; i<touches.size(); i++) {
    touches.at(i).timestamp = ms;
  }
  _currentTouches.push_back(std::move(touches));
}

void RNSkDomRenderer::callOnTouch() {
  
  if(_touchCallback == nullptr) {
    return;
  }
  
  if (_touchCallbackLock->try_lock()) {
    
    {
      std::lock_guard<std::mutex> lock(_touchMutex);
      _touchesCache.clear();
      _touchesCache.reserve(_currentTouches.size());
      for (size_t i = 0; i < _currentTouches.size(); ++i) {
        _touchesCache.push_back(_currentTouches.at(i));
      }
      _currentTouches.clear();
    }
    
    // We have an onDraw method - use it to render since we don't have a DOM-node yet.
    _platformContext->runOnJavascriptThread([weakSelf = weak_from_this()](){
      auto self = weakSelf.lock();
      if(self) {
        jsi::Runtime& runtime = *self->_platformContext->getJsRuntime();
        // Set up touches
        auto size = self->_touchesCache.size();
        auto ops = jsi::Array(runtime, size);
        for (size_t i = 0; i < size; i++) {
          auto cur = self->_touchesCache.at(i);
          auto curSize = cur.size();
          auto touches = jsi::Array(runtime, curSize);
          for (size_t n = 0; n < curSize; n++) {
            auto touchObj = jsi::Object(runtime);
            auto t = cur.at(n);
            touchObj.setProperty(runtime, "x", t.x);
            touchObj.setProperty(runtime, "y", t.y);
            touchObj.setProperty(runtime, "force", t.force);
            touchObj.setProperty(runtime, "type", (double)t.type);
            touchObj.setProperty(runtime, "timestamp", (double)t.timestamp / 1000.0);
            touchObj.setProperty(runtime, "id", (double)t.id);
            touches.setValueAtIndex(runtime, n, touchObj);
          }
          ops.setValueAtIndex(runtime, i, touches);
        }
        // Call on touch callback
        self->_touchCallback->call(runtime, ops, 1);
      }
      self->_touchCallbackLock->unlock();
    });
  } else {
    // We'll try next time - schedule a new redraw
    _requestRedraw();
  }
}

void RNSkDomRenderer::renderDebugOverlays(SkCanvas* canvas) {
  if (!getShowDebugOverlays()) {
    return;
  }
  auto jsAvg = _jsTimingInfo.getAverage();
  auto renderAvg = _renderTimingInfo.getAverage();
  auto total = jsAvg + renderAvg;

  // Build string
  std::ostringstream stream;
  stream << "js: " << jsAvg << "ms render: " << renderAvg << "ms " << " total: " << total << "ms";

  std::string debugString = stream.str();

  // Set up debug font/paints
  auto font = SkFont();
  font.setSize(14);
  auto paint = SkPaint();
  paint.setColor(SkColors::kRed);
  canvas->drawSimpleText(
          debugString.c_str(), debugString.size(), SkTextEncoding::kUTF8, 8,
          18, font, paint);
}

} // Namespace RNSkia
