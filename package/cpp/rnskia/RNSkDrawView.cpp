//
// Created by Christian Falch on 23/08/2021.
//

#include "RNSkDrawView.h"

#include <chrono>
#include <functional>

#include "RNSkLog.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkCanvas.h>
#include <SkFont.h>
#include <SkGraphics.h>
#include <SkPaint.h>
#include <SkString.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace std::chrono;

RNSkDrawView::RNSkDrawView(std::shared_ptr<RNSkPlatformContext> context)
    : _jsiCanvas(std::make_shared<JsiSkCanvas>(context)),
      _platformContext(context),
      _infoObject(std::make_shared<RNSkInfoObject>()),
      _timingInfo(std::make_shared<RNSkTimingInfo>()),
      _isDrawing(new std::timed_mutex())
      {}

RNSkDrawView::~RNSkDrawView() {
  invalidate();
  
  // Wait for the drawing lock (if set)
  if(!_isDrawing->try_lock_for(milliseconds(500))) {
    RNSkLogger::logToConsole("Failed to delete since drawing is still locked for native view with id %i", _nativeId);
  }
  
  delete _isDrawing;  
}

void RNSkDrawView::invalidate() {
  endDrawingLoop();
  _isValid = false;
}

void RNSkDrawView::setDrawCallback(std::shared_ptr<jsi::Function> callback) {

  if (callback == nullptr) {
    _drawCallback = nullptr;
    // We can just reset everything - this is a signal that we're done.
    endDrawingLoop();
    return;
  }
  
  // Start draw loop callback
  beginDrawingLoop();

  // Reset timing info
  _timingInfo->reset();

  // Create draw drawCallback wrapper
  _drawCallback = std::make_shared<RNSkDrawCallback>(
      [this, callback](std::shared_ptr<JsiSkCanvas> canvas, int width,
                       int height, double timestamp,
                       std::shared_ptr<RNSkPlatformContext> context) {
        auto runtime = context->getJsRuntime();
                                 
      auto draw = [&, callback]() {
        
        // Update info parameter
        _infoObject->beginDrawOperation(width, height, timestamp);

        // Set up arguments array
        std::vector<jsi::Value> args(2);
        args[0] = jsi::Object::createFromHostObject(*runtime, canvas);
        args[1] = jsi::Object::createFromHostObject(*runtime, _infoObject);

        // To be able to call the drawing function we'll wrap it once again
        callback->call(*runtime,
                       static_cast<const jsi::Value *>(args.data()),
                       (size_t)2);

        // Reset touches
        _infoObject->endDrawOperation();
      };
                         
      if(_platformContext->isOnJavascriptThread()) {
        // We can just draw - the drawcallback was called on the
        // javascript thread
        draw();
      } else {
        // We need to do some synchronization when drawing
        std::mutex mu;
        std::condition_variable cond;

        bool isDoneDrawing = false;
        std::unique_lock<std::mutex> lock(mu);
        
        _platformContext->runOnJavascriptThread([&]() {
          std::lock_guard<std::mutex> lock(mu);
          draw();
          isDoneDrawing = true;
          cond.notify_one();
        });
        
        cond.wait(lock, [&]() { return isDoneDrawing; });
      }

      // Draw debug overlays
      if (_showDebugOverlay) {

        // Display average rendering timer
        auto average = _timingInfo->getAverage();
        auto debugString = std::to_string(average) + "ms";

        if (_drawingMode == RNSkDrawingMode::Continuous) {
          debugString += "/continuous";
        } else {
          debugString += "/default";
        }

        auto font = SkFont();
        font.setSize(16);
        auto paint = SkPaint();
        paint.setColor(SkColors::kRed);

        canvas->getCanvas()->drawSimpleText(
            debugString.c_str(), debugString.size(), SkTextEncoding::kUTF8, 8,
            18, font, paint);
      }
    });

  // Request redraw
  requestRedraw();
}

void RNSkDrawView::drawInCanvas(std::shared_ptr<JsiSkCanvas> canvas,
                                int width,
                                int height,
                                double time) {
  
  // Call the draw drawCallback and perform js based drawing
  auto skCanvas = canvas->getCanvas();
  if (_drawCallback != nullptr && skCanvas != nullptr) {
    // Make sure to scale correctly
    auto pd = _platformContext->getPixelDensity();
    skCanvas->save();
    skCanvas->scale(pd, pd);
    // Call draw function.
    (*_drawCallback)(canvas, width / pd, height / pd, time, _platformContext);
    // Restore canvas
    skCanvas->restore();
    skCanvas->flush();
  }
}

