#pragma once

#include "JsiDomDrawingNode.h"

#include "FontProp.h"

namespace RNSkia {

class JsiTextNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiTextNode> {
public:
  JsiTextNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skText") {}
    
protected:
  void draw(DrawingContext* context) override {
    auto text = _textProp->value()->getAsString().c_str();
    auto x = _xProp->value()->getAsNumber();
    auto y = _yProp->value()->getAsNumber();
    auto font = _fontProp->getDerivedValue();
    
    context->getCanvas()->drawSimpleText(text, strlen(text), SkTextEncoding::kUTF8, x, y,
                                         *font, *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    
    _fontProp = container->defineProperty(std::make_shared<FontProp>(JsiPropId::get("font")));
    _textProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("text")));
    _xProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("x")));
    _yProp = container->defineProperty(std::make_shared<NodeProp>(JsiPropId::get("y")));
    
    _fontProp->require();
    _textProp->require();
    _xProp->require();
    _yProp->require();
  }
private:
  FontProp* _fontProp;
  NodeProp* _textProp;
  NodeProp* _xProp;
  NodeProp* _yProp;
};

}
