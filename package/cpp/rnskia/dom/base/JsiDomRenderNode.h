
#pragma once

#include "JsiDomNode.h"
#include "JsiDrawingContext.h"
#include "ContextProcessor.h"
#include "PointProp.h"
#include "MatrixProp.h"
#include "TransformProp.h"

namespace RNSkia {

static const char* PropNameOrigin = "origin";

class JsiDomRenderNode : public JsiDomNode {
public:
  JsiDomRenderNode(std::shared_ptr<RNSkPlatformContext> context,
                   jsi::Runtime &runtime,
                   const jsi::Value *arguments,
                   size_t count) :
  JsiDomNode(context, runtime, arguments, count),
    _matrixProp(std::make_unique<MatrixProp>(PropNameMatrix)),
    _transformProp(std::make_unique<TransformProp>(PropNameTransform)),
    _originProp(std::make_unique<PointProp>(PropNameOrigin)) {}
  
  JSI_HOST_FUNCTION(render) {
    // Get drawing context
    render(std::make_shared<JsiDrawingContextWrapper>(runtime, arguments, count));
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
  
  void render(std::shared_ptr<JsiBaseDrawingContext> context) {
    
    auto props = getProperties();
    if (props == nullptr) {
      // A node might have an empty set of properties - then we can just render the node directly
      renderNode(context);
      return;
    }
    
    // Make sure we update any properties that were changed in sub classes so that
    // they can update any derived values
    if (props->getHasPropChanges()) {
      onPropsChanged(getProperties());
    }
    
    // Update drawing context
    if(_paintCache == nullptr) {
      _paintCache = std::make_shared<SkPaint>(*context->getPaint());
    }
    std::shared_ptr<JsiBaseDrawingContext> childContext =
      ContextProcessor::processContext(context, _paintCache, props);
    
    // Handle matrix/transforms
    if (_matrixProp->hasValue() || _transformProp->hasValue()) {
      auto matrix = _matrixProp->hasValue() ? _matrixProp->getDerivedValue() : _transformProp->getDerivedValue();
      
      context->getCanvas()->save();
      
      if (_originProp->hasValue()) {
        context->getCanvas()->translate(_originProp->getDerivedValue().x(), _originProp->getDerivedValue().y());
      }
      
      context->getCanvas()->concat(*matrix);
      
      if (_originProp->hasValue()) {
        context->getCanvas()->translate(-_originProp->getDerivedValue().x(), -_originProp->getDerivedValue().y());
      }
    }
    
    // Render the node
    renderNode(childContext);
    
    if (_matrixProp->hasValue() || _transformProp->hasValue()) {
      context->getCanvas()->restore();
    }
    
    props->resetPropChanges();
  };
  
protected:
  /**
   Override to implement rendering where the current state of the drawing context is correctly set.
   */
  virtual void renderNode(std::shared_ptr<JsiBaseDrawingContext> context) = 0;
  
  virtual void onPropsChanged(std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomNode::onPropsChanged(props);
    
    _matrixProp->onPropsChanged(props);
    _originProp->onPropsChanged(props);
    _transformProp->onPropsChanged(props);
  }
  
  virtual void onPropsSet(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomNode::onPropsSet(runtime, props);
    
    _matrixProp->onPropsSet(runtime, props);
    _originProp->onPropsSet(runtime, props);
    _transformProp->onPropsSet(runtime, props);
    
    props->tryReadStringProperty(runtime, PropNameColor);
    props->tryReadStringProperty(runtime, PropNameStyle);
    props->tryReadNumericProperty(runtime, PropNameStrokeWidth);
    props->tryReadNumericProperty(runtime, PropNameOpacity);
  }
  
private:
  std::unique_ptr<PointProp> _originProp;
  std::unique_ptr<MatrixProp> _matrixProp;
  std::unique_ptr<TransformProp> _transformProp;
  std::shared_ptr<SkPaint> _paintCache;
  bool _shouldSaveCanvas;
};

}
