#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkFontStyle.h"
#include "JsiSkHostObjects.h"
#include "RNSkLog.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkFontMgr.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

inline int32_t get_first_codepoint(const std::string &str) {
  int32_t codepoint = 0;
  int count = 0;
  for (char c : str) {
    if (count == 0) {
      if ((c & 0b10000000) == 0) {
        codepoint = c;
        break;
      } else if ((c & 0b11100000) == 0b11000000) {
        codepoint = c & 0b00011111;
        count = 1;
      } else if ((c & 0b11110000) == 0b11100000) {
        codepoint = c & 0b00001111;
        count = 2;
      } else if ((c & 0b11111000) == 0b11110000) {
        codepoint = c & 0b00000111;
        count = 3;
      } else {
        // Invalid UTF-8 sequence
        break;
      }
    } else {
      if ((c & 0b11000000) != 0b10000000) {
        // Invalid UTF-8 sequence
        break;
      }
      codepoint = (codepoint << 6) | (c & 0b00111111);
      count--;
    }
  }
  if (count != 0) {
    // Incomplete UTF-8 sequence
    codepoint = -1;
  }
  return codepoint;
}

class JsiSkFontMgr : public JsiSkWrappingSkPtrHostObject<SkFontMgr> {
public:
  EXPORT_JSI_API_TYPENAME(JsiSkFontMgr, FontMgr)

  JsiSkFontMgr(std::shared_ptr<RNSkPlatformContext> context,
               sk_sp<SkFontMgr> fontMgr)
      : JsiSkWrappingSkPtrHostObject(std::move(context), fontMgr) {}

  JSI_HOST_FUNCTION(countFamilies) { return getObject()->countFamilies(); }

  JSI_HOST_FUNCTION(getFamilyName) {
    auto i = static_cast<int>(arguments[0].asNumber());
    SkString name;
    getObject()->getFamilyName(i, &name);
    return jsi::String::createFromUtf8(runtime, name.c_str());
  }

  JSI_HOST_FUNCTION(matchFamilyStyle) {
    auto name = arguments[0].asString(runtime).utf8(runtime);
    auto fontStyle = JsiSkFontStyle::fromValue(runtime, arguments[1]);
    auto typeface = getObject()->matchFamilyStyle(name.c_str(), *fontStyle);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkTypeface>(getContext(), typeface));
  }

  JSI_HOST_FUNCTION(matchFamilyStyleChar) {
    auto utf8str = arguments[0].asString(runtime).utf8(runtime);
    auto strArg = get_first_codepoint(utf8str);
    auto typeface = getObject()->matchFamilyStyleCharacter(
        nullptr, SkFontStyle(), nullptr, 0, strArg);
    if (typeface == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkTypeface>(getContext(), typeface));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkFontMgr, countFamilies),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, getFamilyName),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, matchFamilyStyle),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, matchFamilyStyleChar))
};

} // namespace RNSkia
