#pragma once

#include "JsiDomDrawingNode.h"
#include "RectProp.h"

namespace RNSkia {

class JsiRectNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiRectNode> {
public:
  JsiRectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skRect") {}
    
protected:
  void draw(DrawingContext* context) override {
    requirePropertyToBeSet(_rectProp);
    
    context->getCanvas()->drawRect(*_rectProp->getDerivedValue(), *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    
    _rectProp = container->defineProperty(std::make_shared<RectProps>(PropNameRect));
  }
  
private:
  RectProps* _rectProp;
};

}
