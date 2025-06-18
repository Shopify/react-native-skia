#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "modules/skparagraph/include/Paragraph.h"
#include "modules/skparagraph/include/ParagraphStyle.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

namespace para = skia::textlayout;

/**
 Implementation of the TextStyle object in JSI for the paragraph builder
 */
class JsiSkTextStyle {
public:
  static para::TextStyle fromValue(jsi::Runtime &runtime,
                                   const jsi::Value &value) {

    para::TextStyle retVal;

    // Accept undefined && null
    if (value.isUndefined() || value.isNull()) {
      return retVal;
    }

    // Read values from the argument - expected to be a TextStyle shaped object
    if (!value.isObject()) {
      throw jsi::JSError(runtime, "Expected SkTextStyle as first argument");
    }

    auto object = value.asObject(runtime);

    if (object.hasProperty(runtime, "backgroundColor")) {
      auto propValue = object.getProperty(runtime, "backgroundColor");
      SkPaint p;
      p.setColor(JsiSkColor::fromValue(runtime, propValue));
      retVal.setBackgroundPaint(p);
    }
    if (object.hasProperty(runtime, "color")) {
      auto propValue = object.getProperty(runtime, "color");
      retVal.setColor(JsiSkColor::fromValue(runtime, propValue));
    }
    if (object.hasProperty(runtime, "decoration")) {
      auto propValue = object.getProperty(runtime, "decoration");
      retVal.setDecoration(
          static_cast<para::TextDecoration>(propValue.asNumber()));
    }
    if (object.hasProperty(runtime, "decorationColor")) {
      auto propValue = object.getProperty(runtime, "decorationColor");
      retVal.setDecorationColor(JsiSkColor::fromValue(runtime, propValue));
    }
    if (object.hasProperty(runtime, "decorationThickness")) {
      auto propValue = object.getProperty(runtime, "decorationThickness");
      retVal.setDecorationThicknessMultiplier(propValue.asNumber());
    }
    if (object.hasProperty(runtime, "decorationStyle")) {
      auto propValue = object.getProperty(runtime, "decorationStyle");
      retVal.setDecorationStyle(
          static_cast<para::TextDecorationStyle>(propValue.asNumber()));
    }
    if (object.hasProperty(runtime, "fontFamilies")) {
      auto propValue = object.getProperty(runtime, "fontFamilies")
                           .asObject(runtime)
                           .asArray(runtime);
      auto size = propValue.size(runtime);
      std::vector<SkString> families(size);
      for (size_t i = 0; i < size; ++i) {
        families[i] = propValue.getValueAtIndex(runtime, i)
                          .asString(runtime)
                          .utf8(runtime)
                          .c_str();
      }
      retVal.setFontFamilies(families);
    }
    if (object.hasProperty(runtime, "fontFeatures")) {
      auto propValue = object.getProperty(runtime, "fontFeatures")
                           .asObject(runtime)
                           .asArray(runtime);
      auto size = propValue.size(runtime);
      retVal.resetFontFeatures();
      for (size_t i = 0; i < size; ++i) {
        auto element = propValue.getValueAtIndex(runtime, i).asObject(runtime);
        auto name = element.getProperty(runtime, "name")
                        .asString(runtime)
                        .utf8(runtime);
        auto value = element.getProperty(runtime, "value").asNumber();
        retVal.addFontFeature(SkString(name), value);
      }
    }
    if (object.hasProperty(runtime, "fontSize")) {
      auto propValue = object.getProperty(runtime, "fontSize");
      retVal.setFontSize(propValue.asNumber());
    }
    if (object.hasProperty(runtime, "fontStyle")) {
      auto propValue =
          object.getProperty(runtime, "fontStyle").asObject(runtime);
      auto weight = static_cast<SkFontStyle::Weight>(
          propValue.hasProperty(runtime, "weight")
              ? propValue.getProperty(runtime, "weight").asNumber()
              : SkFontStyle::Weight::kNormal_Weight);

      auto width = static_cast<SkFontStyle::Width>(
          propValue.hasProperty(runtime, "width")
              ? propValue.getProperty(runtime, "width").asNumber()
              : SkFontStyle::Width::kNormal_Width);

      auto slant = static_cast<SkFontStyle::Slant>(
          propValue.hasProperty(runtime, "slant")
              ? propValue.getProperty(runtime, "slant").asNumber()
              : SkFontStyle::Slant::kUpright_Slant);

      retVal.setFontStyle(SkFontStyle(weight, width, slant));
    }
    if (object.hasProperty(runtime, "foregroundColor")) {
      auto propValue = object.getProperty(runtime, "foregroundColor");
      SkPaint p;
      p.setColor(JsiSkColor::fromValue(runtime, propValue));
      retVal.setForegroundColor(p);
    }
    if (object.hasProperty(runtime, "heightMultiplier")) {
      auto propValue = object.getProperty(runtime, "heightMultiplier");
      retVal.setHeight(propValue.asNumber());
      retVal.setHeightOverride(true);
    }
    if (object.hasProperty(runtime, "halfLeading")) {
      auto propValue = object.getProperty(runtime, "halfLeading");
      retVal.setHalfLeading(propValue.asNumber());
    }
    if (object.hasProperty(runtime, "letterSpacing")) {
      auto propValue = object.getProperty(runtime, "letterSpacing");
      retVal.setLetterSpacing(propValue.asNumber());
    }
    if (object.hasProperty(runtime, "locale")) {
      auto propValue = object.getProperty(runtime, "locale");
      retVal.setLocale(SkString(propValue.asString(runtime).utf8(runtime)));
    }
    if (object.hasProperty(runtime, "shadows")) {
      auto propValue = object.getProperty(runtime, "shadows")
                           .asObject(runtime)
                           .asArray(runtime);
      auto size = propValue.size(runtime);
      retVal.resetShadows();
      for (size_t i = 0; i < size; ++i) {
        auto element = propValue.getValueAtIndex(runtime, i).asObject(runtime);
        auto color = element.hasProperty(runtime, "color")
                         ? JsiSkColor::fromValue(
                               runtime, element.getProperty(runtime, "color"))
                         : SK_ColorBLACK;
        SkPoint offset =
            element.hasProperty(runtime, "offset")
                ? *JsiSkPoint::fromValue(runtime,
                                         element.getProperty(runtime, "offset"))
                       .get()
                : SkPoint::Make(0, 0);
        auto blurSigma =
            element.hasProperty(runtime, "blurRadius")
                ? element.getProperty(runtime, "blurRadius").asNumber()
                : 0;
        retVal.addShadow(para::TextShadow(color, offset, blurSigma));
      }
    }
    if (object.hasProperty(runtime, "textBaseline")) {
      auto propValue = object.getProperty(runtime, "textBaseline");
      retVal.setTextBaseline(
          static_cast<para::TextBaseline>(propValue.asNumber()));
    }

    return retVal;
  }
};

} // namespace RNSkia
