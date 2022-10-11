#pragma once

#include "JsiDomDeclarationNode.h"
#include "PaintProps.h"

namespace RNSkia {

class JsiPaintNode :
public JsiDomDeclarationNode,
public JsiDomNodeCtor<JsiPaintNode> {
public:
  JsiPaintNode(std::shared_ptr <RNSkPlatformContext> context) :
    JsiDomDeclarationNode(context, "skPaint") {}
  
  void materializeNode(DrawingContext* context) override {
    JsiDomDeclarationNode::materializeNode(context);
  }
  
protected:
  void materialize(DrawingContext* context) override {
    /* Paint props are materializing itself */
    
    if (_opacityProp->isSet() && (_opacityProp->isChanged() || context->isInvalid())) {
      context->setOpacity(_opacityProp->value()->getAsNumber());
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDeclarationNode::defineProperties(container);
    
    container->defineProperty(std::make_shared<PaintProps>());
    _opacityProp = container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
  }
  
private:
  NodeProp* _opacityProp;
};

}
