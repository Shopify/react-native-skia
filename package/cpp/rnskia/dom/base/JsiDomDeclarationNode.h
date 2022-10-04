
#pragma once

#include "JsiDomNode.h"
#include "JsiDrawingContext.h"

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
  virtual void materializeNode(JsiDrawingContext* context) {
    auto props = getProperties();
    if (props != nullptr) {
      
      // Make sure we commit any waiting transactions in the props object
      props->commitDeferredPropertyChanges();
      
      // Make sure we update any properties that were changed in sub classes so that
      // they can update any derived values
      if (props->getHasPropChanges()) {
        onPropsChanged(props);
      }
    }
    
    materialize(context);
    
    props->resetPropChanges();    
  }
    
protected:
  /**
   Override to implement materialization
   */
  virtual void materialize(JsiDrawingContext* context) = 0;
  
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
