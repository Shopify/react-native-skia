#pragma once

#include "JsiDomDrawingNode.h"
#include "FitProp.h"

namespace RNSkia {

static PropId PropNameImage = JsiPropId::get("image");
static PropId PropNameFit = JsiPropId:: get("fit");

class JsiImageNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiImageNode> {
public:
  JsiImageNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skImage") {}
    
protected:
  void draw(DrawingContext* context) override {
    if (!_imageProp->isSet()) {
      throw std::runtime_error("Image property missing for Image node");
    }
    // TODO: Draw!
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _imageProp = container->defineProperty(std::make_shared<NodeProp>(PropNameImage));
    _fitProp = container->defineProperty(std::make_shared<FitProp>(PropNameFit));
  }
  
private:
  NodeProp* _imageProp;
  FitProp* _fitProp;
};

}

