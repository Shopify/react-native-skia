#pragma once

#include "JsiDomDrawingNode.h"
#include "RectProp.h"

namespace RNSkia {

class JsiFillNode : public JsiDomDrawingNode,
                    public JsiDomNodeCtor<JsiFillNode> {
public:
  JsiFillNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skFill") {}

protected:
  void draw(DrawingContext *context) override {
    context->getCanvas()->drawPaint(*context->getPaint());
  }
};

} // namespace RNSkia
