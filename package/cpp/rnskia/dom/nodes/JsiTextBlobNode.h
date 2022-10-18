#pragma once

#include "JsiDomDrawingNode.h"

namespace RNSkia {

class JsiTextBlobNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiTextBlobNode> {
public:
  JsiTextBlobNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skTextBlob") {}
    
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
