#pragma once

#include "JsiDomDrawingNode.h"
#include "PointProp.h"

namespace RNSkia {

static PropId PropNamePoint1 = JsiPropId::get("p1");
static PropId PropNamePoint2 = JsiPropId::get("p2");

class JsiLineNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiLineNode> {
public:
  JsiLineNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skLine") {}
    
protected:
  void draw(DrawingContext* context) override {
    context->getCanvas()->drawLine(_p1Prop->getDerivedValue()->x(),
                                   _p1Prop->getDerivedValue()->y(),
                                   _p2Prop->getDerivedValue()->x(),
                                   _p2Prop->getDerivedValue()->y(),
                                   *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _p1Prop = container->defineProperty(std::make_shared<PointProp>(PropNamePoint1));
    _p2Prop = container->defineProperty(std::make_shared<PointProp>(PropNamePoint2));
    
    _p1Prop->require();
    _p2Prop->require();
  }
  
private:
  PointProp* _p1Prop;
  PointProp* _p2Prop;
};

}

