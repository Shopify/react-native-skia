#pragma once

#include "JsiBoxShadowNode.h"
#include "JsiDomRenderNode.h"

#include <memory>
#include <vector>

namespace RNSkia {

class JsiBoxNode : public JsiDomRenderNode, public JsiDomNodeCtor<JsiBoxNode> {
public:
  explicit JsiBoxNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomRenderNode(context, "skBox") {}

protected:
  void renderNode(DrawingContext *context) override {
    // Verify
    if (!_rrectProp->isSet() && !_rectProp->isSet()) {
      throw std::runtime_error("The box property must be set on the Box node.");
    }

    // Get rect - we'll try to end up with an rrect:
    auto box = _rrectProp->isSet()
                   ? *_rrectProp->getDerivedValue()
                   : SkRRect::MakeRectXY(*_rectProp->getDerivedValue(), 0, 0);

    // Get shadows
    std::vector<std::shared_ptr<JsiBoxShadowNode>> shadows;
    for (auto &child : getChildren()) {
      auto shadowNode = std::dynamic_pointer_cast<JsiBoxShadowNode>(child);
      if (shadowNode != nullptr && shadowNode->getBoxShadowProps()->isSet()) {
        shadows.push_back(shadowNode);
      }
    }
    // Render outer shadows
    for (auto &shadow : shadows) {
      if (!shadow->getBoxShadowProps()->isInner()) {
        // Now let's render
        auto dx = shadow->getBoxShadowProps()->getDx();
        auto dy = shadow->getBoxShadowProps()->getDy();
        auto spread = shadow->getBoxShadowProps()->getSpread();

        context->getCanvas()->drawRRect(
            inflate(box, spread, spread, dx, dy),
            *shadow->getBoxShadowProps()->getDerivedValue());
      }
    }

    // Render box
    context->getCanvas()->drawRRect(box, *context->getPaint());

    // Render inner shadows
    for (auto &shadow : shadows) {
      if (shadow->getBoxShadowProps()->isInner()) {
        // Now let's render
        auto dx = shadow->getBoxShadowProps()->getDx();
        auto dy = shadow->getBoxShadowProps()->getDy();
        auto spread = shadow->getBoxShadowProps()->getSpread();
        auto delta = SkPoint::Make(10 + std::abs(dx), 10 + std::abs(dy));

        context->getCanvas()->save();
        context->getCanvas()->clipRRect(box, SkClipOp::kIntersect, false);

        auto inner = deflate(box, spread, spread, dx, dy);
        auto outer = inflate(box, delta.x(), delta.y());

        // Render!
        context->getCanvas()->drawDRRect(
            outer, inner, *shadow->getBoxShadowProps()->getDerivedValue());

        context->getCanvas()->restore();
      }
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomRenderNode::defineProperties(container);
    _rrectProp = container->defineProperty(
        std::make_shared<RRectProp>(JsiPropId::get("box")));
    _rectProp = container->defineProperty(
        std::make_shared<RectProp>(JsiPropId::get("box")));
  }

private:
  SkRRect inflate(const SkRRect &box, SkScalar dx, SkScalar dy, size_t tx = 0,
                  size_t ty = 0) {
    return SkRRect::MakeRectXY(
        SkRect::MakeXYWH(box.rect().x() - dx + tx, box.rect().y() - dy + ty,
                         box.rect().width() + 2 * dx,
                         box.rect().height() + 2 * dy),
        box.getSimpleRadii().x() + dx, box.getSimpleRadii().y() + dy);
  }

  SkRRect deflate(const SkRRect &box, SkScalar dx, SkScalar dy, size_t tx = 0,
                  size_t ty = 0) {
    return inflate(box, -dx, -dy, tx, ty);
  }

  RRectProp *_rrectProp;
  RectProp *_rectProp;
};

} // namespace RNSkia
