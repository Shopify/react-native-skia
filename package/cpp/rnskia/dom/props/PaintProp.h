#pragma once

#include "NodeProp.h"

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
public DerivedProp<SkPaint> {
public:
  PaintProp(): DerivedProp<SkPaint>() {
    _color = addProperty(std::make_shared<NodeProp>(PropNameColor));
    _style = addProperty(std::make_shared<NodeProp>(PropNameStyle));
    _strokeWidth = addProperty(std::make_shared<NodeProp>(PropNameStrokeWidth));
    _blendMode = addProperty(std::make_shared<NodeProp>(PropNameBlendMode));
    _strokeJoin = addProperty(std::make_shared<NodeProp>(PropNameStrokeJoin));
    _strokeCap = addProperty(std::make_shared<NodeProp>(PropNameStrokeCap));
    _strokeMiter = addProperty(std::make_shared<NodeProp>(PropNameStrokeMiter));
    _antiAlias = addProperty(std::make_shared<NodeProp>(PropNameAntiAlias));
  }
  
  void updateDerivedValue() override {
    // We only get here if something has changed - start with COLOR
    if (_color->hasValue()) {
      ensureDerivedValue();
      auto parsedColor = CSSColorParser::parse(_color->getValue()->getAsString());
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
    if (_style->hasValue()) {
      ensureDerivedValue();
      auto styleValue = _style->getValue()->getAsString();
      if (styleValue == "stroke") {
        getDerivedValue()->setStyle(SkPaint::Style::kStroke_Style);
      } else if (styleValue == "fill") {
        getDerivedValue()->setStyle(SkPaint::Style::kFill_Style);
      } else {
        throw std::runtime_error(styleValue + " is not a valud value for the style property.");
      }
    }
    // Stroke Width
    if (_strokeWidth->hasValue()) {
      ensureDerivedValue();
      getDerivedValue()->setStrokeWidth(_strokeWidth->getValue()->getAsNumber());
    }
    // Blend mode
    if (_blendMode->hasValue()) {
      ensureDerivedValue();
      auto blendModeValue = _blendMode->getValue()->getAsString();
      getDerivedValue()->setBlendMode(getBlendModeFromValue(blendModeValue));
    }
    // Stroke Join
    if (_strokeJoin->hasValue()) {
      ensureDerivedValue();
      auto joinValue = _strokeJoin->getValue()->getAsString();
      getDerivedValue()->setStrokeJoin(getJoinFromValue(joinValue));
    }
    // Stroke Cap
    if (_strokeCap->hasValue()) {
      ensureDerivedValue();
      auto capValue = _strokeCap->getValue()->getAsString();
      getDerivedValue()->setStrokeCap(getCapFromValue(capValue));
    }
    // Stroke Miter
    if (_strokeMiter->hasValue()) {
      ensureDerivedValue();
      getDerivedValue()->setStrokeMiter(_strokeMiter->getValue()->getAsNumber());
    }
    // AntiAlias
    if (_antiAlias->hasValue()) {
      ensureDerivedValue();
      getDerivedValue()->setAntiAlias(_antiAlias->getValue()->getAsNumber());
    }
  }

  void ensureDerivedValue() {
    // We can bail out if we already have a value and parent paint didn't change
    if (getDerivedValue() != nullptr) {
      return;
    }
    // Now lets create a new paint object
    setDerivedValue(std::make_shared<SkPaint>(*_parentPaint));
  }
  
  void beginVisit(JsiDrawingContext* context) override {
    auto parentPaint = context->getPaint();
    if (_parentPaint != parentPaint) {
      _parentPaint = parentPaint;
      _parentPaintWasReset = true;
      setDerivedValue(nullptr);
    }
    
    if(context->hasChanged()) {
      setDerivedValue(nullptr);
    }
    
    DerivedProp::beginVisit(context);
  }
  
  void endVisit() override {
    DerivedProp::endVisit();
    // Reset parent paint flag - will only be set next time the parent paint is changed
    // meaning that we can keep our cache for a while.
    _parentPaintWasReset = false;
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

