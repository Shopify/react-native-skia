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

static size_t DrawingContextId = 0;

class JsiDrawingContext : public JsiHostObject {
public:
  /**
   Initilalizes a new draw context.
   */
  JsiDrawingContext(SkCanvas* canvas,
                    std::shared_ptr<SkPaint> paint,
                    double opacity) : JsiHostObject() {
    _canvas = canvas;
    _paint = paint;
    _opacity = opacity;
    
    _identifier = ++DrawingContextId;
  }
  
  /**
   Initilalizes a new draw context without the canvas set
   */
  JsiDrawingContext(std::shared_ptr<SkPaint> paint, double opacity) :
    JsiDrawingContext(nullptr, paint, opacity) {}
  
  /**
   Creates a shallow copy of a parent drawing context
   */
  JsiDrawingContext(JsiDrawingContext* parent,
                    std::shared_ptr<SkPaint> paint,
                    float opacity): JsiDrawingContext(parent->getCanvas(), paint, opacity) {}
  
  /**
   Get/Sets the canvas object
   */
  SkCanvas *getCanvas() { return _canvas; }
  void setCanvas(SkCanvas* canvas) {
    _canvas = canvas;
  }
  
  /**
   Get/Sets the paint object
   */
  std::shared_ptr<SkPaint> getPaint() { return _paint; }
  void setPaint(std::shared_ptr<SkPaint> paint) {
    if (_paint != paint) {
      // TODO: notifyChanged();
    }
    _paint = paint;
  }
  
  /**
   Get/Sets the opacity value
   */
  double getOpacity() { return _opacity; }
  void setOpacity(double opacity) {
    if (_opacity != opacity) {
      // TODO: notifyChanged();
      // TODO: notifyChanged();
    }
    _opacity = opacity;
  }
  
protected:
  SkCanvas *_canvas = nullptr;
  std::shared_ptr<SkPaint> _paint = nullptr;
  double _opacity = 1.0;
  size_t _identifier;
};

}
