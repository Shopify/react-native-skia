#pragma once

#include "JsiDomNodeProps.h"

namespace RNSkia {

static PropId PropNameColor = JsiPropId::get("color");
static PropId PropNameStyle = JsiPropId::get("style");
static PropId PropNameStrokeWidth = JsiPropId::get("strokeWidth");

class PaintProcessor {
public:
  /**
   Processes paint from properties. A parent paint is provided - and returned if props does not contain paint properties.
   */
  static std::shared_ptr<SkPaint> processPaint(std::shared_ptr<SkPaint> parentPaint,
                                               std::shared_ptr<SkPaint> paintCache,
                                               std::shared_ptr<JsiDomNodeProps> props,
                                               double opacity) {
    
    if (props->hasValue(PropNameColor) ||
        props->hasValue(PropNameStyle) ||
        props->hasValue(PropNameStrokeWidth) ) {
      
      if (props->hasValue(PropNameColor) && props->getHasPropChanges(PropNameColor)) {
        auto colorValue = props->getValue(PropNameColor)->getAsString();
        auto parsedColor = CSSColorParser::parse(colorValue);
        if (parsedColor.a == -1.0f) {
          paintCache->setColor(SK_ColorBLACK);
        } else {
          paintCache->setColor(SkColorSetARGB(parsedColor.a * 255,
                                               parsedColor.r,
                                               parsedColor.g,
                                               parsedColor.b));
        }
      }
      
      // Set alpha
      paintCache->setAlpha(255.0f * opacity);
      
      // Style
      if (props->hasValue(PropNameStyle) && props->getHasPropChanges(PropNameStyle)) {
        auto styleValue = props->getValue(PropNameStyle)->getAsString();
        if (styleValue == "stroke") {
          paintCache->setStyle(SkPaint::Style::kStroke_Style);
        } else if (styleValue == "fill") {
          paintCache->setStyle(SkPaint::Style::kFill_Style);
        }
      }

      // Stroke width
      if (props->hasValue(PropNameStrokeWidth) && props->getHasPropChanges(PropNameStrokeWidth)) {
        paintCache->setStrokeWidth(props->getValue(PropNameStrokeWidth)->getAsNumber());
      }
      
      return paintCache;
    }
    
    return parentPaint;
  }
};

}
