#pragma once

#include "JsiDomDeclarationNode.h"

#include "NodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkMaskFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameRespectCTM = JsiPropId::get("respectCTM");
static PropId PropNameBlur = JsiPropId::get("blur");

class JsiBlurMaskNode : public JsiDomDeclarationNode, public JsiDomNodeCtor<JsiBlurMaskNode> {
public:
  JsiBlurMaskNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDeclarationNode(context, "skBlurMaskFilter") {}
    
protected:
  void materialize(DrawingContext* context) override {
    if (_blur->isChanged() || _respectCTM->isChanged() || _style->isChanged()) {
      if (!_blur->isSet()) {
        throw std::runtime_error("Expected <BlurMask> component to have a valid blur property.");
      }
      
      bool respectCTM = _respectCTM->isSet() ? _respectCTM->value()->getAsBool() : true;
      SkBlurStyle style = SkBlurStyle::kNormal_SkBlurStyle;
      if (_style->isSet()) {
        style = getBlurStyleFromString(_style->value()->getAsString());
      }
      
      auto filter = SkMaskFilter::MakeBlur(style, _blur->value()->getAsNumber(), respectCTM);
      
      // Set the mask filter
      context->getMutablePaint()->setMaskFilter(filter);      
    }
  }
  
  void defineProperties(NodePropsContainer* container) override {
    JsiDomDeclarationNode::defineProperties(container);
    
    _style = container->defineProperty(std::make_shared<NodeProp>(PropNameStyle));
    _respectCTM = container->defineProperty(std::make_shared<NodeProp>(PropNameRespectCTM));
    _blur = container->defineProperty(std::make_shared<NodeProp>(PropNameBlur));
  }
  
private:
  
  SkBlurStyle getBlurStyleFromString(const std::string& value) {
    if (value == "normal") {
      return SkBlurStyle::kNormal_SkBlurStyle;
    } else if (value == "solid") {
      return SkBlurStyle::kSolid_SkBlurStyle;
    } else if (value == "outer") {
      return SkBlurStyle::kOuter_SkBlurStyle;
    } else if (value == "inner") {
      return SkBlurStyle::kInner_SkBlurStyle;
    }
    getContext()->raiseError(std::runtime_error("The value \"" + value + "\" is not " +
                                                "a valid blur style."));
    return SkBlurStyle::kNormal_SkBlurStyle;
  }
  
  NodeProp* _style;
  NodeProp* _respectCTM;
  NodeProp* _blur;
};

}
