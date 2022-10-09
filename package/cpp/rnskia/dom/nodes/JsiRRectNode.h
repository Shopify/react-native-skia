#pragma once

#include "JsiDomDrawingNode.h"
#include "RRectProp.h"

namespace RNSkia {

class JsiRRectNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiRRectNode> {
public:
  JsiRRectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skRRect") {}
    
protected:  
  void draw(DrawingContext* context) override {
    if(!_rrectProp->hasValue()) {
      throw std::runtime_error("Expected Rounded Rect node to have a rrect property or \
                               x, y, width, height and radius properties.");
      return;
    }
    context->getCanvas()->drawRRect(*_rrectProp->getDerivedValue(), *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    
    _rrectProp = container->defineProperty(std::make_shared<RRectProps>(PropNameRect));
  }
  
private:
  RRectProps* _rrectProp;
};

}
