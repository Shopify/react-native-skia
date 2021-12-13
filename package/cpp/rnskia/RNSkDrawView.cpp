//
// Created by Christian Falch on 23/08/2021.
//

#include "RNSkDrawView.h"

#include <chrono>
#include <condition_variable>
#include <mutex>

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
      _isRemoved(false) {}

RNSkDrawView::~RNSkDrawView() {
  {
    _isRemoved = true;
    // This is a very simple fix to an issue where the view posts a redraw
    // function to the javascript thread, and the object is destroyed and then
    // the redraw function is called and ends up executing on a destroyed draw
    // view. Since _isDrawing is an atomic bool we know that as long as it is
    // true we are drawing and should wait.
    // It is limited to only wait for 500 milliseconds - if it is stuck we
    // might have gotten an exception that caused the flag never to be reset.
    milliseconds start = std::chrono::duration_cast<milliseconds>(
        system_clock::now().time_since_epoch());

    // RNSkLogger::logToConsole("Starting to delete RNSkDrawView...");
    while (_isDrawing == true) {
      milliseconds now = std::chrono::duration_cast<milliseconds>(
          system_clock::now().time_since_epoch());
      if (now.count() - start.count() > 500) {
        RNSkLogger::logToConsole("Timed out waiting for RNSkDrawView delete...");
        break;
      }
    }
    RNSkLogger::logToConsole("RNSkDrawView safely deleted.");
  }
}

void RNSkDrawView::setIsRemoved() {
  _isRemoved = true;
  endDrawingLoop();
}

void RNSkDrawView::setDrawCallback(size_t nativeId, std::shared_ptr<jsi::Function> callback) {

  if (callback == nullptr) {
    _drawCallback = nullptr;
    // We can just reset everything - this is a signal that we're done.
    endDrawingLoop();
    return;
  }

  // Update native id
  _nativeId = nativeId;

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

void RNSkDrawView::requestRedraw() {
  if (!isReadyToDraw()) {
    _redrawRequestCounter++;
    return;
  }
  
  _isDrawing = true;
  
  auto performDraw = [this]() {
    if(getIsRemoved()) {
      RNSkLogger::logToConsole("WARNING: Trying to redraw after delete!");
      _isDrawing = false;
      return;
    }

    if (_drawingMode == RNSkDrawingMode::Continuous) {
      _isDrawing = false;
      beginDrawingLoop();
      return;
    }
    
    milliseconds ms = std::chrono::duration_cast<milliseconds>(
        system_clock::now().time_since_epoch());

    drawFrame(ms.count() / 1000.0);

    _isDrawing = false;

    if(_redrawRequestCounter > 0) {
      _redrawRequestCounter = 0;
      requestRedraw();
    }
  };

  _platformContext->runOnJavascriptThread(performDraw);
}

bool RNSkDrawView::isReadyToDraw() {
  if (_isDrawing) {
    return false;
  }

  if(getIsRemoved()) {
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
  if(getIsRemoved()) {
    return;
  }

  if (_drawingLoopId != -1) {
    return;
  }
  
  RNSkLogger::logToConsole("Starting draw loop for %i", _nativeId);

  // Set to zero to avoid calling beginDrawLoop before we return
  _drawingLoopId = 0;
  _drawingLoopId =
      _platformContext->beginDrawLoop(_nativeId, [this]() {
        auto performDraw = [&]() {
          if(getIsRemoved()) {
            return;
          }

          milliseconds ms = std::chrono::duration_cast<milliseconds>(
              system_clock::now().time_since_epoch());

          // Only redraw if view is still alive
          drawFrame(ms.count() / 1000.0);

          _isDrawing = false;
        };

        if (!isReadyToDraw()) {
          return;
        }

        _isDrawing = true;
        _platformContext->runOnJavascriptThread(performDraw);
      });
}

void RNSkDrawView::endDrawingLoop() {
  RNSkLogger::logToConsole("Stopping draw loop for %i", _nativeId);
    _platformContext->endDrawLoop(_nativeId);
    _drawingLoopId = -1;
}

void RNSkDrawView::setDrawingMode(RNSkDrawingMode mode) {
  if(getIsRemoved()) {
    return;
  }
  if(mode != _drawingMode) {
    _drawingMode = mode;
    if(mode == RNSkDrawingMode::Default) {
      endDrawingLoop();
    } else {
      beginDrawingLoop();
      requestRedraw();
    }
  }
}

} // namespace RNSkia
