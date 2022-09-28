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

class JsiBaseDrawingContext : public JsiHostObject {
public:
  JsiBaseDrawingContext() : JsiHostObject() {}
  
  virtual SkCanvas *getCanvas() = 0;
  virtual void setCanvas(SkCanvas* canvas) = 0;
  
  virtual std::shared_ptr<SkPaint> getPaint() = 0;
  
  virtual double getOpacity() = 0;
};

class JsiDrawingContext : public JsiBaseDrawingContext {
public:
  JsiDrawingContext() : JsiBaseDrawingContext() {}
  
  JsiDrawingContext(SkCanvas* canvas,
                    std::shared_ptr<SkPaint> paint,
                    double opacity) : JsiBaseDrawingContext() {
    _canvas = canvas;
    _paint = paint;
    _opacity = opacity;
  }
  
  JsiDrawingContext(std::shared_ptr<JsiBaseDrawingContext> parent,
                    std::shared_ptr<SkPaint> paint,
                    float opacity) {
    assert(paint != nullptr);
    assert(parent != nullptr);
    assert(parent->getCanvas() != nullptr);
    
    _canvas = parent->getCanvas();
    _paint = paint;
    _opacity = opacity;
    
  }
  
  SkCanvas *getCanvas() override { return _canvas; }
  void setCanvas(SkCanvas* canvas) override {
    _canvas = canvas;
  }
  
  std::shared_ptr<SkPaint> getPaint() override { return _paint; }
  void setPaint(std::shared_ptr<SkPaint> paint) {
    _paint = paint;
  }
  
  double getOpacity() override { return _opacity; }
  void setOpacity(double opacity) {
    _opacity = opacity;
  }
  
protected:
  SkCanvas *_canvas = nullptr;
  std::shared_ptr<SkPaint> _paint = nullptr;
  double _opacity = 1.0;
};

class JsiDrawingContextWrapper : public JsiDrawingContext {
public:
  JsiDrawingContextWrapper(jsi::Runtime &runtime,
                           const jsi::Value *arguments,
                           size_t count) : JsiDrawingContext() {
    
    auto context = getArgumentAsObject(runtime, arguments, count, 0);
    // FIXME: Add guards and error handlinga
    // This is also super slow since we're marshalling objects from JS -> JSI -> C++
    auto canvas = context.getPropertyAsObject(runtime, "canvas");
    auto paint = context.getPropertyAsObject(runtime, "paint");
    _opacity = context.getProperty(runtime, "opacity").asNumber();
    
    _canvas = canvas.asHostObject<JsiSkCanvas>(runtime)->getCanvas();
    _paint = paint.asHostObject<JsiSkPaint>(runtime)->getObject();
    
    /**
     GUARDING NEEDS OPTIMIZATION:
     auto props = JsiDomNodeProps(runtime, getArgumentAsObject(runtime, arguments, count, 0));
     props.tryReadHostObjectProperty(runtime, "canvas", false);
     props.tryReadHostObjectProperty(runtime, "paint", false);
     props.tryReadNumericProperty(runtime, "opacity", false);
     
     _opacity = props.getValue("opacity").getAsNumber();
     _canvas = std::dynamic_pointer_cast<JsiSkCanvas>(props.getValue("canvas").getAsHostObject())->getCanvas();
     _paint = std::dynamic_pointer_cast<JsiSkPaint>(props.getValue("paint").getAsHostObject())->getObject();
     */
  }
};
}
