//
// Created by Christian Falch on 23/08/2021.
//

#include "RNSkDrawView.h"

#include <chrono>
#include <functional>
#include <sstream>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkCanvas.h>
#include <SkFont.h>
#include <SkGraphics.h>
#include <SkPaint.h>
#include <SkString.h>
#include <SkPictureRecorder.h>
#include <SkBBHFactory.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace std::chrono;

RNSkDrawView::RNSkDrawView(std::shared_ptr<RNSkPlatformContext> context)
    : _jsiCanvas(std::make_shared<JsiSkCanvas>(context)),
      _platformContext(context),
      _infoObject(std::make_shared<RNSkInfoObject>()),
      _jsDrawingLock(std::make_shared<std::timed_mutex>()),
      _gpuDrawingLock(std::make_shared<std::timed_mutex>())
      {}

RNSkDrawView::~RNSkDrawView() {
#if LOG_ALL_DRAWING
  RNSkLogger::logToConsole("RNSkDrawView::~RNSkDrawView - %i", getNativeId());
#endif
  
  _isInvalidated = true;
  
  endDrawingLoop();
  
  // Wait for the drawing locks
  if(!_jsDrawingLock->try_lock_for(1250ms)) {
    RNSkLogger::logToConsole("Warning: JS drawing is still locked for native view with id %i", _nativeId);
  }
  
  if(!_gpuDrawingLock->try_lock_for(1250ms)) {
    RNSkLogger::logToConsole("Warning: SKIA drawing is still locked for native view with id %i", _nativeId);
  }
  
  onInvalidated();

  _jsDrawingLock = nullptr;
  _gpuDrawingLock = nullptr;
}

void RNSkDrawView::setNativeId(size_t nativeId) {
  _nativeId = nativeId;
  beginDrawingLoop();
}

