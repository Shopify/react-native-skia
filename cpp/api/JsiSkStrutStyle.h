#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "modules/skparagraph/include/Paragraph.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

namespace para = skia::textlayout;

bool asBool(jsi::Runtime &runtime, const jsi::Value &value) {
  if (!value.isBool()) {
    throw jsi::JSError(runtime, "Expected boolean value");
  }
  return value.getBool();
}

/**
 Implementation of the TextStyle object in JSI for the paragraph builder
 */
class JsiSkStrutStyle {
public:
  static para::StrutStyle fromValue(jsi::Runtime &runtime,
                                    const jsi::Value &value) {
    // Read values from the argument - expected to be a TextStyle shaped object
    if (!value.isObject()) {
      throw jsi::JSError(runtime, "Expected SkStrutStyle as first argument");
    }
    /**
      strutEnabled?: boolean;
      fontFamilies?: string[];
      fontStyle?: SkTextFontStyle;
      fontSize?: number;
      heightMultiplier?: number;
      halfLeading?: boolean;
      leading?: number;
      forceStrutHeight?: boolean;
     */
    auto object = value.asObject(runtime);

    para::StrutStyle retVal;

    if (object.hasProperty(runtime, "strutEnabled")) {
      auto propValue = object.getProperty(runtime, "strutEnabled");
      retVal.setStrutEnabled(asBool(runtime, propValue));
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
    }

    if (object.hasProperty(runtime, "fontStyle")) {
      auto propValue = object.getProperty(runtime, "fontStyle");
      retVal.setFontStyle(*JsiSkFontStyle::fromValue(runtime, propValue).get());
    }
    if (object.hasProperty(runtime, "fontSize")) {
      auto propValue = object.getProperty(runtime, "fontSize");
      retVal.setFontSize(propValue.asNumber());
    }
    if (object.hasProperty(runtime, "heightMultiplier")) {
      auto propValue = object.getProperty(runtime, "heightMultiplier");
      retVal.setHeight(propValue.asNumber());
      retVal.setHeightOverride(true);
    }
    if (object.hasProperty(runtime, "halfLeading")) {
      auto propValue = object.getProperty(runtime, "halfLeading");
      retVal.setHalfLeading(asBool(runtime, propValue));
    }
    if (object.hasProperty(runtime, "leading")) {
      auto propValue = object.getProperty(runtime, "leading");
      retVal.setLeading(propValue.asNumber());
    }
    if (object.hasProperty(runtime, "forceStrutHeight")) {
      auto propValue = object.getProperty(runtime, "forceStrutHeight");
      retVal.setForceStrutHeight(asBool(runtime, propValue));
    }

    return retVal;
  }
};

} // namespace RNSkia
