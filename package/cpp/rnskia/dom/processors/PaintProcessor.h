#pragma once

#include "JsiDomNodeProps.h"

namespace RNSkia {

static std::string PropNameColor = "color";
static std::string PropNameStyle = "style";
static std::string PropNameStrokeWidth = "strokeWidth";

class PaintProcessor {
public:
  /**
   Processes paint from properties. A parent paint is provided - and returned if props does not contain paint properties.
   */
  static std::shared_ptr<SkPaint> processPaint(std::shared_ptr<SkPaint> parentPaint,
                                               std::shared_ptr<JsiDomNodeProps> props,
                                               double opacity) {
    
    if (props->hasValue(PropNameColor) ||
        props->hasValue(PropNameStyle) ||
        props->hasValue(PropNameStrokeWidth)) {
      
      // Copy paint from parent
      auto paint = std::make_shared<SkPaint>(*parentPaint);
      
      if (props->hasValue(PropNameColor)) {
        auto colorValue = props->getValue(PropNameColor)->getAsString();
        auto parsedColor = CSSColorParser::parse(colorValue);
        if (parsedColor.a == -1.0f) {
          paint->setColor(SK_ColorBLACK);
        } else {
          paint->setColor(SkColorSetARGB(parsedColor.a * 255,
                                         parsedColor.r,
                                         parsedColor.g,
                                         parsedColor.b));
        }
      }
      
      // Set alpha
      paint->setAlpha(255.0f * opacity);
      
      // Style
      if (props->hasValue(PropNameStyle)) {
        auto styleValue = props->getValue(PropNameStyle)->getAsString();
        if (styleValue == "stroke") {
          paint->setStyle(SkPaint::Style::kStroke_Style);
        } else if (styleValue == "fill") {
          paint->setStyle(SkPaint::Style::kFill_Style);
        }
      }

      // Stroke width
      if (props->hasValue(PropNameStrokeWidth)) {
        paint->setStrokeWidth(props->getValue(PropNameStrokeWidth)->getAsNumber());
      }
      
      return paint;
    }
    
    return parentPaint;
  }
};

}
