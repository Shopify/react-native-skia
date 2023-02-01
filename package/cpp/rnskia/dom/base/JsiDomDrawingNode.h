#pragma once

#include "JsiDomRenderNode.h"
#include "JsiPaintNode.h"

#include <memory>

namespace RNSkia {

class JsiDomDrawingNode : public JsiDomRenderNode {
public:
  JsiDomDrawingNode(std::shared_ptr<RNSkPlatformContext> context,
                    const char *type)
      : JsiDomRenderNode(context, type) {}

protected:
  void defineProperties(NodePropsContainer *container) override {
    JsiDomRenderNode::defineProperties(container);
    container->defineProperty<PaintProp>();
  }

  /**
   Override to implement drawing.
   */
  virtual void draw(DrawingContext *context) = 0;

  void renderNode(DrawingContext *context) override {
#if SKIA_DOM_DEBUG
    printDebugInfo("Begin Draw", 1);
#endif

#if SKIA_DOM_DEBUG
    printDebugInfo(context->getDebugDescription(), 2);
#endif

    // Call abstract draw method
    draw(context);

    // Draw once more for each child paint node
    for (auto &child : getChildren()) {
      if (child->getNodeClass() == NodeClass::DeclarationNode &&
          std::static_pointer_cast<JsiDomDeclarationNode>(child)
                  ->getDeclarationType() == DeclarationType::Paint) {
        draw(
            std::static_pointer_cast<JsiPaintNode>(child)->getDrawingContext());
      }
    }
#if SKIA_DOM_DEBUG
    printDebugInfo("End Draw", 1);
#endif
  }
};

} // namespace RNSkia
