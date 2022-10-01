#pragma once

#include "JsiDomDrawingNode.h"
#include "RRectProp.h"

namespace RNSkia {

class JsiRRectNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiRRectNode> {
public:
  JsiRRectNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skRRect") {
    _rrectProp = addProperty(std::make_shared<RRectProps>(PropNameRect));
  }
    
protected:  
  void draw(JsiBaseDrawingContext* context) override {
    if(!_rrectProp->hasValue()) {
      getContext()->raiseError(std::runtime_error("Expected Rounded Rect node to have a rrect property or \
                                                  x, y, width, height and radius properties."));
    }
    context->getCanvas()->drawRRect(_rrectProp->getDerivedValue(), *context->getPaint());
  }
  
private:
  std::shared_ptr<RRectProps> _rrectProp;
};

}
