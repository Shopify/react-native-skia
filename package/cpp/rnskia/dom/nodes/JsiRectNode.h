#pragma once

#include "JsiDomDrawingNode.h"
#include "RectProp.h"

namespace RNSkia {

class JsiRectNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiRectNode> {
public:
  JsiRectNode(std::shared_ptr<RNSkPlatformContext> context,
              jsi::Runtime &runtime,
              const jsi::Value *arguments,
              size_t count) :
  JsiDomDrawingNode(context, runtime, arguments, count, "skRect"),
  _rectProp(std::make_unique<RectProps>(PropNameRect)) {}
    
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
  
  void draw(JsiBaseDrawingContext* context) override {
    context->getCanvas()->drawRect(_rectProp->getDerivedValue(), *context->getPaint());
  }
  
private:
  std::unique_ptr<RectProps> _rectProp;
};

}
