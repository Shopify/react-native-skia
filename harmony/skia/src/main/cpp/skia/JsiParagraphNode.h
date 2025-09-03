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
    auto width = static_cast<SkScalar>(_widthProp->value().getAsNumber());

    auto p = *_paragraphProp->getDerivedValue();
    if (p != nullptr) {

      // Let's ensure that we don't perform unnecessary layouts on the
      // paragraph. We should only layout if we have a new paragraph or if the
      // layout width has changed.
      if (_lastLayoutWidth != width || _lastLayoutParagraph != p) {
        // perform layout!
        p->layout(width);
        _lastLayoutWidth = width;
        _lastLayoutParagraph = p;
      }
      // Paint the layout to the canvas
      p->paint(context->getCanvas(), x, y);
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
    _paragraphProp = container->defineProperty<ParagraphProp>("paragraph");

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
  SkScalar _lastLayoutWidth;
  para::Paragraph *_lastLayoutParagraph = nullptr;
};

} // namespace RNSkia
