#pragma once

#include "NodeProp.h"
#include "CSSColorParser.h"
#include "JsiSkPaint.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPaint.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameColor = JsiPropId::get("color");
static PropId PropNameStyle = JsiPropId::get("style");
static PropId PropNameStrokeWidth = JsiPropId::get("strokeWidth");
static PropId PropNameBlendMode = JsiPropId::get("blendMode");
static PropId PropNameStrokeJoin = JsiPropId::get("strokeJoin");
static PropId PropNameStrokeCap = JsiPropId::get("strokeCap");
static PropId PropNameStrokeMiter = JsiPropId::get("strokeMiter");
static PropId PropNameAntiAlias = JsiPropId::get("antiAlias");
static PropId PropNamePaint = JsiPropId::get("paint");

class PaintProp: public BaseDerivedProp {
public:
  PaintProp(): BaseDerivedProp() {
    _paintProp = addProperty(std::make_shared<NodeProp>(PropNamePaint));
  }
  
  void beginVisit(DrawingContext *context) override {
    if (_paintProp->hasValue() && (_paintProp->isChanged() || context->isInvalid())) {
      if (_paintProp->getValue()->getType() == PropType::HostObject) {
        // Read paint property as Host Object - JsiSkPaint
        auto ptr = std::dynamic_pointer_cast<JsiSkPaint>(_paintProp->getValue()->getAsHostObject());
        if (ptr != nullptr) {
          // Update the local paint for the current context
          context->setMutablePaint(ptr->getObject());
        } else {
          throw std::runtime_error("Expected SkPaint object, got unknown object when reading paint property.");
        }
      } else if (_paintProp->getValue()->getType() == PropType::Object) {
        // TODO: We have a paint object - let us check for the current property!        
      } else {
        throw std::runtime_error("Expected paint object, got unknown object when reading paint property.");
      }
    }
  }
private:
  std::shared_ptr<NodeProp> _paintProp;
};

