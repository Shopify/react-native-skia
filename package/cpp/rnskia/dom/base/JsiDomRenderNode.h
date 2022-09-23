
#pragma once

#include "JsiDomNode.h"
#include "JsiDrawingContext.h"

namespace RNSkia {

class JsiDomRenderNode: public JsiDomNode {
public:
  JsiDomRenderNode(std::shared_ptr<RNSkPlatformContext> context,
                   jsi::Runtime& runtime,
                   const jsi::Value *arguments,
                   size_t count):
  JsiDomNode(context, runtime, arguments, count) {}
  
  JSI_HOST_FUNCTION(render) {
    // Get drawing context
    render(std::make_shared<JsiDrawingContextWrapper>(runtime, arguments, count));
    return jsi::Value::undefined();
  }
    
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, setProp),
                       JSI_EXPORT_FUNC(JsiDomNode, addChild),
                       JSI_EXPORT_FUNC(JsiDomNode, removeChild),
                       JSI_EXPORT_FUNC(JsiDomNode, insertChildBefore),
                       JSI_EXPORT_FUNC(JsiDomNode, setProps),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose),
                       JSI_EXPORT_FUNC(JsiDomNode, isNative),
                       JSI_EXPORT_FUNC(JsiDomNode, children),
                       JSI_EXPORT_FUNC(JsiDomRenderNode, render))
  
  void render(std::shared_ptr<JsiBaseDrawingContext> context) {
    auto props = getProperties();
    if(props == nullptr) {
      // A node might not have properties - then we should just render the node
      renderNode(context);
      return;
    }
    
    // FIXME: Add support for transform prop
    bool shouldSave = props->hasValue("matrix");
    
    // FIXME: Maybe we don't need to calculate this on every render?
    if(shouldSave) {
      context->getCanvas()->save();
      
      auto matrix = std::dynamic_pointer_cast<JsiSkMatrix>(props->getValue("matrix").getAsHostObject())->getObject();
      
      auto hasOrigin = props->hasValue("origin");
      
      if(hasOrigin) {
        auto origin = props->getValue("origin");
        context->getCanvas()->translate(origin.getValue("x").getAsNumber(),
                                        origin.getValue("y").getAsNumber());
      }
      
      context->getCanvas()->concat(*matrix);
      
      if(hasOrigin) {
        auto origin = props->getValue("origin");
        context->getCanvas()->translate(-origin.getValue("x").getAsNumber(),
                                        -origin.getValue("y").getAsNumber());
      }
    }
      
    renderNode(context);
      
    if(shouldSave) {
      context->getCanvas()->restore();
    }
  };
  
protected:
  void onPropsRead(jsi::Runtime &runtime) override {
    
    getProperties()->tryReadHostObjectProperty(runtime, "matrix");
    getProperties()->tryReadObjectProperty(runtime, "origin");
  }
  
  virtual void renderNode(std::shared_ptr<JsiBaseDrawingContext> context) = 0;
  
};

}
