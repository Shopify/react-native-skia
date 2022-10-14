
#pragma once

#include "JsiDomNode.h"
#include "DrawingContext.h"

namespace RNSkia {

class JsiBaseDomDeclarationNode: public JsiDomNode {
public:
  JsiBaseDomDeclarationNode(std::shared_ptr <RNSkPlatformContext> context, const char* type) :
  JsiDomNode(context, type) {}
  
  JSI_PROPERTY_GET(declarationType) {
    return jsi::String::createFromUtf8(runtime, std::string(getType()));
  }
  
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiBaseDomDeclarationNode, declarationType),
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
      container->updatePendingValues(context, getType());
    }
    
    // Materialize children
    for (auto &child: getChildren()) {
      auto decl = std::dynamic_pointer_cast<JsiBaseDomDeclarationNode>(child);
      if (decl != nullptr) {
        decl->materializeNode(context);
      }
    }
    
    // Now we are ready to materialize
    materialize(context);

    // end the "visit" of the declaration node
    if (container != nullptr) {
      container->markAsResolved();
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
    if ( std::dynamic_pointer_cast<JsiBaseDomDeclarationNode>(child) == nullptr) {
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
    if (std::dynamic_pointer_cast<JsiBaseDomDeclarationNode>(child) == nullptr) {
      getContext()->raiseError(std::runtime_error("Cannot add a child of type \"" +
                                                  std::string(child->getType()) +
                                                  "\" to a \"" + std::string(getType()) + "\"."));
    }
    JsiDomNode::insertChildBefore(child, before);
  }  
};

template <typename T, typename ST>
class JsiDomDeclarationNode: public JsiBaseDomDeclarationNode {
public:
  JsiDomDeclarationNode(std::shared_ptr <RNSkPlatformContext> context, const char* type) :
  JsiBaseDomDeclarationNode(context, type) {}
  
  bool isChanged(DrawingContext* context) {
    return getCurrent() == nullptr ||
      context->isInvalid() ||
      getPropsContainer()->isChanged();
  }
  
  /**
   Returns the inner element
   */
  ST getCurrent() {
    return _current;
  }
  
  /**
   Clears the current
   */
  void clearCurrent() {
    _current = nullptr;
  }
  
protected:
  
  /**
   Sets the current value
   */
  void setCurrent(ST c) {
    _current = c;
  }
  
  /**
   Returns a required child image filter by index
   */
  std::shared_ptr<T> requireChild(size_t index) {
    auto filter = optionalChild(index);
    if (filter == nullptr) {
      throw std::runtime_error("Expected child node at index " + std::to_string(index) + " in node " + getType());
    }
    return filter;
  }
  
  /**
   Returns an optional child image filter by index
   */
  std::shared_ptr<T> optionalChild(size_t index) {
    if (index >= getChildren().size()) {
      return nullptr;
    }
    
    // TODO: Support all types here!! ImageFilters, ColorFilters
    // package/src/dom/nodes/paint/ImageFilters.ts#80
    auto ptr = std::dynamic_pointer_cast<T>(getChildren()[index]);
    if (ptr == nullptr) {
      return nullptr;
    }
    
    return ptr;
  }
  
  /**
   Sets or composes the image filter
   */
  virtual void set(DrawingContext* context, ST imageFilter) = 0;
  
  void removeChild(std::shared_ptr<JsiDomNode> child) override {
    JsiBaseDomDeclarationNode::removeChild(child);
    clearCurrent();
  }
  
  virtual void addChild(std::shared_ptr<JsiDomNode> child) override {
    if ( std::dynamic_pointer_cast<T>(child) == nullptr) {
      getContext()->raiseError(std::runtime_error("Cannot add a child of type \"" +
                                                  std::string(child->getType()) +
                                                  "\" to a \"" + std::string(getType()) + "\"."));
    }
    JsiBaseDomDeclarationNode::addChild(child);
    clearCurrent();
  }
  
  virtual void
  insertChildBefore(std::shared_ptr<JsiDomNode> child, std::shared_ptr<JsiDomNode> before) override {
    if (std::dynamic_pointer_cast<T>(child) == nullptr) {
      getContext()->raiseError(std::runtime_error("Cannot add a child of type \"" +
                                                  std::string(child->getType()) +
                                                  "\" to a \"" + std::string(getType()) + "\"."));
    }
    JsiBaseDomDeclarationNode::insertChildBefore(child, before);
    clearCurrent();
  }
  
private:
  ST _current;
};

}
