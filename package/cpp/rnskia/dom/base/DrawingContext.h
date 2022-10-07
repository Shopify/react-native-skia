#pragma once

#include <vector>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkCanvas.h>
#include <SkPaint.h>

#pragma clang diagnostic pop

namespace RNSkia {

class DrawingContext: public std::enable_shared_from_this<DrawingContext> {
public:
  /**
   Creates a root drawing context with paint and opacity
   */
  DrawingContext(std::shared_ptr<SkPaint> paint, double opacity) {
    _paint = paint;
    _opacity = opacity;
  }
  
  /**
   Initilalizes a new draw context.
   */
  DrawingContext(std::shared_ptr<DrawingContext> parent) {
    _parent = parent;
  }
  
  /**
   Factory for creating a child context
   */
  std::shared_ptr<DrawingContext> createChildContext() {
    auto result = std::make_shared<DrawingContext>(shared_from_this());
    _children.push_back(result);
    return result;
  }
  
  /**
   Invalidate cache - both ourself and our children
   */
  void invalidate() {
    _paint = nullptr;
    for (auto &child: _children) {
      child->invalidate();
    }
  }
  
  /**
   Returns true if the current cache is changed
   */
  bool isInvalid() {
    return _paint == nullptr;
  }
  
  /**
   Get/Sets the canvas object
   */
  SkCanvas *getCanvas() {
    if (_parent != nullptr) {
      return _parent->getCanvas();
    }
    
    return _canvas;
  }
  
  /**
   Sets the canvas
   */
  void setCanvas(SkCanvas* canvas) {
    _canvas = canvas;
  }
  
  /**
   Gets the paint object
   */
  std::shared_ptr<const SkPaint> getPaint() {
    if (_paint != nullptr) {
      return _paint;
    }
    return _parent->getPaint();
  }
  
  /**
   Sets the paint in the current sub context
   */
  std::shared_ptr<SkPaint> getMutablePaint() {
    if (_paint == nullptr) {
      _paint = std::make_shared<SkPaint>(*_parent->getPaint());
    }
    return _paint;
  }
  
  /**
   Sets the paint in the current sub context
   */
  void setMutablePaint(std::shared_ptr<SkPaint> paint) {
    _paint = paint;
  }
  
  /**
   Getd the opacity value
   */
  double getOpacity() {
    if (_paint == nullptr) {
      return _parent->getOpacity();
    }
    return _opacity;
  }
  
  /**
   Sets the opacity value
   */
  void setOpacity(double opacity) {
    if (_parent != nullptr) {
      _opacity = _parent->getOpacity() * opacity;
    } else {
      _opacity = opacity;
    }
    // TODO: Is this enough to set opacity?
    getMutablePaint()->setAlpha(_opacity * 255);
  }
  
private:
  std::shared_ptr<SkPaint> _paint;
  double _opacity;
  
  SkCanvas *_canvas = nullptr;
  
  std::shared_ptr<DrawingContext> _parent;
  std::vector<std::shared_ptr<DrawingContext>> _children;
};

}
