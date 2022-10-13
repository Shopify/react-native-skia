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
    context->getCanvas()->drawCircle(*_circleProp->getDerivedValue(),
                                     _radiusProp->value()->getAsNumber(),
                                     *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _circleProp = container->defineProperty(std::make_shared<CircleProp>());
    _radiusProp = container->defineProperty(std::make_shared<NodeProp>(PropNameR));
    
    _circleProp->require();
    _radiusProp->require();
  }
  
private:
  CircleProp* _circleProp;
  NodeProp* _radiusProp;
};

}
