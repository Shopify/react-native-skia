#pragma once

#include "JsiDomDrawingNode.h"
#include "RectProp.h"

namespace RNSkia {

class JsiRectNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiRectNode> {
public:
  JsiRectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skRect") {}
    
protected:
  void draw(DrawingContext* context) override {
    if(!_rectProp->hasValue()) {
      throw std::runtime_error("Expected Rect node to have a rect property or \
                               x, y, width and height properties.");
      return;
    }
    context->getCanvas()->drawRect(*_rectProp->getDerivedValue(), *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    
    _rectProp = container->defineProperty(std::make_shared<RectProps>(PropNameRect));
  }
  
private:
  std::shared_ptr<RectProps> _rectProp;
};

}
