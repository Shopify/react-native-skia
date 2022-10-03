#pragma once

#include "JsiDomDrawingNode.h"
#include "RectProp.h"

namespace RNSkia {

class JsiFillNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiFillNode> {
public:
  JsiFillNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skFill") {}
    
protected:
  void draw(JsiDrawingContext* context) override {
    context->getCanvas()->drawPaint(*context->getPaint());
  }
  
private:
  std::shared_ptr<RectProps> _rectProp;
};

}
