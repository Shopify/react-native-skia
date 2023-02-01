#pragma once

#include "JsiDomDeclarationNode.h"
#include "PaintProps.h"

#include <memory>

namespace RNSkia {

class JsiPaintNode : public JsiDomDeclarationNode,
                     public JsiDomNodeCtor<JsiPaintNode> {
public:
  explicit JsiPaintNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDeclarationNode(context, "skPaint", DeclarationType::Paint) {}

  /**
   Returns a pointer to the local paint context in the paint node. This is a
   special case for declaration nodes since the Paint node has a bit different
   semantic than other declaration nodes.
   */
  DrawingContext *getDrawingContext() { return _localContext.get(); }

  /**
   We need to override the decorate node call to avoid letting children
   decorate before we have created our child context.
   */
  void decorateContext(DrawingContext *context) override {
    // We totally override calling parent - so don't enable this line:
    // JsiDomDeclarationNode::decorateContext(context);

    // A paint node should have its own local context.
    if (_localContext == nullptr) {
      _localContext = context->inheritContext("PaintNode");
    }

    // ...and it should be a totally new paint, not inheriting from parent
    // paint.
    if (_localContext->isChanged()) {
      auto paint = std::make_shared<SkPaint>();
      paint->setAntiAlias(true);
      _localContext->setMutablePaint(paint);
    }

    // Ensure that we have a child context
    ensureChildDeclarationContext(_localContext.get());

    // Let's decorate paint props
    _paintProps->decorate(_localContext.get());

    // Let children decorate
    decorateChildren(_localContext.get());

    // Propagate all declarations to parent declaration context if it is
    // changed.
    if (_localContext->isChanged()) {

      if (getChildDeclarationContext()->getColorFilters()->size() > 0) {
        _localContext->getDeclarations()->getColorFilters()->push(
            getChildDeclarationContext()->getColorFilters()->peekAsOne());
      }

      if (getChildDeclarationContext()->getImageFilters()->size() > 0) {
        _localContext->getDeclarations()->getImageFilters()->push(
            getChildDeclarationContext()->getImageFilters()->peekAsOne());
      }

      if (getChildDeclarationContext()->getShaders()->size() > 0) {
        _localContext->getDeclarations()->getShaders()->push(
            getChildDeclarationContext()->getShaders()->peek());
      }

      if (getChildDeclarationContext()->getMaskFilters()->size() > 0) {
        _localContext->getDeclarations()->getMaskFilters()->push(
            getChildDeclarationContext()->getMaskFilters()->peek());
      }

      if (getChildDeclarationContext()->getPathEffects()->size() > 0) {
        _localContext->getDeclarations()->getPathEffects()->push(
            getChildDeclarationContext()->getPathEffects()->peekAsOne());
      }
    }

    _localContext->materializeDeclarations();
  }

  std::shared_ptr<const SkPaint> getPaint() {
    return _localContext->getPaint();
  }

protected:
  void decorate(DrawingContext *context) override {}

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDeclarationNode::defineProperties(container);

    _paintProps = container->defineProperty<PaintProps>();
    _opacityProp = container->defineProperty<NodeProp>("opacity");
  }

private:
  NodeProp *_opacityProp;
  PaintProps *_paintProps;

  std::shared_ptr<DrawingContext> _localContext;
};

} // namespace RNSkia
