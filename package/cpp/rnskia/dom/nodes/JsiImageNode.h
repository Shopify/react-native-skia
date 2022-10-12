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
    requirePropertyToBeSet(_imageProps);
    
    auto image = _imageProps->getImage();
    auto rects = _imageProps->getDerivedValue();
    
    context->getCanvas()->drawImageRect(image,
                                        rects->src,
                                        rects->dst,
                                        SkSamplingOptions(),
                                        context->getPaint().get(),
                                        SkCanvas::kStrict_SrcRectConstraint);
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _imageProps = container->defineProperty(std::make_shared<ImageProps>());
  }
  
private:
  ImageProps* _imageProps;
};

}

