#pragma once

#include "JsiDomDeclarationNode.h"

namespace RNSkia {

class JsiBoxNode : public JsiBaseDomDeclarationNode, public JsiDomNodeCtor<JsiBoxNode> {
public:
  JsiBoxNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseDomDeclarationNode(context, "skBox") {}
    
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
