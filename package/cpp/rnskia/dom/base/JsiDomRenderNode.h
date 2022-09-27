
#pragma once

#include "JsiDomNode.h"
#include "JsiDrawingContext.h"
#include "TransformProcessor.h"
#include "ContextProcessor.h"
#include "JsiDomNodePointProp.h"

namespace RNSkia {

static const char* PropNameMatrix = "matrix";
static const char* PropNameTransform = "transform";
static const char* PropNameOrigin = "origin";

class JsiDomRenderNode : public JsiDomNode {
public:
  JsiDomRenderNode(std::shared_ptr<RNSkPlatformContext> context,
                   jsi::Runtime &runtime,
                   const jsi::Value *arguments,
                   size_t count) :
  JsiDomNode(context, runtime, arguments, count),
    _matrixProp(std::make_unique<JsiDomNodeProp>(PropNameMatrix, PropType::HostObject)),
    _originProp(std::make_unique<JsiDomNodePointProp>(PropNameOrigin)) {}
  
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
    if (_shouldSaveCanvas) {
      auto matrix = _hasMatrix ?
      *std::dynamic_pointer_cast<JsiSkMatrix>(props->getValue(PropNameMatrix)->getAsHostObject())->getObject() :
      _transformMatrix;
      
      context->getCanvas()->save();
      
      if (_originProp->hasValue()) {
        context->getCanvas()->translate(_originProp->getDerivedValue().x(), _originProp->getDerivedValue().y());
      }
      
      context->getCanvas()->concat(matrix);
      
      if (_originProp->hasValue()) {
        context->getCanvas()->translate(-_originProp->getDerivedValue().x(), -_originProp->getDerivedValue().y());
      }
    }
    
    // Render the node
    renderNode(childContext);
    
    if (_shouldSaveCanvas) {
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
    
    if (_hasTransform && props->getHasPropChanges(PropNameTransform)) {
      _transformMatrix.setIdentity();
      TransformProcessor::processTransform(_transformMatrix, props->getValue(PropNameTransform));
    }
    
    _matrixProp->onPropsChanged(props);
    _originProp->onPropsChanged(props);
  }
  
  virtual void onPropsSet(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomNode::onPropsSet(runtime, props);
    
    props->tryReadHostObjectProperty(runtime, PropNameMatrix);
    props->tryReadArrayProperty(runtime, PropNameTransform);
    props->tryReadStringProperty(runtime, PropNameColor);
    props->tryReadStringProperty(runtime, PropNameStyle);
    props->tryReadNumericProperty(runtime, PropNameStrokeWidth);
    props->tryReadNumericProperty(runtime, PropNameOpacity);
    
    _hasMatrix = props->hasValue(PropNameMatrix);
    _hasTransform = props->hasValue(PropNameTransform);
    _shouldSaveCanvas = _hasMatrix || _hasTransform;
  
    _matrixProp->onPropsSet(runtime, props);
    _originProp->onPropsSet(runtime, props);
  }
  
private:
  SkMatrix _transformMatrix;
  std::unique_ptr<JsiDomNodePointProp> _originProp;
  std::unique_ptr<JsiDomNodeProp> _matrixProp;
  std::shared_ptr<SkPaint> _paintCache;
  bool _shouldSaveCanvas;
  bool _hasTransform;
  bool _hasMatrix;
};

}
