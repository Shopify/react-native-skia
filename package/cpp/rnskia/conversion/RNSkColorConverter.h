#pragma once

#include "third_party/CSSColorParser.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkColor.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace RNJsi; // NOLINT

static PropId PropName0 = JsiPropId::get("0");
static PropId PropName1 = JsiPropId::get("1");
static PropId PropName2 = JsiPropId::get("2");
static PropId PropName3 = JsiPropId::get("3");

/**
 Implements a converter class that converts to numeric values
 */
class RNSkColorConverter {
public:
  /**
   Converter
   */
  static SkColor convert(const JsiValue &input) {
    if (input.getType() == PropType::Object) {
      // Array og floats (as object with 0..3 indicies)
      auto r = input.getValue(PropName0);
      auto g = input.getValue(PropName1);
      auto b = input.getValue(PropName2);
      auto a = input.getValue(PropName3);
      return (SkColorSetARGB(a.getAsNumber() * 255.0f, r.getAsNumber() * 255.0f,
                             g.getAsNumber() * 255.0f,
                             b.getAsNumber() * 255.0f));

    } else if (input.getType() == PropType::Array) {
      auto r = input.getAsArray().at(0);
      auto g = input.getAsArray().at(1);
      auto b = input.getAsArray().at(2);
      auto a = input.getAsArray().at(3);
      return SkColorSetARGB(a.getAsNumber() * 255.0f, r.getAsNumber() * 255.0f,
                            g.getAsNumber() * 255.0f, b.getAsNumber() * 255.0f);
    } else if (input.getType() == PropType::Number) {
      // We'll also allow conversions from numbers
      return static_cast<SkColor>(input.getAsNumber());
    } else if (input.getType() == PropType::String) {
      // And parse strings as CSS colors
      auto parsedColor = CSSColorParser::parse(input.getAsString());
      if (parsedColor.a == -1.0f) {
        return SK_ColorBLACK;
      } else {
        return SkColorSetARGB(parsedColor.a * 255, parsedColor.r, parsedColor.g,
                              parsedColor.b);
      }
    }
    // An error -we can't convert this value
    throw std::runtime_error("Could not convert value " + input.description() +
                             " as a color value.");
  }

  /**
   Returns true if this interpolator can interpolate this value type
   */
  static bool isConvertable(const JsiValue &value) {
    if (value.getType() == PropType::Object) {
      return value.hasValue(PropName0) && value.hasValue(PropName1) &&
             value.hasValue(PropName2) && value.hasValue(PropName3);
    } else if (value.getType() == PropType::String) {
      auto parsedColor = CSSColorParser::parse(value.getAsString());
      if (parsedColor.a == -1.0f) {
        return false;
      }
      return true;
    }
    return false;
  }
};
} // namespace RNSkia
