#pragma once

#include "JsiDomDeclarationNode.h"
#include "PaintProps.h"

#include <memory>

namespace RNSkia {

// TODO: implement feature: A paint node has its own paint not inherited,
//       and when found the drawing node should render an extra time for
//       each paint node in its children.

class JsiPaintNode : public JsiBaseDomDeclarationNode,
                     public JsiDomNodeCtor<JsiPaintNode> {
public:
  explicit JsiPaintNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiBaseDomDeclarationNode(context, "skPaint") {}

  /**
   Returns a pointer to the local paint context in the paint node. This is a
   special case for declaration nodes since the Paint node has a bit different
   semantic than other declaration nodes.
   */
  DrawingContext *getDrawingContext() { return _localContext.get(); }

  /**
   We need to override the materialize node call to avoid letting children
   materialize before we have created our child context.
   */
  void materializeNode(DrawingContext *context) override {
    // Update props
    updatePendingProperties();

    // A paint node should have its own local paint
    if (_localContext == nullptr) {
      _localContext = context->inheritContext("PaintNode");
    }

    // ...and it should be a totally new paint, not inheriting from parent
    // paint.
    if (_localContext->isChanged()) {
      _localContext->setMutablePaint(std::make_shared<SkPaint>());
    }

    // Let's materialize paint props
    _paintProps->materialize(_localContext.get());

    // Materialize children who will now only change the paint node's paint
    for (auto &child : getChildren()) {
      auto decl = std::dynamic_pointer_cast<JsiBaseDomDeclarationNode>(child);
      if (decl != nullptr) {
        decl->materializeNode(_localContext.get());
      }
    }
  }

  std::shared_ptr<const SkPaint> getPaint() {
    return _localContext->getPaint();
  }

protected:
  void materialize(DrawingContext *context) override {}

  void defineProperties(NodePropsContainer *container) override {
    JsiBaseDomDeclarationNode::defineProperties(container);

    _paintProps = container->defineProperty(std::make_shared<PaintProps>());
    _opacityProp =
        container->defineProperty(std::make_shared<NodeProp>(PropNameOpacity));
  }

private:
  NodeProp *_opacityProp;
  PaintProps *_paintProps;

  std::shared_ptr<DrawingContext> _localContext;
};

} // namespace RNSkia
