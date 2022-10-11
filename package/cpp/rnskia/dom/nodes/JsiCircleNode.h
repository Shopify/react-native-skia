#pragma once

#include "JsiDomDrawingNode.h"
#include "CircleProp.h"

namespace RNSkia {

class JsiCircleNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiCircleNode> {
public:
  JsiCircleNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skCircle") {}
    
protected:
  void draw(DrawingContext* context) override {
    if (!_circleProp->isSet() || !_r->isSet()) {
      throw std::runtime_error("Expected circle node to have a cx, cy or c \
                               and r properties.");
      return;
    }
    context->getCanvas()->drawCircle(*_circleProp->getDerivedValue(),
                                     _r->value()->getAsNumber(),
                                     *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _circleProp = container->defineProperty(std::make_shared<CircleProp>());
    _r = container->defineProperty(std::make_shared<NodeProp>(PropNameR));
  }
  
private:
  CircleProp* _circleProp;
  NodeProp* _r;
};

}
