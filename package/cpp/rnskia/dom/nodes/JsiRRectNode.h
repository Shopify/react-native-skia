#pragma once

#include "JsiDomDrawingNode.h"
#include "RRectProp.h"

namespace RNSkia {

class JsiRRectNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiRRectNode> {
public:
  JsiRRectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skRRect") {}
    
protected:  
  void draw(DrawingContext* context) override {
    context->getCanvas()->drawRRect(*_rrectProp->getDerivedValue(), *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    
    _rrectProp = container->defineProperty(std::make_shared<RRectProps>(PropNameRect));
    _rrectProp->require();
  }
  
private:
  RRectProps* _rrectProp;
};

}
