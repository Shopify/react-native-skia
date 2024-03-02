#pragma once

#include "JsiDomDrawingNode.h"
#include "RSXformProp.h"
#include "RectProp.h"
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
      const auto colors =
          _colorsProp->isSet() ? _colorsProp->getDerivedValue() : nullptr;
      const auto blendMode = _blendModeProp->isSet()
                                 ? *_blendModeProp->getDerivedValue()
                                 : SkBlendMode::kDstOver;
      auto paint = *context->getPaint();
      SkSamplingOptions sampling(SkFilterMode::kLinear, SkMipmapMode::kNone);
      context->getCanvas()->drawAtlas(
          image.get(), transforms->data(), sprites->data(),
          colors == nullptr ? nullptr : colors->data(), sprites->size(),
          blendMode, sampling, nullptr, &paint);
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
    _rectsProp = container->defineProperty<RectsProp>("sprites");
    _rsxFormsProp = container->defineProperty<RSXFormsProp>("transforms");
    _imageProp = container->defineProperty<ImageProp>("image");
    _colorsProp = container->defineProperty<ColorsProp>("colors");
    _blendModeProp = container->defineProperty<BlendModeProp>("blendMode");

    _rectsProp->require();
    _rsxFormsProp->require();
  }

private:
  ImageProp *_imageProp;
  RectsProp *_rectsProp;
  RSXFormsProp *_rsxFormsProp;
  ColorsProp *_colorsProp;
  BlendModeProp *_blendModeProp;
};

} // namespace RNSkia
