
#pragma once

#include "DrawingContext.h"
#include "JsiDomNode.h"

#include <memory>
#include <string>

namespace RNSkia {

enum DeclarationType {
  Unknown = 0,
  Paint = 1,
  Shader = 2,
  ImageFilter = 3,
  ColorFilter = 4,
  PathEffect = 5,
  MaskFilter = 6,
};

class JsiDomDeclarationNode : public JsiDomNode {
public:
  JsiDomDeclarationNode(std::shared_ptr<RNSkPlatformContext> context,
                        const char *type, DeclarationType declarationType)
      : JsiDomNode(context, type, NodeClass::DeclarationNode),
        _declarationType(declarationType) {}

  JSI_PROPERTY_GET(declarationType) {
    // FIXME: Shouldn't this be the declaration type instead? It has been
    return jsi::String::createFromUtf8(runtime, std::string(getType()));
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiDomDeclarationNode,
                                                  declarationType),
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
  void decorateContext(DrawingContext *context) override {
    JsiDomNode::decorateContext(context);

    ensureChildDeclarationContext(context);

#if SKIA_DOM_DEBUG
    printDebugInfo("Begin decorate " + std::string(getType()));
#endif
    // Materialize children first so that any inner nodes get the opportunity
    // to calculate their state before this node continues.
    decorateChildren(context);

    // decorate drawing context
    decorate(context);

#if SKIA_DOM_DEBUG
    printDebugInfo("End / Commit decorate " + std::string(getType()));
#endif
  }

  DeclarationType getDeclarationType() { return _declarationType; }

  bool isChanged(DrawingContext *context) {
    return context->isChanged() || getPropsContainer()->isChanged();
  }

protected:
  /**
   Invalidates and marks then context as changed. The implementation in the
   declaration node is to pass the call upwards to the parent node
   */
  void invalidateContext() override {
    if (getParent() != nullptr) {
      getParent()->invalidateContext();
    }
  }

  /**
   Override to implement materialization
   */
  virtual void decorate(DrawingContext *context) = 0;

  /**
   Validates that only declaration nodes can be children
   */
  void addChild(std::shared_ptr<JsiDomNode> child) override {
    if (child->getNodeClass() != NodeClass::DeclarationNode) {
      getContext()->raiseError(std::runtime_error(
          "Cannot add a child of type \"" + std::string(child->getType()) +
          "\" to a \"" + std::string(getType()) + "\"."));
    }
    JsiDomNode::addChild(child);
  }

  /**
   Validates that only declaration nodes can be children
   */
  void insertChildBefore(std::shared_ptr<JsiDomNode> child,
                         std::shared_ptr<JsiDomNode> before) override {
    if (child->getNodeClass() != NodeClass::DeclarationNode) {
      getContext()->raiseError(std::runtime_error(
          "Cannot add a child of type \"" + std::string(child->getType()) +
          "\" to a \"" + std::string(getType()) + "\"."));
    }
    JsiDomNode::insertChildBefore(child, before);
  }

  /**
   Returns the declarations confext for this declarations node where child nodes
   can add their declarations
   */
  DeclarationContext *getChildDeclarationContext() {
    return _childDeclarationContext.get();
  }

  /**
   Returns the declaration node where resulting declarations should be pushed
   */
  DeclarationContext *getDeclarationContext() {
    return _childDeclarationContext->getParent();
  }

  void ensureChildDeclarationContext(DrawingContext *context) {
    // Each declaration node has its own local declarations stack so it can
    // push shaders, filters, effects etc and resolve them correctly so that
    // they can be nested in the declarative api.
    if (_childDeclarationContext == nullptr) {
      // Find parent node and check for declaration node
      auto parentContext =
          getParent()->getNodeClass() == NodeClass::DeclarationNode
              ? static_cast<JsiDomDeclarationNode *>(getParent())
                    ->getChildDeclarationContext()
              : context->getDeclarations();

      _childDeclarationContext = context->createDeclarations(parentContext);
    }
  }

private:
  /**
   Local decorators
   */
  std::shared_ptr<DeclarationContext> _childDeclarationContext;

  /**
   Type of declaration
   */
  DeclarationType _declarationType;
};

} // namespace RNSkia
