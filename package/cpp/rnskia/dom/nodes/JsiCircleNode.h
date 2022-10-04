#pragma once

#include "JsiDomDrawingNode.h"
#include "CircleProp.h"

namespace RNSkia {

class JsiCircleNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiCircleNode> {
public:
  JsiCircleNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skCircle") {
    _prop = addProperty(std::make_shared<CircleProp>());
    _r = addProperty(std::make_shared<NodeProp>(PropNameR, PropType::Number));
  }
    
protected:
  void draw(JsiDrawingContext* context) override {
    if (!_prop->hasValue() || !_r->hasValue()) {
      getContext()->raiseError(std::runtime_error("Expected circle node to have a cx, cy or c \
                                                  and r properties."));
    }
    auto paint = *context->getPaint();
    context->getCanvas()->drawCircle(_prop->getDerivedValue(),
                                     _r->getPropValue()->getAsNumber(),
                                     paint);
  }
  
private:
  std::shared_ptr<CircleProp> _prop;
  std::shared_ptr<NodeProp> _r;
};

}