void RNSkDrawView::setDrawCallback(std::shared_ptr<jsi::Function> callback) {

  if (callback == nullptr) {
    _drawCallback = nullptr;
    // We can just reset everything - this is a signal that we're done.
    endDrawingLoop();
    return;
  }
  
  // Reset timing info
  _jsTimingInfo.reset();
  _gpuTimingInfo.reset();
  _vsyncTimingInfo.reset();
  
  // Set up debug font/paints
  auto font = SkFont();
  font.setSize(14);
  auto paint = SkPaint();
  paint.setColor(SkColors::kRed);
  
  // Create draw drawCallback wrapper
  _drawCallback = std::make_shared<RNSkDrawCallback>(
      [this, paint, font, callback](std::shared_ptr<JsiSkCanvas> canvas, int width,
                                    int height, double timestamp,
                                    std::shared_ptr<RNSkPlatformContext> context) {

       auto runtime = context->getJsRuntime();
                         
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
                         
      // Draw debug overlays
      if (_showDebugOverlay) {

        // Display average rendering timer
        auto jsAvg = _jsTimingInfo.getAverage();
        auto jsFps = _jsTimingInfo.getFps();
        
        auto gpuAvg = _gpuTimingInfo.getAverage();
        auto gpuFps = _gpuTimingInfo.getFps();
        
        auto total = jsAvg + gpuAvg;
        
        auto vsyncFps = _vsyncTimingInfo.getFps();
                                                      
        // Build string
        std::ostringstream stream;
        stream << "js: " << jsAvg << "ms gpu: " << gpuAvg << "ms " << " total: " << total << "ms";
//        stream << "js:" << jsAvg << "ms/" << jsFps << "fps " << "gpu:" << gpuAvg << "ms/" <<
//          gpuFps << "fps" << " total:" << total << "ms/" << vsyncFps << "fps";
        
        std::string debugString = stream.str();
        
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
    
    // Restore and flush canvas
    skCanvas->restore();
    skCanvas->flush();
  }
}

sk_sp<SkImage> RNSkDrawView::makeImageSnapshot(std::shared_ptr<SkRect> bounds) {
  // Assert width/height
  auto surface = SkSurface::MakeRasterN32Premul(getWidth(), getHeight());
  auto canvas = surface->getCanvas();
  auto jsiCanvas = std::make_shared<JsiSkCanvas>(_platformContext);
  jsiCanvas->setCanvas(canvas);
  
  milliseconds ms = duration_cast<milliseconds>(
      system_clock::now().time_since_epoch());
  
  drawInCanvas(jsiCanvas, getWidth(), getHeight(), ms.count() / 1000);
  
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
#if LOG_ALL_DRAWING
  RNSkLogger::logToConsole("RNSkDrawView::performDraw - %i", getNativeId());
#endif
  
  // Start timing
  _jsTimingInfo.beginTiming();
  
  // Record the drawing operations on the JS thread so that we can
  // move the actual drawing onto the render thread later
  SkPictureRecorder recorder;
  SkRTreeFactory factory;
  SkCanvas* canvas = recorder.beginRecording(getWidth(), getHeight(), &factory);
  _jsiCanvas->setCanvas(canvas);
  
  // Get current milliseconds
  milliseconds ms = duration_cast<milliseconds>(
          system_clock::now().time_since_epoch());
  
  // Perform the javascript drawing
  drawInCanvas(_jsiCanvas, getWidth(), getHeight(), ms.count() / 1000.0);
  
  // Finish drawing operations
  auto p = recorder.finishRecordingAsPicture();
  
  // Calculate duration
  _jsTimingInfo.stopTiming();
  
  if(_gpuDrawingLock->try_lock()) {

    // Post drawing message to the render thread where the picture recorded
    // will be sent to the GPU/backend for rendering to screen.
    auto gpuLock = _gpuDrawingLock;
    getPlatformContext()->runOnRenderThread([this, p = std::move(p), gpuLock]() {
      
      if(isInvalidated()) {
        gpuLock->unlock();
        return;
      }
      
      _gpuTimingInfo.beginTiming();

      // Draw the picture recorded on the real GPU canvas
      if(_nativeDrawFunc != nullptr) {
#if LOG_ALL_DRAWING
          RNSkLogger::logToConsole("RNSkDrawView::drawFrame - %i", getNativeId());
#endif
        _nativeDrawFunc(p);
      } else {
#if LOG_ALL_DRAWING
          RNSkLogger::logToConsole("RNSkDrawView::drawFrame - %i SKIPPING, draw func is null", getNativeId());
#endif
      }

      _gpuTimingInfo.stopTiming();

      // Unlock GPU drawing
      gpuLock->unlock();
    });
  } else {
#ifdef DEBUG
    static size_t framesSkipped = 0;
    printf("SKIA/GPU: Skipped frames: %lu\n", ++framesSkipped);
#endif
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
  _drawingLoopId = _platformContext->beginDrawLoop(
    _nativeId, std::bind(&RNSkDrawView::drawLoopCallback, this, std::placeholders::_1));
}

void RNSkDrawView::drawLoopCallback(bool invalidated) {
  if(invalidated) {
    _isInvalidated = true;
    onInvalidated();
#if LOG_ALL_DRAWING
  RNSkLogger::logToConsole("RNSkDrawView::onInvalidated - %i", getNativeId());
#endif
    return;
  }
  
  if(_redrawRequestCounter > 0 || _drawingMode == RNSkDrawingMode::Continuous) {
      _redrawRequestCounter = 0;
      
    _vsyncTimingInfo.beginTiming();
    
    // We render on the javascript thread.
    if(_jsDrawingLock->try_lock()) {
      _platformContext->runOnJavascriptThread(std::bind(&RNSkDrawView::performDraw, this));
    } else {
#ifdef DEBUG
      static size_t framesSkipped = 0;
      printf("SKIA/JS: Skipped frames: %lu\n", ++framesSkipped);
#endif
      requestRedraw();
    }
    
    _vsyncTimingInfo.stopTiming();
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
