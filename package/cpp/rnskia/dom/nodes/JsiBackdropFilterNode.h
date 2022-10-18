#pragma once

#include "JsiDomDrawingNode.h"
#include "CircleProp.h"

namespace RNSkia {

class JsiBackdropFilterNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiBackdropFilterNode> {
public:
  JsiBackdropFilterNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skBackdropFilter") {}
    
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
