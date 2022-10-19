#pragma once

#include "JsiDomDrawingNode.h"
#include "TextBlobProp.h"

namespace RNSkia {

class JsiTextPathNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiTextPathNode> {
public:
  JsiTextPathNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skTextPath") {}
    
protected:
  void draw(DrawingContext* context) override {
    auto blob = _textBlobProp->getDerivedValue();
    context->getCanvas()->drawTextBlob(blob, 0, 0, *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _textBlobProp = container->defineProperty(std::make_shared<TextPathBlobProp>());
  }
private:
  TextPathBlobProp* _textBlobProp;
};

}
