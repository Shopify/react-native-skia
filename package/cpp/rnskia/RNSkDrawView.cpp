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

void RNSkDrawView::setTouchCallback(std::shared_ptr<jsi::Function> callback) {
  if (callback == nullptr) {
    _touchCallback = nullptr;
    return;
  }

  _touchCallback = std::make_shared<
      RNSkTouchCallback>([this,
                          callback](std::vector<RNSkTouchPoint> touchPoints) {
    auto runtime = this->_platformContext->getJsRuntime();
    // Add touch points
    auto touches = jsi::Array(*runtime, touchPoints.size());
    for (size_t i = 0; i < touchPoints.size(); i++) {
      auto touchObj = jsi::Object(*runtime);
      touchObj.setProperty(*runtime, "x", touchPoints.at(i).x);
      touchObj.setProperty(*runtime, "y", touchPoints.at(i).y);
      touchObj.setProperty(*runtime, "force", touchPoints.at(i).force);
      touchObj.setProperty(*runtime, "type", (double)touchPoints.at(i).type);
      touches.setValueAtIndex(*runtime, i, touchObj);
    }

    if (callback) {
      try {
        callback->call(*runtime, touches, 1);
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
            "An error occured while sending touch events to the Skia View.");
      }
    }
  });
}

void RNSkDrawView::setDrawCallback(std::shared_ptr<jsi::Function> callback) {

  if (callback == nullptr) {
    _drawCallback = nullptr;
    // We can just reset everything - this is a signal that we're done.
    endDrawingLoop();
    return;
  }

  // Set up timing
  auto timingInfo = std::make_shared<RNSkTimingInfo>();
  timingInfo->lastTimeStamp = -1;
  timingInfo->lastDurationIndex = 0;
  timingInfo->lastDurationsCount = 0;

  // Create draw drawCallback wrapper
  _drawCallback = std::make_shared<RNSkDrawCallback>(
      [this, callback, timingInfo](std::shared_ptr<JsiSkCanvas> canvas,
                                   int width, int height, double timestamp,
                                   RNSkPlatformContext *context) {
        double delta = 0;
        if (timingInfo->lastTimeStamp > -1) {
          delta = timestamp - timingInfo->lastTimeStamp;
        }
        timingInfo->lastTimeStamp = timestamp;

        auto runtime = context->getJsRuntime();

        // Set up arguments array
        jsi::Value *args = new jsi::Value[2];
        args[0] = jsi::Object::createFromHostObject(*runtime, canvas);
        args[1] = jsi::Object(*runtime);

        // Second argument should be the height/width, timestamp, delta
        // fps and touch points
        auto infoObject = args[1].asObject(*runtime);
        infoObject.setProperty(*runtime, "width", width);
        infoObject.setProperty(*runtime, "height", height);
        infoObject.setProperty(*runtime, "timestamp", timestamp);
        infoObject.setProperty(*runtime, "delta", delta);
        infoObject.setProperty(*runtime, "fps", 1.0 / delta);

        // To be able to call the drawing function we'll wrap it once again
        callback->call(*runtime, static_cast<const jsi::Value *>(args),
                       (size_t)2);

        // Clean up
        delete[] args;

        // Draw debug overlays
        if (_showDebugOverlay) {
          // Average duration
          timingInfo->lastDurations[timingInfo->lastDurationIndex++] =
              _lastDuration;

          if (timingInfo->lastDurationIndex == NUMBER_OF_DURATION_SAMPLES) {
            timingInfo->lastDurationIndex = 0;
          }

          if (timingInfo->lastDurationsCount < NUMBER_OF_DURATION_SAMPLES) {
            timingInfo->lastDurationsCount++;
          }

          long average = 0;
          for (size_t i = 0; i < timingInfo->lastDurationsCount; i++) {
            average += timingInfo->lastDurations[i];
          }
          average = average / timingInfo->lastDurationsCount;

          auto debugString = std::to_string(average) + "ms";

          if (_drawingMode == RNSkDrawingMode::Continuous) {
            debugString +=
                " " + std::to_string((size_t)round(1.0 / delta)) + "fps";
            debugString += "/continuous";
          } else {
            debugString += "/default";
          }

          auto font = SkFont();
          font.setSize(16);
          auto paint = SkPaint();
          paint.setColor(SkColors::kRed);

          canvas->getCanvas()->drawSimpleText(
              debugString.c_str(), debugString.size(), SkTextEncoding::kUTF8,
              18, 18, font, paint);
        }
      });

  // Request redraw
  requestRedraw();
}

void RNSkDrawView::drawInSurface(sk_sp<SkSurface> surface, int width,
                                 int height, double time,
                                 RNSkPlatformContext *context) {

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
  if (_touchCallback != nullptr) {
    _platformContext->runOnJavascriptThread(
        [this, points]() { (*_touchCallback)(points); });

    if (_drawingMode != RNSkDrawingMode::Continuous) {
      requestRedraw();
    }
  }
}

void RNSkDrawView::requestRedraw() {
  if (!isReadyToDraw()) {
    return;
  }

  _isDrawing = true;

  auto performDraw = [this]() {
    if (_drawingMode == RNSkDrawingMode::Continuous) {
      _isDrawing = false;
      beginDrawingLoop();
      return;
    }

    try {
      if (_platformContext != nullptr) {
        milliseconds ms = std::chrono::duration_cast<milliseconds>(
            system_clock::now().time_since_epoch());
        drawFrame(ms.count());
      }
    } catch (...) {
      _isDrawing = false;
      throw;
    }

    _isDrawing = false;
  };

  _platformContext->runOnJavascriptThread(performDraw);
}

bool RNSkDrawView::isReadyToDraw() {
  if (_isDrawing) {
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
  if (_platformContext == nullptr) {
    return;
  }

  if (_drawingLoopIdentifier != -1 || _platformContext == nullptr) {
    return;
  }

  // Set to zero to avoid calling beginDrawLoop before we return
  _drawingLoopIdentifier = 0;
  _drawingLoopIdentifier =
      _platformContext->beginDrawLoop([this](double timestamp) {
        auto performDraw = [=]() {
          if (!isReadyToDraw()) {
            return;
          }

          _isDrawing = true;

          try {
            if (_platformContext != nullptr) {
              drawFrame(timestamp);
            }
          } catch (...) {
            _isDrawing = false;
            throw;
          }

          _isDrawing = false;
        };

        _platformContext->runOnJavascriptThread(performDraw);
      });
}

void RNSkDrawView::endDrawingLoop() {
  if (_platformContext == nullptr) {
    return;
  }

  if (_drawingLoopIdentifier == -1) {
    return;
  }

  _platformContext->endDrawLoop(_drawingLoopIdentifier);
  _drawingLoopIdentifier = -1;
}

void RNSkDrawView::setDrawingMode(RNSkDrawingMode mode) {
  endDrawingLoop();
  _drawingMode = mode;
  requestRedraw();
}

} // namespace RNSkia
