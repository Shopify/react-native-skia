#pragma once

#include "JsiDomDrawingNode.h"
#include "RRectProp.h"

namespace RNSkia {

static PropId PropNameInner = JsiPropId::get("inner");
static PropId PropNameOuter = JsiPropId::get("outer");

class JsiDiffRectNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiDiffRectNode> {
public:
  JsiDiffRectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skDiffRect") {}
protected:
  void draw(DrawingContext* context) override {
    requirePropertyToBeSet(_innerRectProp);
    requirePropertyToBeSet(_outerRectProp);
    
    auto inner = _innerRectProp->getDerivedValue();
    auto outer = _outerRectProp->getDerivedValue();
    
    context->getCanvas()->drawDRRect(*outer, *inner, *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _innerRectProp = container->defineProperty(std::make_shared<RRectProp>(PropNameInner));
    _outerRectProp = container->defineProperty(std::make_shared<RRectProp>(PropNameOuter));
  }
private:
  RRectProp* _innerRectProp;
  RRectProp* _outerRectProp;
};

}
