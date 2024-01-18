#pragma once

#include "BufferProp.h"
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
    if (_spritesProp->isSet() && _imageProp->isSet() && _transformsProp->isSet()) {
      const auto image = _imageProp->getDerivedValue();
      auto sprites = reinterpret_cast<const SkRect*>(_spritesProp->getDerivedValue().get());
      auto transforms = reinterpret_cast<const SkRSXform *>(_transformsProp->getDerivedValue().get());
      SkSamplingOptions sampling;
      SkPaint paint;
      context->getCanvas()->drawAtlas(
          // TODO: add count
          image.get(), transforms, sprites, nullptr, 450,
          SkBlendMode::kSrcOver, sampling, nullptr, &paint);
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
	_spritesProp = container->defineProperty<BufferProp>("sprites");
    _transformsProp = container->defineProperty<BufferProp>("transforms");
    _imageProp = container->defineProperty<ImageProp>("image");

	  _spritesProp->require();
    _transformsProp->require();
    _imageProp->require();
  }

private:
  BufferProp *_spritesProp;
  BufferProp *_transformsProp;
  ImageProp *_imageProp;
};

} // namespace RNSkia
