#pragma once

#include "JsiDomDrawingNode.h"

namespace RNSkia {

class JsiTextNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiTextNode> {
public:
  JsiTextNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skText") {}
    
protected:
  void draw(DrawingContext* context) override {
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
  }
private:
};

}
