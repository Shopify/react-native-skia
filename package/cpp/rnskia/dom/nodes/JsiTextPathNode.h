#pragma once

#include "JsiDomDrawingNode.h"

namespace RNSkia {

class JsiTextPathNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiTextPathNode> {
public:
  JsiTextPathNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skTextPath") {}
    
protected:
  void draw(DrawingContext* context) override {
    // TODO: Implement
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
  }
private:
};

}
