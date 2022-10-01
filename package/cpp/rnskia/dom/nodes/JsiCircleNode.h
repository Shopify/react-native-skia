#pragma once

#include "JsiDomDrawingNode.h"
#include "CircleProp.h"

namespace RNSkia {

class JsiCircleNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiCircleNode> {
public:
  JsiCircleNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skCircle") {
    _prop = addProperty(std::make_shared<CircleProp>());
    _r = addProperty(std::make_shared<JsiProp>(PropNameR, PropType::Number));
  }
    
protected:
  void draw(JsiBaseDrawingContext* context) override {
    if (!_prop->hasValue() || !_r->hasValue()) {
      getContext()->raiseError(std::runtime_error("Expected circle node to have a cx, cy or c \
                                                  and r properties."));
    }
    
    context->getCanvas()->drawCircle(_prop->getDerivedValue(),
                                     _r->getPropValue()->getAsNumber(),
                                     *context->getPaint());    
  }
  
private:
  std::shared_ptr<CircleProp> _prop;
  std::shared_ptr<JsiProp> _r;
};

}
