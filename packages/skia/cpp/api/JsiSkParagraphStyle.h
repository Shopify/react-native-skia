#pragma once

#include <codecvt>
#include <locale>
#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkStrutStyle.h"
#include "JsiSkTextStyle.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "modules/skparagraph/include/Paragraph.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

namespace para = skia::textlayout;

/**
 Implementation of the ParagraphStyle object in JSI
 */
class JsiSkParagraphStyle {
public:
  /**
   disableHinting?: boolean;
   ellipsis?: string;
   heightMultiplier?: number;
   maxLines?: number;
   replaceTabCharacters?: boolean;
   strutStyle?: SkStrutStyle;
   textAlign?: SkTextAlign;
   textDirection?: SkTextDirection;
   textHeightBehavior?: SkTextHeightBehavior;
   textStyle?: SkTextStyle;
   */
  static para::ParagraphStyle fromValue(jsi::Runtime &runtime,
                                        const jsi::Value &value) {
    para::ParagraphStyle retVal;

    // Accept undefined && null
    if (value.isUndefined() || value.isNull()) {
      return retVal;
    }

    // Read values from the argument - expected to be a ParagraphStyle shaped
    // object
    if (!value.isObject()) {
      throw jsi::JSError(runtime, "Expected SkParagrahStyle as first argument");
    }

    auto object = value.asObject(runtime);

    if (object.hasProperty(runtime, "disableHinting")) {
      auto propValue = object.getProperty(runtime, "disableHinting");
      if (asBool(runtime, propValue)) {
        retVal.turnHintingOff();
      }
    }
    if (object.hasProperty(runtime, "ellipsis")) {
      auto propValue = object.getProperty(runtime, "ellipsis");
      auto inStr = propValue.asString(runtime).utf8(runtime);
      std::u16string uStr;
      fromUTF8(inStr, uStr);
      retVal.setEllipsis(uStr);
    }
    if (object.hasProperty(runtime, "heightMultiplier")) {
      auto propValue = object.getProperty(runtime, "heightMultiplier");
      retVal.setHeight(propValue.asNumber());
    }
    if (object.hasProperty(runtime, "maxLines")) {
      auto propValue = object.getProperty(runtime, "maxLines");
      if (propValue.asNumber() != 0) {
        retVal.setMaxLines(propValue.asNumber());
      }
    }
    if (object.hasProperty(runtime, "replaceTabCharacters")) {
      auto propValue = object.getProperty(runtime, "replaceTabCharacters");
      retVal.setReplaceTabCharacters(asBool(runtime, propValue));
    }
    if (object.hasProperty(runtime, "textAlign")) {
      auto propValue = object.getProperty(runtime, "textAlign");
      retVal.setTextAlign(static_cast<para::TextAlign>(propValue.asNumber()));
    }
    if (object.hasProperty(runtime, "textDirection")) {
      auto propValue = object.getProperty(runtime, "textDirection");
      retVal.setTextDirection(
          static_cast<para::TextDirection>(propValue.asNumber()));
    }
    if (object.hasProperty(runtime, "textHeightBehavior")) {
      auto propValue = object.getProperty(runtime, "textHeightBehavior");
      retVal.setTextHeightBehavior(
          static_cast<para::TextHeightBehavior>(propValue.asNumber()));
    }
    if (object.hasProperty(runtime, "strutStyle")) {
      auto propValue = object.getProperty(runtime, "strutStyle");
      retVal.setStrutStyle(JsiSkStrutStyle::fromValue(runtime, propValue));
    }
    if (object.hasProperty(runtime, "textStyle")) {
      auto propValue = object.getProperty(runtime, "textStyle");
      retVal.setTextStyle(JsiSkTextStyle::fromValue(runtime, propValue));
    }

    return retVal;
  }

private:
  template <typename T>
  static void fromUTF8(
      const std::string &source,
      std::basic_string<T, std::char_traits<T>, std::allocator<T>> &result) {
    std::wstring_convert<std::codecvt_utf8_utf16<T>, T> convertor;
    result = convertor.from_bytes(source);
  }
};

} // namespace RNSkia
