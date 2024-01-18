#pragma once

#include "RectProp.h"
#include "JsiDomDrawingNode.h"
#include "SkImageProps.h"

#include <memory>
#include <tuple>

namespace RNSkia {

class JsiAtlasNode : public JsiDomDrawingNode,
                     public JsiDomNodeCtor<JsiAtlasNode> {
public:
  explicit JsiAtlasNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skAtlas") {}

protected:
  void draw(DrawingContext *context) override {
    if (_rectsProp->isSet() && _imageProp->isSet() && _rsxFormsProp->isSet()) {
      const auto image = _imageProp->getDerivedValue();
      const auto sprites = _rectsProp->getDerivedValue();
      const auto transforms = _rsxFormsProp->getDerivedValue();

      SkSamplingOptions sampling;
      SkPaint paint;
      context->getCanvas()->drawAtlas(
          image.get(), transforms->data(), sprites->data(), nullptr, sprites->size(),
          SkBlendMode::kSrcOver, sampling, nullptr, &paint);
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
    _rectsProp = container->defineProperty<RectsProp>("sprites");
    _rsxFormsProp = container->defineProperty<RSXFormsProp>("transforms");
    _imageProp = container->defineProperty<ImageProp>("image");

	_rectsProp->require();
	_rsxFormsProp->require();
    _imageProp->require();
  }

private:
  ImageProp *_imageProp;
  RectsProp *_rectsProp;
  RSXFormsProp *_rsxFormsProp;
};

} // namespace RNSkia
