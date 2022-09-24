
#pragma once

#include "JsiDomNode.h"
#include "JsiDrawingContext.h"
#include "TransformProcessor.h"
#include "PointProcessor.h"
#include "ContextProcessor.h"

namespace RNSkia {

static std::string PropNameMatrix = "matrix";
static std::string PropNameTransform = "transform";
static std::string PropNameOrigin = "origin";

class JsiDomRenderNode : public JsiDomNode {
public:
  JsiDomRenderNode(std::shared_ptr<RNSkPlatformContext> context,
                   jsi::Runtime &runtime,
                   const jsi::Value *arguments,
                   size_t count) :
  JsiDomNode(context, runtime, arguments, count) {}
  
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
    
    // Make sure we update any properties that were changed
    if (getHasPropChanges()) {
      onPropsChanged(getProperties());
    }
    
    // Update drawing context
    auto childContext = ContextProcessor::processContext(context, props);
    
    // Handle matrix/transforms
    bool shouldSave = props->hasValue(PropNameMatrix) || props->hasValue(PropNameTransform);
    auto hasOrigin = props->hasValue(PropNameOrigin);

    if (shouldSave) {
      auto matrix = props->hasValue(PropNameMatrix) ?
      *std::dynamic_pointer_cast<JsiSkMatrix>(props->getValue(PropNameMatrix)->getAsHostObject())->getObject() :
      _transformMatrix;
      
      context->getCanvas()->save();
      
      if (hasOrigin) {
        context->getCanvas()->translate(_origin.x(), _origin.y());
      }
      
      context->getCanvas()->concat(matrix);
      
      if (hasOrigin) {
        context->getCanvas()->translate(-_origin.x(), -_origin.y());
      }
    }
    
    // Render the node
    renderNode(childContext);
    
    if (shouldSave) {
      context->getCanvas()->restore();
    }    
  };
  
protected:
  /**
   Override to implement rendering where the current state of the drawing context is correctly set.
   */
  virtual void renderNode(std::shared_ptr<JsiBaseDrawingContext> context) = 0;
  
  virtual void onPropsChanged(std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomNode::onPropsChanged(props);
    
    if (props->hasValue(PropNameTransform) && readPropChangesAndClearFlag(PropNameTransform)) {
      _transformMatrix.setIdentity();
      TransformProcessor::processTransform(_transformMatrix, props->getValue(PropNameTransform));
    }
    
    if (props->hasValue(PropNameOrigin) && readPropChangesAndClearFlag(PropNameOrigin)) {
      _origin = PointProcessor::processPoint(props->getValue(PropNameOrigin));
    }
  }
  
  virtual void onPropsSet(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) override {
    JsiDomNode::onPropsSet(runtime, props);
    
    props->tryReadHostObjectProperty(runtime, PropNameMatrix);
    props->tryReadArrayProperty(runtime, PropNameTransform);
    try {
      props->tryReadObjectProperty(runtime, PropNameOrigin);
    } catch (...) {
      props->tryReadHostObjectProperty(runtime, PropNameOrigin);
    }
    
    props->tryReadStringProperty(runtime, PropNameColor);
    props->tryReadStringProperty(runtime, PropNameStyle);
    props->tryReadNumericProperty(runtime, PropNameStrokeWidth);
    props->tryReadNumericProperty(runtime, PropNameOpacity);
    
  }
  
private:
  SkMatrix _transformMatrix;
  SkPoint _origin;
};

}
