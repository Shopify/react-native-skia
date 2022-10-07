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
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDeclarationNode::defineProperties(container);
    
    _paintProp = container->defineProperty(std::make_shared<PaintProps>());
    _opacityProp = container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
  }
  
private:
  std::shared_ptr<PaintProps> _paintProp;
  std::shared_ptr<NodeProp> _opacityProp;
};

}
