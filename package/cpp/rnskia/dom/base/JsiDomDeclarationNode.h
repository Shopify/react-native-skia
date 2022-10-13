
#pragma once

#include "JsiDomNode.h"
#include "DrawingContext.h"

namespace RNSkia {

class JsiDomDeclarationNode: public JsiDomNode {
public:
  JsiDomDeclarationNode(std::shared_ptr <RNSkPlatformContext> context, const char* type) :
  JsiDomNode(context, type) {}
  
  JSI_PROPERTY_GET(declarationType) {
    return jsi::String::createFromUtf8(runtime, std::string(getType()));
  }
  
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiDomDeclarationNode, declarationType),
                              JSI_EXPORT_PROP_GET(JsiDomNode, type))
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, addChild),
                       JSI_EXPORT_FUNC(JsiDomNode, removeChild),
                       JSI_EXPORT_FUNC(JsiDomNode, insertChildBefore),
                       JSI_EXPORT_FUNC(JsiDomNode, setProps),
                       JSI_EXPORT_FUNC(JsiDomNode, setProp),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose),
                       JSI_EXPORT_FUNC(JsiDomNode, children))

  /**
   Called when rendering the tree to create all derived values from all nodes.
   */
  virtual void materializeNode(DrawingContext* context) {
    
    auto container = getPropsContainer();
    if (container != nullptr) {
      // Make sure we commit any waiting transactions in the props object
      container->beginVisit(context);
    }
    
    // Materialize children
    for (auto &child: getChildren()) {
      auto decl = std::dynamic_pointer_cast<JsiDomDeclarationNode>(child);
      if (decl != nullptr) {
        decl->materializeNode(context);
      }
    }
    
    // Now we are ready to materialize
    materialize(context);

    // end the "visit" of the declaration node
    if (container != nullptr) {
      container->endVisit();
    }
  }
    
protected:
  /**
   Override to implement materialization
   */
  virtual void materialize(DrawingContext* context) = 0;
  
  /**
   Validates that only declaration nodes can be children
   */
  virtual void addChild(std::shared_ptr<JsiDomNode> child) override {
    if ( std::dynamic_pointer_cast<JsiDomDeclarationNode>(child) == nullptr) {
      getContext()->raiseError(std::runtime_error("Cannot add a child of type \"" +
                                                  std::string(child->getType()) +
                                                  "\" to a \"" + std::string(getType()) + "\"."));
    }
    JsiDomNode::addChild(child);
  }
  
  /**
   Validates that only declaration nodes can be children
   */
  virtual void
  insertChildBefore(std::shared_ptr<JsiDomNode> child, std::shared_ptr<JsiDomNode> before) override {
    if (std::dynamic_pointer_cast<JsiDomDeclarationNode>(child) == nullptr) {
      getContext()->raiseError(std::runtime_error("Cannot add a child of type \"" +
                                                  std::string(child->getType()) +
                                                  "\" to a \"" + std::string(getType()) + "\"."));
    }
    JsiDomNode::insertChildBefore(child, before);
  }  
};

}
