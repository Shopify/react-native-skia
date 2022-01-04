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
  if(!_isDrawing->try_lock_for(system_clock::now().time_since_epoch() + milliseconds(500))) {
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

  // Reset timing info
  _timingInfo->reset();

  // Create draw drawCallback wrapper
  _drawCallback = std::make_shared<RNSkDrawCallback>(
      [this, callback](std::shared_ptr<JsiSkCanvas> canvas, int width,
                       int height, double timestamp,
                       std::shared_ptr<RNSkPlatformContext> context) {
        auto runtime = context->getJsRuntime();
                         
        // Update info parameter
        _infoObject->beginDrawCallback(width, height, timestamp);

        // Set up arguments array
        jsi::Value *args = new jsi::Value[2];
        args[0] = jsi::Object::createFromHostObject(*runtime, canvas);
        args[1] = jsi::Object::createFromHostObject(*runtime, _infoObject);

        // To be able to call the drawing function we'll wrap it once again
        callback->call(*runtime, static_cast<const jsi::Value *>(args),
                       (size_t)2);

        // Reset touches
        _infoObject->endDrawCallback();

        // Clean up
        delete[] args;

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

void RNSkDrawView::drawInSurface(sk_sp<SkSurface> surface, int width,
                                 int height, double time,
                                 std::shared_ptr<RNSkPlatformContext> context) {

  try {
    if(!isValid()) {
      return;
    }

    // Get the canvas
    auto skCanvas = surface->getCanvas();
    _jsiCanvas->setCanvas(skCanvas);

    // Call the draw drawCallback and perform js based drawing
    if (_drawCallback != nullptr) {
      // Make sure to scale correctly
      auto pd = context->getPixelDensity();
      skCanvas->save();
      skCanvas->scale(pd, pd);
      // Call draw function.
      (*_drawCallback)(_jsiCanvas, width / pd, height / pd, time, context);
      // Restore canvas
      skCanvas->restore();
      skCanvas->flush();
    }
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
        "An error occured while rendering the Skia View.");
  }
}

void RNSkDrawView::updateTouchState(const std::vector<RNSkTouchPoint> &points) {
  _infoObject->updateTouches(points);
  if (_drawingMode != RNSkDrawingMode::Continuous) {
    requestRedraw();
  }
}

void RNSkDrawView::performDraw() {
  if(isValid()) {
    // Calculate milliseconds since start
    milliseconds ms = duration_cast<milliseconds>(
        system_clock::now().time_since_epoch());
    
    // Call draw frame method in sub class
    drawFrame(ms.count() / 1000.0);
    
    // Unlock the drawing lock
    _isDrawing->unlock();
    
    // Should we request a new redraw?
    if(_drawingMode != RNSkDrawingMode::Continuous && _redrawRequestCounter > 0) {
      _redrawRequestCounter = 0;
      requestRedraw();
    }
  } else {
    _isDrawing->unlock();
  }
}

void RNSkDrawView::requestRedraw() {
  if (!isReadyToDraw()) {
    return;
  }
  
  // If we are in continuous mode, we can just start the drawing loop
  if (_drawingMode == RNSkDrawingMode::Continuous) {
    beginDrawingLoop();
    return;
  }
  
  // Check if we are already in a draw
  if(!_isDrawing->try_lock()) {
    _redrawRequestCounter++;
    return;
  }
  
  _platformContext->runOnJavascriptThread(std::bind(&RNSkDrawView::performDraw, this));
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
  _drawingLoopId =
      _platformContext->beginDrawLoop(_nativeId, [this]() {
        if(_isDrawing->try_lock()) {
          _platformContext->runOnJavascriptThread(std::bind(&RNSkDrawView::performDraw, this));
        }
      });
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
  if(mode == RNSkDrawingMode::Default) {
    endDrawingLoop();
  } else {
    beginDrawingLoop();
    requestRedraw();
  }
}

} // namespace RNSkia
