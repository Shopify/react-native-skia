#pragma once

#include "JsiDomDrawingNode.h"
#include "ImageProps.h"

namespace RNSkia {

class JsiImageNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiImageNode> {
public:
  JsiImageNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skImage") {}
    
protected:
  void draw(DrawingContext* context) override {
    auto rects = _imageProps->getDerivedValue();
    context->getCanvas()->drawImageRect(_imageProps->getImage(),
                                        rects->src,
                                        rects->dst,
                                        SkSamplingOptions(),
                                        context->getPaint().get(),
                                        SkCanvas::kStrict_SrcRectConstraint);
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _imageProps = container->defineProperty(std::make_shared<ImageProps>());
    _imageProps->require();
  }
  
private:
  ImageProps* _imageProps;
};

}

