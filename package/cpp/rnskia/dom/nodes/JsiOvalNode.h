#pragma once

#include "JsiDomDrawingNode.h"
#include "RectProp.h"

namespace RNSkia {

class JsiOvalNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiOvalNode> {
public:
  JsiOvalNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skOval") {}
    
protected:
  void draw(DrawingContext* context) override {
    if(!_rectProp->isSet()) {
      throw std::runtime_error("Expected Oval node to have a rect property or \
                               x, y, width and height properties.");
      return;
    }
    context->getCanvas()->drawOval(*_rectProp->getDerivedValue(), *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _rectProp = container->defineProperty(std::make_shared<RectProps>(PropNameRect));
  }
  
private:
  RectProps* _rectProp;
};

}
