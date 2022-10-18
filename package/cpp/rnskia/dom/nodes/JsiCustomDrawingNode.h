#pragma once

#include "JsiDomDrawingNode.h"

namespace RNSkia {

class JsiCustomDrawingNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiCustomDrawingNode> {
public:
  JsiCustomDrawingNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skCustomDrawing") {}
    
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
