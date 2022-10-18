#pragma once

#include "JsiDomDrawingNode.h"

namespace RNSkia {

class JsiGlyphsNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiGlyphsNode> {
public:
  JsiGlyphsNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skGlyphs") {}
    
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
