//
// Created by Christian Falch on 23/08/2021.
//

#include "RNSkDrawView.h"

#include <chrono>
#include <functional>
#include <sstream>
#include <string>
#include <memory>
#include <vector>
#include <utility>

#include <JsiSkCanvas.h>
#include <RNSkLog.h>
#include <RNSkPlatformContext.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkBBHFactory.h>
#include <SkCanvas.h>
#include <SkFont.h>
#include <SkFontTypes.h>
#include <SkGraphics.h>
#include <SkPaint.h>
#include <SkPictureRecorder.h>
#include <SkSurface.h>
#include <SkRect.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace std::chrono;

RNSkDrawView::RNSkDrawView(std::shared_ptr<RNSkPlatformContext> context)
    : _jsiCanvas(std::make_shared<JsiSkCanvas>(context)),
      _platformContext(std::move(context)),
      _infoObject(std::make_shared<RNSkInfoObject>()),
      _jsDrawingLock(std::make_shared<std::timed_mutex>()),
      _gpuDrawingLock(std::make_shared<std::timed_mutex>()),
      _jsTimingInfo("SKIA/JS"),
      _gpuTimingInfo("SKIA/GPU")
      {}

RNSkDrawView::~RNSkDrawView() {
  endDrawingLoop();
}

void RNSkDrawView::setJsiProperties(std::unordered_map<std::string, JsiValueWrapper> &props) {
  for(auto& prop: props) {
    if(prop.first == "drawCallback") {
      if(prop.second.isUndefinedOrNull()) {
        // Clear drawcallback
        _drawCallback = nullptr;
        // We can just reset everything - this is a signal that we're done.
        endDrawingLoop();
        return;
      } else if (prop.second.getType() != JsiWrapperValueType::Function) {
        // We expect a function for the draw callback custom property
        throw std::runtime_error("Expected a function for the drawCallback custom property.");
      }

      // Save callback
      _drawCallback = prop.second.getAsFunction();

      // Request redraw
      requestRedraw();

    } else {
      throw std::runtime_error("Property " + prop.first + " not found.");
    }
  }
}

jsi::Value RNSkDrawView::callJsiMethod(jsi::Runtime& runtime,
                                       const std::string& name,
                                       const jsi::Value *arguments,
                                       size_t count) {
  
  if (name == "invalidate") {
    // Post a redraw request
    requestRedraw();
  } else if (name == "makeImageSnapshot") {
    // Create an image snapshot
    sk_sp<SkImage> image;
    if(count > 0 && !arguments[0].isUndefined() && !arguments[0].isNull()) {
      auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
      image = makeImageSnapshot(rect);
    } else {
      image = makeImageSnapshot(nullptr);
    }
    if(image == nullptr) {
      jsi::detail::throwJSError(runtime, "Could not create image from current surface.");
      return jsi::Value::undefined();
    }
    return jsi::Object::createFromHostObject(runtime, std::make_shared<JsiSkImage>(getPlatformContext(), image));
  } else {
    throw std::runtime_error("Command " + name + " not found.");
  }
  return jsi::Value::undefined();
}

void RNSkDrawView::setNativeId(size_t nativeId) {
  _nativeId = nativeId;
  beginDrawingLoop();
}

void RNSkDrawView::callJsDrawCallback(std::shared_ptr<JsiSkCanvas> canvas,
                                      int width,
                                      int height,
                                      double timestamp) {
  if(_drawCallback == nullptr) {
    return;
  }

  // Reset timing info
  _jsTimingInfo.reset();
  _gpuTimingInfo.reset();

  auto runtime = getPlatformContext()->getJsRuntime();

  // Update info parameter
  _infoObject->beginDrawOperation(width, height, timestamp);

  // Set up arguments array
  std::vector<jsi::Value> args(2);
  args[0] = jsi::Object::createFromHostObject(*runtime, canvas);
  args[1] = jsi::Object::createFromHostObject(*runtime, _infoObject);

  // To be able to call the drawing function we'll wrap it once again
  _drawCallback->call(*runtime,
                      static_cast<const jsi::Value *>(args.data()),
                      (size_t)2);

  // Reset touches
  _infoObject->endDrawOperation();

  // Draw debug overlays
  if (_showDebugOverlay) {

    // Display average rendering timer
    auto jsAvg = _jsTimingInfo.getAverage();
    //auto jsFps = _jsTimingInfo.getFps();

    auto gpuAvg = _gpuTimingInfo.getAverage();
    //auto gpuFps = _gpuTimingInfo.getFps();

    auto total = jsAvg + gpuAvg;

    // Build string
    std::ostringstream stream;
    stream << "js: " << jsAvg << "ms gpu: " << gpuAvg << "ms " << " total: " << total << "ms";

    std::string debugString = stream.str();

    // Set up debug font/paints
    auto font = SkFont();
    font.setSize(14);
    auto paint = SkPaint();
    paint.setColor(SkColors::kRed);
    canvas->getCanvas()->drawSimpleText(
            debugString.c_str(), debugString.size(), SkTextEncoding::kUTF8, 8,
            18, font, paint);
  }
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
    callJsDrawCallback(canvas, width / pd, height / pd, time);
    
    // Restore and flush canvas
    skCanvas->restore();
    skCanvas->flush();
  }
}

