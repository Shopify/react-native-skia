#pragma once

#include "CircleProp.h"
#include "JsiDomDrawingNode.h"

#include <memory>

namespace RNSkia {

class JsiBackdropFilterNode : public JsiDomDrawingNode,
                              public JsiDomNodeCtor<JsiBackdropFilterNode> {
public:
  explicit JsiBackdropFilterNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skBackdropFilter") {}

protected:
  void draw(DrawingContext *context) override {
    if (getChildren().size() == 0) {
      throw std::runtime_error(
          "Expected at least one child in the BackdropFilter node.");
    }

    auto child = getChildren().at(0);
    if (child->getNodeClass() != NodeClass::DeclarationNode) {
      throw std::runtime_error(
          "Expected declaration as child in the BackdropFilter node.");
    }

    // Decorate!
    child->decorateContext(context);

    auto imageFilter = context->getDeclarations()->getImageFilters()->peek();
    auto colorFilter = context->getDeclarations()->getColorFilters()->peek();

    auto canvas = context->getCanvas();
    if (colorFilter) {
      imageFilter = SkImageFilters::ColorFilter(colorFilter, nullptr);
    }

    canvas->saveLayer(
        SkCanvas::SaveLayerRec(nullptr, nullptr, imageFilter.get(), 0));

    canvas->restore();
  }
};

} // namespace RNSkia
