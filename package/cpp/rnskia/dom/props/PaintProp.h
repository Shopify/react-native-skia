#pragma once

#include "JsiProp.h"


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

class PaintProp:
public JsiDerivedProp<std::shared_ptr<SkPaint>> {
public:
  PaintProp(): JsiDerivedProp<std::shared_ptr<SkPaint>>() {
    _color = addChildProp(std::make_shared<JsiProp>(PropNameColor, PropType::String));
    _style = addChildProp(std::make_shared<JsiProp>(PropNameStyle, PropType::String));
    _strokeWidth = addChildProp(std::make_shared<JsiProp>(PropNameStrokeWidth, PropType::Number));
    _blendMode = addChildProp(std::make_shared<JsiProp>(PropNameBlendMode, PropType::String));
    _strokeJoin = addChildProp(std::make_shared<JsiProp>(PropNameStrokeJoin, PropType::String));
    _strokeCap = addChildProp(std::make_shared<JsiProp>(PropNameStrokeCap, PropType::String));
    _strokeMiter = addChildProp(std::make_shared<JsiProp>(PropNameStrokeMiter, PropType::Number));
    _antiAlias = addChildProp(std::make_shared<JsiProp>(PropNameAntiAlias, PropType::Number));
  }
  
  void setParentPaint(std::shared_ptr<SkPaint> paint) {
    if (_parentPaint != paint) {
      _parentPaint = paint;
      _parentPaintWasReset = true;
      setDerivedValue(nullptr);
    }
  }
  
  bool hasChanged(JsiDomNodeProps* props) {
    if (!props->getHasPropChanges()) {
      return false;
    }
    
    return props->getHasPropChanges(PropNameColor) ||
      props->getHasPropChanges(PropNameStyle) ||
      props->getHasPropChanges(PropNameStrokeWidth) ||
      props->getHasPropChanges(PropNameBlendMode) ||
      props->getHasPropChanges(PropNameStrokeJoin) ||
      props->getHasPropChanges(PropNameStrokeCap) ||
      props->getHasPropChanges(PropNameStrokeMiter) ||
      props->getHasPropChanges(PropNameAntiAlias);
  }
  
  void updateDerivedValue(JsiDomNodeProps* props) override {
    // We only get here if something has changed - start with COLOR
    if (_color->hasValue() && (_parentPaintWasReset || props->getHasPropChanges(PropNameColor))) {
      ensureDerivedValue();
      auto parsedColor = CSSColorParser::parse(_color->getPropValue()->getAsString());
      if (parsedColor.a == -1.0f) {
        getDerivedValue()->setColor(SK_ColorBLACK);
      } else {
        getDerivedValue()->setColor(SkColorSetARGB(parsedColor.a * 255,
                                                   parsedColor.r,
                                                   parsedColor.g,
                                                   parsedColor.b));
      }
    }
    // Style
    if (_style->hasValue() && (_parentPaintWasReset || props->getHasPropChanges(PropNameStyle))) {
      ensureDerivedValue();
      auto styleValue = _style->getPropValue()->getAsString();
      if (styleValue == "stroke") {
        getDerivedValue()->setStyle(SkPaint::Style::kStroke_Style);
      } else if (styleValue == "fill") {
        getDerivedValue()->setStyle(SkPaint::Style::kFill_Style);
      } else {
        throw std::runtime_error(styleValue + " is not a valud value for the style property.");
      }
    }
    // Stroke Width
    if (_strokeWidth->hasValue() && (_parentPaintWasReset || props->getHasPropChanges(PropNameStrokeWidth))) {
      ensureDerivedValue();
      getDerivedValue()->setStrokeWidth(_strokeWidth->getPropValue()->getAsNumber());
    }
    // Blend mode
    if (_blendMode->hasValue() &&  (_parentPaintWasReset || props->getHasPropChanges(PropNameBlendMode))) {
      ensureDerivedValue();
      auto blendModeValue = _strokeJoin->getPropValue()->getAsString();
      getDerivedValue()->setBlendMode(getBlendModeFromValue(blendModeValue));
    }
    // Stroke Join
    if (_strokeJoin->hasValue() &&  (_parentPaintWasReset || props->getHasPropChanges(PropNameStrokeJoin))) {
      ensureDerivedValue();
      auto joinValue = _strokeJoin->getPropValue()->getAsString();
      getDerivedValue()->setStrokeJoin(getJoinFromValue(joinValue));
    }
    // Stroke Cap
    if (_strokeCap->hasValue() &&  (_parentPaintWasReset || props->getHasPropChanges(PropNameStrokeCap))) {
      ensureDerivedValue();
      auto capValue = _strokeCap->getPropValue()->getAsString();
      getDerivedValue()->setStrokeCap(getCapFromValue(capValue));
    }
    // Stroke Miter
    if (_strokeMiter->hasValue() &&  (_parentPaintWasReset || props->getHasPropChanges(PropNameStrokeMiter))) {
      ensureDerivedValue();
      getDerivedValue()->setStrokeMiter(_strokeMiter->getPropValue()->getAsNumber());
    }
    // AntiAlias
    if (_antiAlias->hasValue() &&  (_parentPaintWasReset || props->getHasPropChanges(PropNameAntiAlias))) {
      ensureDerivedValue();
      getDerivedValue()->setAntiAlias(_antiAlias->getPropValue()->getAsNumber());
    }
    
    // TODO: Add shaders and filters

    // Reset parent paint flag - will only be set next time the parent paint is changed
    // meaning that we can keep our cache for a while.
    _parentPaintWasReset = false;
  }

  void ensureDerivedValue() {
    // We can bail out if we already have a value and parent paint didn't change
    if (getDerivedValue() != nullptr) {
      return;
    }
    // Now lets create a new paint object
    setDerivedValue(std::make_shared<SkPaint>(*_parentPaint));
  }
private:
  
  SkPaint::Join getJoinFromValue(const std::string& value) {
    if (value == "miter") {
      return SkPaint::Join::kMiter_Join;
    } else if (value == "round") {
      return SkPaint::Join::kRound_Join;
    } else if (value == "bevel") {
      return SkPaint::Join::kBevel_Join;
    }
    throw std::runtime_error("Property value \"" + value + "\" is not a legal stroke join.");
  }
  
  SkPaint::Cap getCapFromValue(const std::string& value) {
    if (value == "round") {
      return SkPaint::Cap::kRound_Cap;
    } else if (value == "butt") {
      return SkPaint::Cap::kButt_Cap;
    } else if (value == "square") {
      return SkPaint::Cap::kSquare_Cap;
    }
    throw std::runtime_error("Property value \"" + value + "\" is not a legal stroke cap.");
  }
  
  SkBlendMode getBlendModeFromValue(const std::string& value) {
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
  
  bool _parentPaintWasReset = true;
  std::shared_ptr<SkPaint> _parentPaint;
  std::shared_ptr<JsiProp> _color;
  std::shared_ptr<JsiProp> _style;
  std::shared_ptr<JsiProp> _strokeWidth;
  std::shared_ptr<JsiProp> _blendMode;
  std::shared_ptr<JsiProp> _strokeJoin;
  std::shared_ptr<JsiProp> _strokeCap;
  std::shared_ptr<JsiProp> _strokeMiter;
  std::shared_ptr<JsiProp> _antiAlias;
};

}

