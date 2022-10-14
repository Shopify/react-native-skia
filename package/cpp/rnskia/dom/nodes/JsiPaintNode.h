#pragma once

#include "JsiDomDeclarationNode.h"
#include "PaintProps.h"

namespace RNSkia {

// TODO: implement feature: A paint node has its own paint not inherited,
//       and when found the drawing node should render an extra time for
//       each paint node in its children.

class JsiPaintNode :
public JsiBaseDomDeclarationNode,
public JsiDomNodeCtor<JsiPaintNode> {
public:
  JsiPaintNode(std::shared_ptr <RNSkPlatformContext> context) :
    JsiBaseDomDeclarationNode(context, "skPaint") {}

protected:
  void materialize(DrawingContext* context) override {
    /* Paint props are materializing itself */
    
    if (_opacityProp->isSet() && (_opacityProp->isChanged() || context->isInvalid())) {
      context->setOpacity(_opacityProp->value()->getAsNumber());
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    
    container->defineProperty(std::make_shared<PaintProps>());
    _opacityProp = container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
  }
  
private:
  NodeProp* _opacityProp;
};

}
