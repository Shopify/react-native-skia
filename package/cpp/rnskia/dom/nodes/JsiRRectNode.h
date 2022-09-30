#pragma once

#include "JsiDomDrawingNode.h"
#include "RRectProp.h"

namespace RNSkia {

static PropId PropNameRadius = "r";

class JsiRRectNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiRRectNode> {
public:
  JsiRRectNode(std::shared_ptr<RNSkPlatformContext> context,
              jsi::Runtime &runtime,
              const jsi::Value *arguments,
              size_t count) :
  JsiDomDrawingNode(context, runtime, arguments, count, "skRRect"),
  _rrectProp(std::make_unique<RRectProps>(PropNameRect)) {}
    
protected:
  void onPropsChanged(JsiDomNodeProps* props) override {
    JsiDomDrawingNode::onPropsChanged(props);
    _rrectProp->updatePropValues(props);
    if(!_rrectProp->hasValue()) {
      throw std::runtime_error("Expected Rounded Rect node to have a rrect property or \
                               x, y, width, height and radius properties.");
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