class PaintProps:
public BaseDerivedProp {
public:
  PaintProps(): BaseDerivedProp() {
    _color = addProperty(std::make_shared<NodeProp>(PropNameColor));
    _style = addProperty(std::make_shared<NodeProp>(PropNameStyle));
    _strokeWidth = addProperty(std::make_shared<NodeProp>(PropNameStrokeWidth));
    _blendMode = addProperty(std::make_shared<NodeProp>(PropNameBlendMode));
    _strokeJoin = addProperty(std::make_shared<NodeProp>(PropNameStrokeJoin));
    _strokeCap = addProperty(std::make_shared<NodeProp>(PropNameStrokeCap));
    _strokeMiter = addProperty(std::make_shared<NodeProp>(PropNameStrokeMiter));
    _antiAlias = addProperty(std::make_shared<NodeProp>(PropNameAntiAlias));
  }
  
  void beginVisit(DrawingContext* context) override {
    BaseDerivedProp::beginVisit(context);
    
    // Now we can start updating the context
    // We only get here if something has changed - start with COLOR
    if (_color->hasValue() && (_color->isChanged() || context->isInvalid())) {
      auto parsedColor = CSSColorParser::parse(_color->getValue()->getAsString());
      if (parsedColor.a == -1.0f) {
        context->getMutablePaint()->setColor(SK_ColorBLACK);
      } else {
        context->getMutablePaint()->setColor(SkColorSetARGB(parsedColor.a * 255,
                                                   parsedColor.r,
                                                   parsedColor.g,
                                                   parsedColor.b));
      }
    }
    // Style
    if (_style->hasValue() && (_style->isChanged() || context->isInvalid())) {
      auto styleValue = _style->getValue()->getAsString();
      if (styleValue == "stroke") {
        context->getMutablePaint()->setStyle(SkPaint::Style::kStroke_Style);
      } else if (styleValue == "fill") {
        context->getMutablePaint()->setStyle(SkPaint::Style::kFill_Style);
      } else {
        throw std::runtime_error(styleValue + " is not a valud value for the style property.");
      }
    }
    // Stroke Width
    if (_strokeWidth->hasValue() && (_strokeWidth->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeWidth(_strokeWidth->getValue()->getAsNumber());
    }
    // Blend mode
    if (_blendMode->hasValue() && (_blendMode->isChanged() || context->isInvalid())) {
      auto blendModeValue = _blendMode->getValue()->getAsString();
      context->getMutablePaint()->setBlendMode(getBlendModeFromString(blendModeValue));
    }
    // Stroke Join
    if (_strokeJoin->hasValue() && (_strokeJoin->isChanged() || context->isInvalid())) {
      auto joinValue = _strokeJoin->getValue()->getAsString();
      context->getMutablePaint()->setStrokeJoin(getJoinFromString(joinValue));
    }
    // Stroke Cap
    if (_strokeCap->hasValue() && (_strokeCap->isChanged() || context->isInvalid())) {
      auto capValue = _strokeCap->getValue()->getAsString();
      context->getMutablePaint()->setStrokeCap(getCapFromString(capValue));
    }
    // Stroke Miter
    if (_strokeMiter->hasValue() && (_strokeMiter->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setStrokeMiter(_strokeMiter->getValue()->getAsNumber());
    }
    // AntiAlias
    if (_antiAlias->hasValue() && (_antiAlias->isChanged() || context->isInvalid())) {
      context->getMutablePaint()->setAntiAlias(_antiAlias->getValue()->getAsNumber());
    }
  }

private:
  
  SkPaint::Join getJoinFromString(const std::string& value) {
    if (value == "miter") {
      return SkPaint::Join::kMiter_Join;
    } else if (value == "round") {
      return SkPaint::Join::kRound_Join;
    } else if (value == "bevel") {
      return SkPaint::Join::kBevel_Join;
    }
    throw std::runtime_error("Property value \"" + value + "\" is not a legal stroke join.");
  }
  
  SkPaint::Cap getCapFromString(const std::string& value) {
    if (value == "round") {
      return SkPaint::Cap::kRound_Cap;
    } else if (value == "butt") {
      return SkPaint::Cap::kButt_Cap;
    } else if (value == "square") {
      return SkPaint::Cap::kSquare_Cap;
    }
    throw std::runtime_error("Property value \"" + value + "\" is not a legal stroke cap.");
  }
  
  SkBlendMode getBlendModeFromString(const std::string& value) {
    if (value == "clear") {
      return SkBlendMode::kClear;
    } else if (value == "src") {
      return SkBlendMode::kSrc;
    } else if (value == "dst") {
      return SkBlendMode::kDst;
    } else if (value == "srcOver") {
      return SkBlendMode::kSrcOver;
    } else if (value == "dstOver") {
      return SkBlendMode::kDstOver;
    } else if (value == "srcIn") {
      return SkBlendMode::kSrcIn;
    } else if (value == "kDstIn") {
      return SkBlendMode::kDstIn;
    } else if (value == "srcOut") {
      return SkBlendMode::kSrcOut;
    } else if (value == "dtsOut") {
      return SkBlendMode::kDstOut;
    } else if (value == "srcATop") {
      return SkBlendMode::kSrcATop;
    } else if (value == "dstATop") {
      return SkBlendMode::kDstATop;
    } else if (value == "xor") {
      return SkBlendMode::kXor;
    } else if (value == "plus") {
      return SkBlendMode::kPlus;
    } else if (value == "modulate") {
      return SkBlendMode::kModulate;
    } else if (value == "screen") {
      return SkBlendMode::kScreen;
    } else if (value == "overlay") {
      return SkBlendMode::kOverlay;
    } else if (value == "darken") {
      return SkBlendMode::kDarken;
    } else if (value == "lighten") {
      return SkBlendMode::kLighten;
    } else if (value == "colorDodge") {
      return SkBlendMode::kColorDodge;
    } else if (value == "colorBurn") {
      return SkBlendMode::kColorBurn;
    } else if (value == "hardLight") {
      return SkBlendMode::kHardLight;
    } else if (value == "softLight") {
      return SkBlendMode::kSoftLight;
    } else if (value == "difference") {
      return SkBlendMode::kDifference;
    } else if (value == "exclusion") {
      return SkBlendMode::kExclusion;
    } else if (value == "multiply") {
      return SkBlendMode::kMultiply;
    } else if (value == "hue") {
      return SkBlendMode::kHue;
    } else if (value == "saturation") {
      return SkBlendMode::kSaturation;
    } else if (value == "color") {
      return SkBlendMode::kColor;
    } else if (value == "luminosity") {
      return SkBlendMode::kLuminosity;
    }
      
    throw std::runtime_error("Property value \"" + value + "\" is not a legal blend mode.");
  }
  
  std::shared_ptr<SkPaint> _parentPaint;
  std::shared_ptr<NodeProp> _color;
  std::shared_ptr<NodeProp> _style;
  std::shared_ptr<NodeProp> _strokeWidth;
  std::shared_ptr<NodeProp> _blendMode;
  std::shared_ptr<NodeProp> _strokeJoin;
  std::shared_ptr<NodeProp> _strokeCap;
  std::shared_ptr<NodeProp> _strokeMiter;
  std::shared_ptr<NodeProp> _antiAlias;
};

}

