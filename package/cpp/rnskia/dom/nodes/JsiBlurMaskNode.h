#pragma once

#include "JsiDomDeclarationNode.h"

#include "JsiProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkMaskFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameRespectCTM = JsiPropId::get("respectCTM");
static PropId PropNameBlur = JsiPropId::get("blur");

class JsiBlurMaskNode : public JsiDomDeclarationNode<sk_sp<SkMaskFilter>>, public JsiDomNodeCtor<JsiBlurMaskNode> {
public:
  JsiBlurMaskNode(std::shared_ptr<RNSkPlatformContext> context) :
  JsiDomDeclarationNode<sk_sp<SkMaskFilter>>(context, "skBlurMaskFilter") {
    _style = addProperty(std::make_shared<JsiProp>(PropNameStyle, PropType::String));
    _respectCTM = addProperty(std::make_shared<JsiProp>(PropNameRespectCTM, PropType::Bool));
    _blur = addProperty(std::make_shared<JsiProp>(PropNameBlur, PropType::Number));
  }
    
protected:
  sk_sp<SkMaskFilter> materialize(JsiBaseDrawingContext* context) override {
    if (getProperties()->getHasPropChanges()) {
      if (!_blur->hasValue()) {
        getContext()->raiseError(std::runtime_error("Expected blur mask to have a blur property."));
      }
      
      bool respectCTM = _respectCTM->hasValue() ? _respectCTM->getPropValue()->getAsBool() : true;
      SkBlurStyle style = SkBlurStyle::kNormal_SkBlurStyle;
      if (_style->hasValue()) {
        style = getBlurStyleFromValue(_style->getPropValue()->getAsString());
      }
      
      _filter = SkMaskFilter::MakeBlur(style, _blur->getPropValue()->getAsNumber(), respectCTM);
    }
    
    context->getPaint()->setMaskFilter(_filter);
    
    return _filter;
  }
  
private:
  
  SkBlurStyle getBlurStyleFromValue(const std::string& value) {
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
  
  sk_sp<SkMaskFilter> _filter;
  
  std::shared_ptr<JsiProp> _style;
  std::shared_ptr<JsiProp> _respectCTM;
  std::shared_ptr<JsiProp> _blur;
};

}
