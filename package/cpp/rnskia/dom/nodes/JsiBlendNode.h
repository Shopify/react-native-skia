#pragma once

#include "JsiDomDeclarationNode.h"

namespace RNSkia {

class JsiBlendNode : public JsiBaseDomDeclarationNode, public JsiDomNodeCtor<JsiBlendNode> {
public:
  JsiBlendNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseDomDeclarationNode(context, "skBlend") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (context->isInvalid() || getPropsContainer()->isChanged()) {
      // TODO: Implement
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
  }
private:
};

}