void RNSkDrawView::drawInSurface(sk_sp<SkSurface> surface,
                                 int width,
                                 int height,
                                 double time,
                                 std::shared_ptr<RNSkPlatformContext> context) {

  try {
    if(!isValid()) {
      return;
    }
    
    _lastWidth = width;
    _lastHeight = height;

    // Get the canvas
    auto skCanvas = surface->getCanvas();
    _jsiCanvas->setCanvas(skCanvas);
    drawInCanvas(_jsiCanvas, width, height, time);
    _jsiCanvas->setCanvas(nullptr);
    
  } catch (const jsi::JSError &err) {
    _drawCallback = nullptr;
    return _platformContext->raiseError(err);
  } catch (const std::exception &err) {
    _drawCallback = nullptr;
    return _platformContext->raiseError(err);
  } catch (const std::runtime_error &err) {
    _drawCallback = nullptr;
    return _platformContext->raiseError(err);
  } catch (...) {
    _drawCallback = nullptr;
    return _platformContext->raiseError(
        "An error occurred while rendering the Skia View.");
  }
}

sk_sp<SkImage> RNSkDrawView::makeImageSnapshot(std::shared_ptr<SkRect> bounds) {
  // Assert width/height
  if(_lastWidth == -1 || _lastHeight == -1) {
    return nullptr;
  }
  auto surface = SkSurface::MakeRasterN32Premul(_lastWidth, _lastHeight);
  auto canvas = surface->getCanvas();
  auto jsiCanvas = std::make_shared<JsiSkCanvas>(_platformContext);
  jsiCanvas->setCanvas(canvas);
  
  milliseconds ms = duration_cast<milliseconds>(
      system_clock::now().time_since_epoch());
  
  drawInCanvas(jsiCanvas, _lastWidth, _lastHeight, ms.count() / 1000);
  
  if(bounds != nullptr) {
    SkIRect b = SkIRect::MakeXYWH(bounds->x(), bounds->y(), bounds->width(), bounds->height());
    return surface->makeImageSnapshot(b);
  } else {
    return surface->makeImageSnapshot();
  }
}

void RNSkDrawView::updateTouchState(const std::vector<RNSkTouchPoint> &points) {
  _infoObject->updateTouches(points);
  requestRedraw();
}

void RNSkDrawView::performDraw() {
  if(isValid()) {
    if(_isDrawing->try_lock()) {
      // Calculate milliseconds since start
      milliseconds ms = duration_cast<milliseconds>(
              system_clock::now().time_since_epoch());

      // Call draw frame method in sub class
      drawFrame(ms.count() / 1000.0);

      // Unlock the drawing lock (the lock was done by the callback from the draw loop)
      _isDrawing->unlock();
    }
  }
}

void RNSkDrawView::requestRedraw() {
  _redrawRequestCounter++;
}

bool RNSkDrawView::isReadyToDraw() {
  if(!isValid()) {
    return false;
  }

  if (_platformContext == nullptr) {
    endDrawingLoop();
    return false;
  }

  if (_drawCallback == nullptr) {
    endDrawingLoop();
    return false;
  }

  return true;
}

void RNSkDrawView::beginDrawingLoop() {
  if(!isValid()) {
    return;
  }

  if (_drawingLoopId != 0 || _nativeId == 0) {
    return;
  }
  
  // Set to zero to avoid calling beginDrawLoop before we return
  _drawingLoopId = _platformContext->beginDrawLoop(
    _nativeId, std::bind(&RNSkDrawView::drawLoopCallback, this));
}

void RNSkDrawView::drawLoopCallback() {
  if(_redrawRequestCounter > 0 || _drawingMode == RNSkDrawingMode::Continuous) {
      _redrawRequestCounter = 0;
      // We render on the javascript thread. 
      _platformContext->runOnJavascriptThread(
        std::bind(&RNSkDrawView::performDraw, this));
  }
}

void RNSkDrawView::endDrawingLoop() {
  if(_drawingLoopId != 0) {
    _drawingLoopId = 0;
    _platformContext->endDrawLoop(_nativeId);
  }
}

void RNSkDrawView::setDrawingMode(RNSkDrawingMode mode) {
  if(!isValid() || mode == _drawingMode || _nativeId == 0) {
    return;
  }
  _drawingMode = mode;
}

} // namespace RNSkia
