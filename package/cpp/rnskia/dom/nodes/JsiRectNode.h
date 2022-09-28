#pragma once

#include "JsiDomDrawingNode.h"
#include "RectProp.h"

namespace RNSkia {

static const char* RectNodeName = "skRect";

class JsiRectNode : public JsiDomDrawingNode {
public:
  JsiRectNode(std::shared_ptr<RNSkPlatformContext> context,
              jsi::Runtime &runtime,
              const jsi::Value *arguments,
              size_t count) :
  JsiDomDrawingNode(context, runtime, arguments, count),
  _rectProp(std::make_unique<JsiDomNodeRectProps>(PropNameRect)) {}
  
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto node = std::make_shared<JsiRectNode>(context, runtime, arguments, count);
      return jsi::Object::createFromHostObject(runtime, std::move(node));
    };
  }
    
protected:
  void onPropsChanged(JsiDomNodeProps* props) override {
    JsiDomDrawingNode::onPropsChanged(props);
    _rectProp->updatePropValues(props);
    if(!_rectProp->hasValue()) {
      throw std::runtime_error("Expected Rect node to have a rect property or \
                               x, y, width and height properties.");
    }
  }
  
  void onPropsSet(jsi::Runtime &runtime, JsiDomNodeProps* props) override {
    JsiDomDrawingNode::onPropsSet(runtime, props);
    _rectProp->setProps(runtime, props);
  }
  
  void draw(std::shared_ptr<JsiBaseDrawingContext> context) override {
    context->getCanvas()->drawRect(_rectProp->getDerivedValue(), *context->getPaint());
  }
  
  const char *getType() override { return RectNodeName; }
  
private:
  std::unique_ptr<JsiDomNodeRectProps> _rectProp;
};

}
