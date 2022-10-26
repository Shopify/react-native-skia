#pragma once

#include "JsiDomDeclarationNode.h"
#include "BoxShadowProps.h"

namespace RNSkia {

class JsiBoxShadowNode : public JsiBaseDomDeclarationNode, public JsiDomNodeCtor<JsiBoxShadowNode> {
public:
  JsiBoxShadowNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiBaseDomDeclarationNode(context, "skBoxShadow") {}
  
  BoxShadowProps* getBoxShadowProps() {
    return _boxShadowProps;
  }
  
protected:
  void materialize(DrawingContext* context) override {
    // Do nothing, we are just a container for properties
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    _boxShadowProps = container->defineProperty(std::make_shared<BoxShadowProps>());
    
  }
private:
  BoxShadowProps* _boxShadowProps;
};

}
