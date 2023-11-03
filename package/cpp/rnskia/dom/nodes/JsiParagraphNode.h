#pragma once

#include "JsiDomDrawingNode.h"
#include "ParagraphProp.h"

#include <memory>

namespace RNSkia {

class JsiParagraphNode : public JsiDomDrawingNode,
                         public JsiDomNodeCtor<JsiParagraphNode> {
public:
  explicit JsiParagraphNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skParagraph") {}

protected:
  void draw(DrawingContext *context) override {
    auto x = _xProp->value().getAsNumber();
    auto y = _yProp->value().getAsNumber();
    auto width = _widthProp->value().getAsNumber();
    auto p = _paragraphProp->getDerivedValue();
    (*p)->layout(width);
    (*p)->paint(context->getCanvas(), x, y);
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
    _paragraphProp = container->defineProperty<ParagraphProp>("paragraph");
    _paragraphProp->require();

    _xProp = container->defineProperty<NodeProp>("x");
    _xProp->require();

    _yProp = container->defineProperty<NodeProp>("y");
    _yProp->require();

    _widthProp = container->defineProperty<NodeProp>("width");
    _widthProp->require();
  }

private:
  ParagraphProp *_paragraphProp;
  NodeProp *_xProp;
  NodeProp *_yProp;
  NodeProp *_widthProp;
};

} // namespace RNSkia
