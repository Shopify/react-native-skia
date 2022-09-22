#pragma once

#include "JsiDomDrawingNode.h"
#include "jsi.h"

#include "JsiSkRect.h"

namespace RNSkia {

class JsiRectNode: public JsiDomDrawingNode {
public:
  JsiRectNode(std::shared_ptr<RNSkPlatformContext> context,
              jsi::Runtime& runtime,
              const jsi::Value *arguments,
              size_t count):
  JsiDomDrawingNode(context, runtime, arguments, count) {
    setProps(runtime, getArgumentAsObject(runtime, arguments, count, 0));
  }
  
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto rectNode = std::make_shared<JsiRectNode>(context, runtime, arguments, count);
      return jsi::Object::createFromHostObject(runtime, std::move(rectNode));
    };
  }
  
  static SkRect processRect(std::shared_ptr<JsiDomNodeProps> props) {
    SkRect rect;
    if (props->hasValue("rect")) {
      auto rectProp = props->getValue("rect");
      if(rectProp.getType() == JsiValue::PropType::HostObject) {
        rect = *std::dynamic_pointer_cast<JsiSkRect>(rectProp.getAsHostObject())->getObject();
      } else {
        rect = SkRect::MakeXYWH(rectProp.getValue("x").getAsNumber(),
                                rectProp.getValue("y").getAsNumber(),
                                rectProp.getValue("width").getAsNumber(),
                                rectProp.getValue("height").getAsNumber());
      }
    } else {
        rect = SkRect::MakeXYWH(props->getValue("x").getAsNumber(),
                                props->getValue("y").getAsNumber(),
                                props->getValue("width").getAsNumber(),
                                props->getValue("height").getAsNumber());
    }
    return rect;
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
      getProperties()->markClean();
    }
    context->getCanvas()->drawRect(_rect, *context->getPaint());
  }
  
  // FIXME: Add to enum and sync with JS somehow?
  const char* getType() override { return "skRect"; }

private:
  SkRect _rect;
};

}