sk_sp<SkImage> RNSkDrawView::makeImageSnapshot(std::shared_ptr<SkRect> bounds) {
  // Assert width/height
  auto surface = SkSurface::MakeRasterN32Premul(getScaledWidth(), getScaledHeight());
  auto canvas = surface->getCanvas();
  auto jsiCanvas = std::make_shared<JsiSkCanvas>(_platformContext);
  jsiCanvas->setCanvas(canvas);
  
  milliseconds ms = duration_cast<milliseconds>(
      system_clock::now().time_since_epoch());
  
  drawInCanvas(jsiCanvas, getScaledWidth(), getScaledHeight(), ms.count() / 1000);
  
  if(bounds != nullptr) {
    SkIRect b = SkIRect::MakeXYWH(bounds->x(), bounds->y(), bounds->width(), bounds->height());
    return surface->makeImageSnapshot(b);
  } else {
    return surface->makeImageSnapshot();
  }
}

void RNSkDrawView::updateTouchState(std::vector<RNSkTouchPoint>&& points) {
  _infoObject->updateTouches(std::move(points));
  requestRedraw();
}

void RNSkDrawView::performDraw() {
  // Start timing
  _jsTimingInfo.beginTiming();
  
  // Record the drawing operations on the JS thread so that we can
  // move the actual drawing onto the render thread later
  SkPictureRecorder recorder;
  SkRTreeFactory factory;
  SkCanvas* canvas = recorder.beginRecording(getScaledWidth(), getScaledHeight(), &factory);
  _jsiCanvas->setCanvas(canvas);
  
  // Get current milliseconds
  milliseconds ms = duration_cast<milliseconds>(
          system_clock::now().time_since_epoch());
  
  try {
    // Perform the javascript drawing
    drawInCanvas(_jsiCanvas, getScaledWidth(), getScaledHeight(), ms.count() / 1000.0);
  } catch(...) {
    _jsTimingInfo.stopTiming();
    _jsDrawingLock->unlock();
    throw;
  }
  
  // Finish drawing operations
  auto p = recorder.finishRecordingAsPicture();

  _jsiCanvas->setCanvas(nullptr);
  
  // Calculate duration
  _jsTimingInfo.stopTiming();
  
  if(_gpuDrawingLock->try_lock()) {

    // Post drawing message to the render thread where the picture recorded
    // will be sent to the GPU/backend for rendering to screen.
    auto gpuLock = _gpuDrawingLock;
    _platformContext->runOnRenderThread([weakSelf = weak_from_this(), p = std::move(p), gpuLock]() {
      auto self = weakSelf.lock();
      if (self) {
        // Draw the picture recorded on the real GPU canvas
        self->_gpuTimingInfo.beginTiming();
        self->renderToSkiaCanvas([p = std::move(p)](SkCanvas* canvas) {
          canvas->drawPicture(p);
        });
        self->_gpuTimingInfo.stopTiming();
      }
      // Unlock GPU drawing
      gpuLock->unlock();
    });
  } else {
#ifdef DEBUG
    _gpuTimingInfo.markSkipped();
#endif
    // Request a new redraw since the last frame was skipped.
    requestRedraw();
  }
  
  // Unlock JS drawing
  _jsDrawingLock->unlock();
}

void RNSkDrawView::requestRedraw() {
  _redrawRequestCounter++;
}

void RNSkDrawView::beginDrawingLoop() {
  if (_drawingLoopId != 0 || _nativeId == 0) {
    return;
  }
  // Set to zero to avoid calling beginDrawLoop before we return
  _drawingLoopId = _platformContext->beginDrawLoop(_nativeId,
    [weakSelf = weak_from_this()](bool invalidated) {
    auto self = weakSelf.lock();
    if(self) {
      self->drawLoopCallback(invalidated);
    }
  });
}

void RNSkDrawView::drawLoopCallback(bool invalidated) {
  if(_redrawRequestCounter > 0 || _drawingMode == RNSkDrawingMode::Continuous) {
      _redrawRequestCounter = 0;
      
    // We render on the javascript thread.
    if(_jsDrawingLock->try_lock()) {
      _platformContext->runOnJavascriptThread([weakSelf = weak_from_this()](){
        auto self = weakSelf.lock();
        if(self) {
          self->performDraw();
        }
      });
    } else {
#ifdef DEBUG
      _jsTimingInfo.markSkipped();
#endif
      requestRedraw();
    }
  }
}

void RNSkDrawView::endDrawingLoop() {
  if(_drawingLoopId != 0) {
    _drawingLoopId = 0;
    _platformContext->endDrawLoop(_nativeId);
  }
}

void RNSkDrawView::setDrawingMode(RNSkDrawingMode mode) {
  if(mode == _drawingMode || _nativeId == 0) {
    return;
  }
  _drawingMode = mode;
}

} // namespace RNSkia
