#pragma once

#include "JsiHostObject.h"

#include <JsiSkCanvas.h>
#include <JsiSkPaint.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkCanvas.h>
#include <SkPaint.h>

#pragma clang diagnostic pop

namespace RNSkia {

class JsiDrawingContext : public JsiHostObject {
public:
  JsiDrawingContext() : JsiHostObject() {}
  
  JsiDrawingContext(JsiDrawingContext* parent) : JsiDrawingContext() {
    _canvas = parent->getCanvas();
    _paint = parent->getPaint();
    _opacity = parent->getOpacity();
  }
  
  JsiDrawingContext(SkCanvas* canvas,
                    std::shared_ptr<SkPaint> paint,
                    double opacity) : JsiDrawingContext() {
    _canvas = canvas;
    _paint = paint;
    _opacity = opacity;
  }
  
  JsiDrawingContext(JsiDrawingContext* parent,
                    std::shared_ptr<SkPaint> paint,
                    float opacity) {
    assert(paint != nullptr);
    assert(parent != nullptr);
    assert(parent->getCanvas() != nullptr);
    
    _canvas = parent->getCanvas();
    _paint = paint;
    _opacity = opacity;
    
  }
  
  JsiDrawingContext(jsi::Runtime &runtime,
                    const jsi::Value *arguments,
                    size_t count) : JsiDrawingContext() {
    
    auto context = getArgumentAsObject(runtime, arguments, count, 0);
    auto canvas = context.getPropertyAsObject(runtime, "canvas");
    auto paint = context.getPropertyAsObject(runtime, "paint");
    _opacity = context.getProperty(runtime, "opacity").asNumber();
    _canvas = canvas.asHostObject<JsiSkCanvas>(runtime)->getCanvas();
    _paint = paint.asHostObject<JsiSkPaint>(runtime)->getObject();
  }
  
  SkCanvas *getCanvas() { return _canvas; }
  void setCanvas(SkCanvas* canvas) {
    _canvas = canvas;
  }
  
  std::shared_ptr<SkPaint> getPaint() { return _paint; }
  void setPaint(std::shared_ptr<SkPaint> paint) {
    if (_paint != paint) {
      notifyChanged();
    }
    _paint = paint;
  }
  
  double getOpacity() { return _opacity; }
  void setOpacity(double opacity) {
    if (_opacity != opacity) {
      notifyChanged();
    }
    _opacity = opacity;
  }
  
  bool hasChanged() {
    return _changed > 0;
  }
  
  void resetChanges() {
    _changed = 0;
  }
  
  void notifyChanged() {
    _changed++;
  }
  
protected:
  SkCanvas *_canvas = nullptr;
  std::shared_ptr<SkPaint> _paint = nullptr;
  double _opacity = 1.0;
  size_t _changed = 1;
};

}
