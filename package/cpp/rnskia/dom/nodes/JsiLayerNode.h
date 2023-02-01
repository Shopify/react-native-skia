#pragma once

#include "JsiBoxShadowNode.h"
#include "JsiDomRenderNode.h"
#include "JsiPaintNode.h"

#include <memory>
#include <vector>

namespace RNSkia {

class JsiLayerNode : public JsiDomRenderNode,
                     public JsiDomNodeCtor<JsiLayerNode> {
public:
  explicit JsiLayerNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomRenderNode(context, "skLayer") {}

protected:
  void renderNode(DrawingContext *context) override {

    bool isLayer = false;
    auto children = getChildren();
    auto size = children.size();

    // Is the first children a layer?
    for (size_t i = 0; i < size; ++i) {
      if (i == 0) {
        // Check for paint node as layer
        if (children.at(i)->getNodeClass() == NodeClass::DeclarationNode) {
          auto declarationNode =
              std::static_pointer_cast<JsiDomDeclarationNode>(children.at(i));
          if (declarationNode->getDeclarationType() == DeclarationType::Paint) {
            // Yes, it is a paint node - which we can use as a layer.
            isLayer = true;

            auto paintNode =
                std::static_pointer_cast<JsiPaintNode>(children.at(i));

            // Save canvas with the paint node's paint!
            context->getCanvas()->saveLayer(SkCanvas::SaveLayerRec(
                nullptr, paintNode->getPaint().get(), nullptr, 0));

            continue;
          }
        }
      }

      // Render rest of the children
      if (children.at(i)->getNodeClass() == NodeClass::RenderNode) {
        std::static_pointer_cast<JsiDomRenderNode>(children.at(i))
            ->render(context);
      }
    }

    if (isLayer) {
      context->getCanvas()->restore();
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomRenderNode::defineProperties(container);
  }

private:
};

} // namespace RNSkia
