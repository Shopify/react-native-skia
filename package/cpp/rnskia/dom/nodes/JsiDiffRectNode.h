#pragma once

#include "JsiDomDrawingNode.h"
#include "RRectProp.h"

#include <memory>

namespace RNSkia {

static PropId PropNameInner = JsiPropId::get("inner");
static PropId PropNameOuter = JsiPropId::get("outer");

class JsiDiffRectNode : public JsiDomDrawingNode,
                        public JsiDomNodeCtor<JsiDiffRectNode> {
public:
  explicit JsiDiffRectNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skDiffRect") {}

protected:
  void draw(DrawingContext *context) override {
    context->getCanvas()->drawDRRect(*_outerRectProp->getDerivedValue(),
                                     *_innerRectProp->getDerivedValue(),
                                     *context->getPaint());
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
    _innerRectProp =
        container->defineProperty(std::make_shared<RRectProp>(PropNameInner));
    _outerRectProp =
        container->defineProperty(std::make_shared<RRectProp>(PropNameOuter));

    _innerRectProp->require();
    _outerRectProp->require();
  }

private:
  RRectProp *_innerRectProp;
  RRectProp *_outerRectProp;
};

} // namespace RNSkia
