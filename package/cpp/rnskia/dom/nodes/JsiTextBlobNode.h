#pragma once

#include "JsiDomDrawingNode.h"

#include "TextBlobProp.h"

namespace RNSkia {

class JsiTextBlobNode : public JsiDomDrawingNode,
                        public JsiDomNodeCtor<JsiTextBlobNode> {
public:
  JsiTextBlobNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skTextBlob") {}

protected:
  void draw(DrawingContext *context) override {
    auto blob = _textBlobProp->getDerivedValue();
    auto x = _xProp->value()->getAsNumber();
    auto y = _yProp->value()->getAsNumber();

    context->getCanvas()->drawTextBlob(blob, x, y, *context->getPaint());
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);

    _textBlobProp = container->defineProperty(
        std::make_shared<TextBlobProp>(JsiPropId::get("blob")));
    _xProp = container->defineProperty(
        std::make_shared<NodeProp>(JsiPropId::get("x")));
    _yProp = container->defineProperty(
        std::make_shared<NodeProp>(JsiPropId::get("y")));

    _textBlobProp->require();
    _xProp->require();
    _yProp->require();
  }

private:
  TextBlobProp *_textBlobProp;
  NodeProp *_xProp;
  NodeProp *_yProp;
};

} // namespace RNSkia
