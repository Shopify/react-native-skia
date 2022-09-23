#pragma once

#include "JsiDomDrawingNode.h"

#include "JsiSkRect.h"

namespace RNSkia {

class JsiRectNode: public JsiDomDrawingNode {
public:
  JsiRectNode(std::shared_ptr<RNSkPlatformContext> context,
              jsi::Runtime& runtime,
              const jsi::Value *arguments,
              size_t count):
  JsiDomDrawingNode(context, runtime, arguments, count) {}
  
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto rectNode = std::make_shared<JsiRectNode>(context, runtime, arguments, count);
      return jsi::Object::createFromHostObject(runtime, std::move(rectNode));
    };
  }
  
  static SkRect processRect(std::shared_ptr<JsiDomNodeProps> props) {
    if (props->hasValue("rect")) {
      return props->processRect(props->getValue("rect"));
    } else {
      return props->processRect();      
    }
  }
  
protected:
  void onPropsRead(jsi::Runtime &runtime) override {
    JsiDomDrawingNode::onPropsRead(runtime);
    try {
      getProperties()->tryReadObjectProperty(runtime, "rect");
    } catch(...) {
      getProperties()->tryReadHostObjectProperty(runtime, "rect");
    }
    getProperties()->tryReadNumericProperty(runtime, "x");
    getProperties()->tryReadNumericProperty(runtime, "y");
    getProperties()->tryReadNumericProperty(runtime, "width");
    getProperties()->tryReadNumericProperty(runtime, "height");
  }
  
  void draw(std::shared_ptr<JsiBaseDrawingContext> context) override {
    if(getProperties()->getIsDirty()) {
      _rect = processRect(getProperties());      
    }
    context->getCanvas()->drawRect(_rect, *context->getPaint());
  }
  
  // FIXME: Add to enum and sync with JS somehow?
  const char* getType() override { return "skRect"; }

private:
  SkRect _rect;
};

}
