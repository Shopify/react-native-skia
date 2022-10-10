#pragma once

#include "JsiDomDrawingNode.h"
#include "PathProp.h"

namespace RNSkia {

static PropId PropNamePath = JsiPropId::get("path");
static PropId PropNameStart = JsiPropId::get("start");
static PropId PropNameEnd = JsiPropId::get("end");

class JsiPathNode : public JsiDomDrawingNode, public JsiDomNodeCtor<JsiPathNode> {
public:
  JsiPathNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDrawingNode(context, "skPath") {}
    
protected:
  void draw(DrawingContext* context) override {
    if (!_pathProp->hasValue()) {
      throw std::runtime_error("Expected Path node to have a path property.");
      return;
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _pathProp = container->defineProperty(std::make_shared<PathProp>(PropNamePath));
    _startProp = container->defineProperty(std::make_shared<NodeProp>(PropNameStart));
    _endProp = container->defineProperty(std::make_shared<NodeProp>(PropNameEnd));
  }
  
private:
  PathProp *_pathProp;
  NodeProp* _startProp;
  NodeProp* _endProp;
};

}
