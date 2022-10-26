#pragma once

#include "JsiDomDrawingNode.h"

#include "BlendModeProp.h"
#include "VerticesProps.h"

namespace RNSkia {

class JsiVerticesNode : public JsiDomDrawingNode,
                        public JsiDomNodeCtor<JsiVerticesNode> {
public:
  JsiVerticesNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skVertices") {}

protected:
  void draw(DrawingContext *context) override {
    SkBlendMode defaultBlendMode = _verticesProps->hasColors()
                                       ? SkBlendMode::kDstOver
                                       : SkBlendMode::kSrcOver;
    context->getCanvas()->drawVertices(_verticesProps->getDerivedValue(),
                                       _blendModeProp->isSet()
                                           ? *_blendModeProp->getDerivedValue()
                                           : defaultBlendMode,
                                       *context->getPaint());
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
    _verticesProps =
        container->defineProperty(std::make_shared<VerticesProps>());
    _blendModeProp = container->defineProperty(
        std::make_shared<BlendModeProp>(JsiPropId::get("blendMode")));
  }

private:
  VerticesProps *_verticesProps;
  BlendModeProp *_blendModeProp;
};

} // namespace RNSkia
