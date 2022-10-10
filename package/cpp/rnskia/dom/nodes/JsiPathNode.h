#pragma once

#include "JsiDomDrawingNode.h"
#include "PathProp.h"


#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkTrimPathEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNamePath = JsiPropId::get("path");
static PropId PropNameStart = JsiPropId::get("start");
static PropId PropNameEnd = JsiPropId::get("end");
static PropId PropNameFillType = JsiPropId::get("fillType");

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

    if (_path == nullptr || _pathProp->isChanged() ||
        _startProp->isChanged() || _endProp->isChanged()) {
      
      if (_startProp->hasValue() || _endProp->hasValue()) {
        SkPath filteredPath(*_pathProp->getDerivedValue());
        auto pe = SkTrimPathEffect::Make(_startProp->getValue()->getAsNumber(),
                                         _endProp->getValue()->getAsNumber(),
                                         SkTrimPathEffect::Mode::kNormal);
        
        if (pe != nullptr) {
          
          SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
          if (!pe->filterPath(_pathProp->getDerivedValue().get(), filteredPath, &rec, nullptr)) {
            throw std::runtime_error("Failed trimming path with parameters start: " +
                                     std::to_string(_startProp->getValue()->getAsNumber()) +
                                     ", end: " + std::to_string(_endProp->getValue()->getAsNumber()));
          }
          _path = std::make_shared<SkPath>(filteredPath);
        } else {
          _path = _pathProp->getDerivedValue();
        }
        
      } else {
        _path = _pathProp->getDerivedValue();
      }
    }
    
    context->getCanvas()->drawPath(*_path, *context->getPaint());
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDrawingNode::defineProperties(container);
    _pathProp = container->defineProperty(std::make_shared<PathProp>(PropNamePath));
    _startProp = container->defineProperty(std::make_shared<NodeProp>(PropNameStart));
    _endProp = container->defineProperty(std::make_shared<NodeProp>(PropNameEnd));
    _fillType = container->defineProperty(std::make_shared<NodeProp>(PropNameFillType));
    // TODO:
    // Stroke options
    // Fill Type
  }
  
private:
  PathProp* _pathProp;
  NodeProp* _startProp;
  NodeProp* _endProp;
  NodeProp* _fillType;
  
  std::shared_ptr<SkPath> _path;
};

}
