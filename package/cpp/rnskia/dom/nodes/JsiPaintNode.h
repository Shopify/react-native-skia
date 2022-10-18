#pragma once

#include "JsiDomDeclarationNode.h"
#include "PaintProps.h"

namespace RNSkia {

// TODO: implement feature: A paint node has its own paint not inherited,
//       and when found the drawing node should render an extra time for
//       each paint node in its children.

class JsiPaintNode :
public JsiBaseDomDeclarationNode,
public JsiDomNodeCtor<JsiPaintNode> {
public:
  JsiPaintNode(std::shared_ptr <RNSkPlatformContext> context) :
    JsiBaseDomDeclarationNode(context, "skPaint") {}

protected:
  /**
   Called when rendering the tree to create all derived values from all nodes.
   */
  virtual void materializeNode(DrawingContext* context) override {
    
    auto container = getPropsContainer();
    if (container != nullptr) {
      // Make sure we commit any waiting transactions in the props object
      container->updatePendingValues(context, getType());
    }
    
    // A paint node should have its own local paint
    if (_localContext == nullptr) {
      _localContext = context->inheritContext("PaintNode");
    }
    
    if (_localContext->isInvalid()) {
      _localContext->setMutablePaint(std::make_shared<SkPaint>());
    }
    
    // Materialize children who will now only change the paint node's paint
    for (auto &child: getChildren()) {
      auto decl = std::dynamic_pointer_cast<JsiBaseDomDeclarationNode>(child);
      if (decl != nullptr) {
        decl->materializeNode(_localContext.get());
      }
    }

    // end the "visit" of the declaration node
    if (container != nullptr) {
      container->markAsResolved();
    }
  }
  
  void materialize(DrawingContext* context) override {}
  
  void defineProperties(NodePropsContainer* container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);
    
    container->defineProperty(std::make_shared<PaintProps>());
    _opacityProp = container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
  }
  
private:
  NodeProp* _opacityProp;
  std::shared_ptr<DrawingContext> _localContext;
};

}
