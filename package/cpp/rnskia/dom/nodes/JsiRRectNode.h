#pragma once

#include "JsiDomDrawingNode.h"
#include "RRectProp.h"

namespace RNSkia {

static const char* RRectNodeName = "skRRect";

static PropId PropNameRadius = "r";

class JsiRRectNode : public JsiDomDrawingNode {
public:
  JsiRRectNode(std::shared_ptr<RNSkPlatformContext> context,
              jsi::Runtime &runtime,
              const jsi::Value *arguments,
              size_t count) :
  JsiDomDrawingNode(context, runtime, arguments, count),
  _rrectProp(std::make_unique<RRectProps>(PropNameRect)) {}
  
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto node = std::make_shared<JsiRRectNode>(context, runtime, arguments, count);
      return jsi::Object::createFromHostObject(runtime, std::move(node));
    };
  }
  
  const char *getType() override { return RRectNodeName; }
    
protected:
  void onPropsChanged(JsiDomNodeProps* props) override {
    JsiDomDrawingNode::onPropsChanged(props);
    _rrectProp->updatePropValues(props);
    if(!_rrectProp->hasValue()) {
      throw std::runtime_error("Expected Rect node to have a rect property or \
                               x, y, width and height properties.");
    }
  }
  
  void onPropsSet(jsi::Runtime &runtime, JsiDomNodeProps* props) override {
    JsiDomDrawingNode::onPropsSet(runtime, props);
    _rrectProp->setProps(runtime, props);
  }
  
  void draw(JsiBaseDrawingContext* context) override {
    context->getCanvas()->drawRRect(_rrectProp->getDerivedValue(), *context->getPaint());
  }
  
private:
  std::unique_ptr<RRectProps> _rrectProp;
};

}
