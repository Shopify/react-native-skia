#pragma once

#include "JsiDomDrawingNode.h"
#include "PointsProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkCanvas.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNamePoints = JsiPropId::get("points");
static PropId PropNamePointsMode = JsiPropId::get("mode");

class JsiPointsNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiPointsNode> {
public:
  JsiPointsNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skPoints") {}
    
protected:
  void draw(DrawingContext* context) override {
    requirePropertyToBeSet(_pointsProp);
    requirePropertyToBeSet(_pointModeProp);
    
    auto mode = _pointModeProp->getDerivedValue();
    auto points = _pointsProp->getDerivedValue();
    
    context->getCanvas()->drawPoints(*mode, points->size(), points->data(), *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _pointModeProp = container->defineProperty(std::make_shared<PointModeProp>(PropNamePointsMode));
    _pointsProp = container->defineProperty(std::make_shared<PointsProp>(PropNamePoints));
  }
  
private:
  PointModeProp* _pointModeProp;
  PointsProp* _pointsProp;
};

}
