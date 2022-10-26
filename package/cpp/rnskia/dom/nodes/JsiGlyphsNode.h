#pragma once

#include "JsiDomDrawingNode.h"

#include "FontProp.h"
#include "GlyphsProp.h"

namespace RNSkia {

class JsiGlyphsNode : public JsiDomDrawingNode,
                      public JsiDomNodeCtor<JsiGlyphsNode> {
public:
  JsiGlyphsNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skGlyphs") {}

protected:
  void draw(DrawingContext *context) override {
    auto x = _xProp->value()->getAsNumber();
    auto y = _yProp->value()->getAsNumber();
    auto font = _fontProp->getDerivedValue();
    auto glyphInfo = _glyphsProp->getDerivedValue();

    context->getCanvas()->drawGlyphs(
        static_cast<int>(glyphInfo->glyphIds.size()),
        glyphInfo->glyphIds.data(), glyphInfo->positions.data(),
        SkPoint::Make(x, y), *font, *context->getPaint());
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);

    _fontProp = container->defineProperty(
        std::make_shared<FontProp>(JsiPropId::get("font")));
    _glyphsProp = container->defineProperty(
        std::make_shared<GlyphsProp>(JsiPropId::get("glyphs")));
    _xProp = container->defineProperty(
        std::make_shared<NodeProp>(JsiPropId::get("x")));
    _yProp = container->defineProperty(
        std::make_shared<NodeProp>(JsiPropId::get("y")));

    _fontProp->require();
    _glyphsProp->require();
    _xProp->require();
    _yProp->require();
  }

private:
  FontProp *_fontProp;
  GlyphsProp *_glyphsProp;
  NodeProp *_xProp;
  NodeProp *_yProp;
};

} // namespace RNSkia
