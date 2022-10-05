#pragma once

#include "JsiDomDeclarationNode.h"
#include "PaintProp.h"

namespace RNSkia {

class JsiPaintNode :
public JsiDomDeclarationNode,
public JsiDomNodeCtor<JsiPaintNode> {
public:
  JsiPaintNode(std::shared_ptr <RNSkPlatformContext> context) :
    JsiDomDeclarationNode(context, "skPaint") {}
  
  void materializeNode(JsiDrawingContext* context) override {
    JsiDomDeclarationNode::materializeNode(context);
  }
  
protected:
  void materialize(JsiDrawingContext* context) override {
    if (_paintProp->getDerivedValue() != nullptr) {
      context->setPaint(_paintProp->getDerivedValue());
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDeclarationNode::defineProperties(container);
    
    _paintProp = container->defineProperty(std::make_shared<PaintProp>());
    _opacityProp = container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
  }
  
private:
  std::shared_ptr<PaintProp> _paintProp;
  std::shared_ptr<NodeProp> _opacityProp;
};

}
