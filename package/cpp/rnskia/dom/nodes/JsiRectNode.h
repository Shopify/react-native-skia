#pragma once

#include "JsiDomDrawingNode.h"
#include "RectProp.h"

namespace RNSkia {

class JsiRectNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiRectNode> {
public:
  JsiRectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skRect") {
    _rectProp = addProperty(std::make_shared<RectProps>(PropNameRect));
  }
    
protected:
  void draw(JsiBaseDrawingContext* context) override {
    if(!_rectProp->hasValue()) {
      throw std::runtime_error("Expected Rect node to have a rect property or \
                               x, y, width and height properties.");
    }
    context->getCanvas()->drawRect(_rectProp->getDerivedValue(), *context->getPaint());
  }
  
private:
  std::shared_ptr<RectProps> _rectProp;
};

}
