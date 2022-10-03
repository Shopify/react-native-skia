#pragma once

#include "JsiDomDeclarationNode.h"
#include "PaintProp.h"
#include "JsiSkRect.h"

namespace RNSkia {

class JsiPaintNode :
public JsiDomDeclarationNode,
public JsiDomNodeCtor<JsiPaintNode> {
public:
  JsiPaintNode(std::shared_ptr <RNSkPlatformContext> context) :
    JsiDomDeclarationNode(context, "skPaint") {
    _paintProp = addProperty(std::make_shared<PaintProp>());
    _opacityProp = addProperty(std::make_shared<JsiProp>(PropNameOpacity, PropType::Number));
  }
  
  void materializeNode(JsiDrawingContext* context) override {
    // Since the paint props uses parent paint, we need to set it before we call onPropsChanged
    _paintProp->setParentPaint(context->getPaint());
    JsiDomDeclarationNode::materializeNode(context);
  }
  
protected:
  void materialize(JsiDrawingContext* context) override {
    if (_paintProp->getDerivedValue() != nullptr) {
      context->setPaint(_paintProp->getDerivedValue());
    }
  }
  
private:
  std::shared_ptr <SkRect> _rect;
  std::shared_ptr<PaintProp> _paintProp;
  std::shared_ptr<JsiProp> _opacityProp;
};

}
