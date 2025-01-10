#pragma once

#include "JsiDomDrawingNode.h"
#include "SamplingProp.h"
#include "SkImageProps.h"

#include <memory>

namespace RNSkia {

class JsiImageNode : public JsiDomDrawingNode,
                     public JsiDomNodeCtor<JsiImageNode> {
public:
  explicit JsiImageNode(std::shared_ptr<RNSkPlatformContext> context)
      : JsiDomDrawingNode(context, "skImage") {}

protected:
  void draw(DrawingContext *context) override {
    auto rects = _imageProps->getDerivedValue();
    auto image = _imageProps->getImage();
    if (image == nullptr) {
      return;
    }
    auto sampling = _samplingProp->isSet() ? *_samplingProp->getDerivedValue()
                                           : SkSamplingOptions();
    context->getCanvas()->drawImageRect(image, rects->src, rects->dst, sampling,
                                        context->getPaint().get(),
                                        SkCanvas::kStrict_SrcRectConstraint);
  }

  void defineProperties(NodePropsContainer *container) override {
    JsiDomDrawingNode::defineProperties(container);
    _imageProps = container->defineProperty<ImageProps>();
    _samplingProp = container->defineProperty<SamplingProp>("sampling");
  }

private:
  ImageProps *_imageProps;
  SamplingProp *_samplingProp;
};

} // namespace RNSkia
