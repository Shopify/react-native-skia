
#pragma once

#include "JsiDomNode.h"
#include "JsiDrawingContext.h"
#include "PointProp.h"
#include "MatrixProp.h"
#include "TransformProp.h"
#include "PaintProp.h"

namespace RNSkia {

static const char* PropNameOrigin = "origin";
static PropId PropNameOpacity = JsiPropId::get("opacity");

class JsiDomRenderNode : public JsiDomNode {
public:
  JsiDomRenderNode(std::shared_ptr<RNSkPlatformContext> context,
                   jsi::Runtime &runtime,
                   const jsi::Value *arguments,
                   size_t count) :
  JsiDomNode(context, runtime, arguments, count),
    _paintProp(std::make_unique<PaintProp>()),
    _opacityProp(std::make_unique<JsiDomNodeProp>(PropNameOpacity, PropType::Number)),
    _matrixProp(std::make_unique<MatrixProp>(PropNameMatrix)),
    _transformProp(std::make_unique<TransformProp>(PropNameTransform)),
    _originProp(std::make_unique<PointProp>(PropNameOrigin)) {}
  
  JSI_HOST_FUNCTION(render) {
    // Get drawing context
    render(std::make_shared<JsiDrawingContextWrapper>(runtime, arguments, count).get());
    return jsi::Value::undefined();
  }
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, addChild),
                       JSI_EXPORT_FUNC(JsiDomNode, removeChild),
                       JSI_EXPORT_FUNC(JsiDomNode, insertChildBefore),
                       JSI_EXPORT_FUNC(JsiDomNode, setProps),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose),
                       JSI_EXPORT_FUNC(JsiDomNode, isNative),
                       JSI_EXPORT_FUNC(JsiDomNode, children),
                       JSI_EXPORT_FUNC(JsiDomRenderNode, render))
  
  void render(JsiBaseDrawingContext* context) {
    
    auto props = getProperties();
    if (props == nullptr) {
      // A node might have an empty set of properties - then we can just render the node directly
      renderNode(context);
      return;
    }
    
    // Since the paint props uses parent paint, we need to set it before we call onPropsChanged
    _paintProp->setParentPaint(context->getPaint());
    
    // Make sure we commit any waiting transactions in the props object
    props->commitTransactions();
    
    // Make sure we update any properties that were changed in sub classes so that
    // they can update any derived values
    if (props->getHasPropChanges()) {
      onPropsChanged(props);
    }
    
    // Handle matrix/transforms
    if (_hasMatrixOrTransformProp) {
      auto matrix = _matrixProp->hasValue() ?
        _matrixProp->getDerivedValue() : _transformProp->getDerivedValue();
      
      // Save canvas state
      context->getCanvas()->save();
      
      if (_originProp->hasValue()) {
        // Handle origin
        context->getCanvas()->translate(_originProp->getDerivedValue().x(),
                                        _originProp->getDerivedValue().y());
      }
      
      // Concat canvas' matrix with our matrix
      context->getCanvas()->concat(*matrix);
      
      if (_originProp->hasValue()) {
        // Handle origin
        context->getCanvas()->translate(-_originProp->getDerivedValue().x(),
                                        -_originProp->getDerivedValue().y());
      }
    }
    
    // Render the node
    renderNode(resolveContext(context));
    
    // Restore if needed
    if (_hasMatrixOrTransformProp) {
      context->getCanvas()->restore();
    }
    
    // Reset all changes in props
    props->resetPropChanges();
  };
  
protected:
  /**
   Override to implement rendering where the current state of the drawing context is correctly set.
   */
  virtual void renderNode(JsiBaseDrawingContext* context) = 0;
  
  virtual void onPropsChanged(JsiDomNodeProps* props) override {
    JsiDomNode::onPropsChanged(props);
    
    _paintProp->updatePropValues(props);
    _matrixProp->updatePropValues(props);
    _originProp->updatePropValues(props);
    _transformProp->updatePropValues(props);
    _opacityProp->updatePropValues(props);
  }
  
  virtual void onPropsSet(jsi::Runtime &runtime, JsiDomNodeProps* props) override {
    JsiDomNode::onPropsSet(runtime, props);
    
    _paintProp->setProps(runtime, props);
    _matrixProp->setProps(runtime, props);
    _originProp->setProps(runtime, props);
    _transformProp->setProps(runtime, props);
    _opacityProp->setProps(runtime, props);
    
    props->tryReadNumericProperty(runtime, PropNameOpacity);
    
    _hasMatrixOrTransformProp = _matrixProp->hasValue() || _transformProp->hasValue();
  }
  
private:
  JsiBaseDrawingContext* resolveContext(JsiBaseDrawingContext* context) {
    auto props = getProperties();
    // We only need to update the cached context if the paint property or opacity property has changed
    if (_paintProp->hasChanged(props) ||
        props->getHasPropChanges(PropNameOpacity) ||
        _prevOpacity != context->getOpacity()) {
      
      // Paint - start by getting paint from parent context
      auto paint = context->getPaint();
      
      // If our child paint has a value we can use it.
      if (_paintProp->getDerivedValue() != nullptr) {
        paint = _paintProp->getDerivedValue();
      }
      
      // Opacity
      _prevOpacity = context->getOpacity();
      if (_opacityProp->hasValue()) {
        _prevOpacity *= _opacityProp->getPropValue()->getAsNumber();
        // TODO: Is this enough to override the opacity correctly?
        paint->setAlpha(255 * _prevOpacity);
      }
      
      // Create the cached drawing context if it is not set
      if (_cachedContext == nullptr) {
        _cachedContext = std::make_shared<JsiDrawingContext>(context, paint, _prevOpacity);
      } else {
        _cachedContext->setPaint(paint);
        _cachedContext->setOpacity(_prevOpacity);
      }
    }
    
    // Update canvas - it might change on each frame
    if (_cachedContext != nullptr) {
      _cachedContext->setCanvas(context->getCanvas());
    }
    
    return _cachedContext != nullptr ? _cachedContext.get() : context;
  }
  
  double _prevOpacity;
  bool _hasMatrixOrTransformProp;
  std::unique_ptr<PointProp> _originProp;
  std::unique_ptr<MatrixProp> _matrixProp;
  std::unique_ptr<TransformProp> _transformProp;
  std::unique_ptr<PaintProp> _paintProp;
  std::unique_ptr<JsiDomNodeProp> _opacityProp;
  std::shared_ptr<JsiDrawingContext> _cachedContext;
};

}
