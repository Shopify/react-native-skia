
#pragma once

#include "JsiDomNode.h"
#include "JsiDrawingContext.h"

namespace RNSkia {

class JsiBaseDomDeclarationNode: public JsiDomNode {
public:
  JsiBaseDomDeclarationNode(std::shared_ptr <RNSkPlatformContext> context,
                        jsi::Runtime &runtime,
                        const jsi::Value *arguments,
                        size_t count) :
  JsiDomNode(context, runtime, arguments, count) {}
  
  virtual void setInvalidateCallback(std::function<void()> cb) = 0;
};

template <typename T>
class JsiDomDeclarationNode : public JsiBaseDomDeclarationNode {
public:
  JsiDomDeclarationNode(std::shared_ptr <RNSkPlatformContext> context,
                        jsi::Runtime &runtime,
                        const jsi::Value *arguments,
                        size_t count) :
  JsiBaseDomDeclarationNode(context, runtime, arguments, count) {}
  
  JSI_PROPERTY_GET(declarationType) {
    return jsi::String::createFromUtf8(runtime, getDeclarationType());
  }
  
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiDomDeclarationNode, declarationType),
                              JSI_EXPORT_PROP_GET(JsiDomNode, type))
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiDomNode, addChild),
                       JSI_EXPORT_FUNC(JsiDomNode, removeChild),
                       JSI_EXPORT_FUNC(JsiDomNode, insertChildBefore),
                       JSI_EXPORT_FUNC(JsiDomNode, setProps),
                       JSI_EXPORT_FUNC(JsiDomNode, dispose),
                       JSI_EXPORT_FUNC(JsiDomNode, isNative),
                       JSI_EXPORT_FUNC(JsiDomNode, children))

  /**
   Sets the callback for invalidating parent node
   */
  void setInvalidateCallback(std::function<void()> invalidateCallback) override {
    _invalidateCallback = invalidateCallback;
  }
  
  /**
   Called when rendering the tree to create all derived values from all nodes.
   */
  virtual T materialize(JsiBaseDrawingContext* context) = 0;
  
  virtual const char* getDeclarationType() = 0;
  const char* getType() override { return getDeclarationType(); }
  
protected:
  
  /**
   Validates that only declaration nodes can be children
   */
  virtual void addChild(std::shared_ptr<JsiDomNode> child) override {
    if ( std::dynamic_pointer_cast<JsiDomDeclarationNode>(child) == nullptr) {
      throw std::runtime_error("Cannot add a child of type \"" + std::string(child->getType()) +
                               "\" to a \"" + std::string(getType()) + "\".");
    }
    JsiDomNode::addChild(child);
  }
  
  /**
   Validates that only declaration nodes can be children
   */
  virtual void
  insertChildBefore(std::shared_ptr<JsiDomNode> child, std::shared_ptr<JsiDomNode> before) override {
    if (std::dynamic_pointer_cast<JsiDomDeclarationNode>(child) == nullptr) {
      throw std::runtime_error("Cannot add a child of type \"" + std::string(child->getType()) +
                               "\" to a \"" + std::string(getType()) + "\".");
    }
    JsiDomNode::insertChildBefore(child, before);
  }
  
private:
  std::function<void()> _invalidateCallback;
};

}
