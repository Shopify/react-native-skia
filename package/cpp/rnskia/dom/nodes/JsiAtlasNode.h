#pragma once

#include "AtlasProps.h"
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
    if (_atlasProp->isSet() && _imageProp->isSet()) {
      const auto image = _imageProp->getDerivedValue();
      const auto values = _atlasProp->getDerivedValue();
      const auto rects = std::get<0>(*values);
      const auto xforms = std::get<1>(*values);
      SkSamplingOptions sampling;
      SkPaint paint;
      context->getCanvas()->drawAtlas(
          image.get(), xforms.data(), rects.data(), nullptr, rects.size(),
          SkBlendMode::kSrcOver, sampling, nullptr, &paint);
    }
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
    _atlasProp = container->defineProperty<AtlasProp>("atlas");
    _imageProp = container->defineProperty<ImageProp>("image");

    _atlasProp->require();
    _imageProp->require();
  }

private:
  AtlasProp *_atlasProp;
  ImageProp *_imageProp;
};

} // namespace RNSkia
