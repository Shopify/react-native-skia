#pragma once

#include "JsiDomDeclarationNode.h"

namespace RNSkia {

class JsiBoxShadowNode : public JsiBaseDomDeclarationNode, public JsiDomNodeCtor<JsiBoxShadowNode> {
public:
  JsiBoxShadowNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseDomDeclarationNode(context, "skBoxShadow") {}
    
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
