#pragma once

#include <memory>
#include <utility>
#include <numeric>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkData.h"
#include "JsiSkHostObjects.h"
#include "JsiSkTypeface.h"


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


namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkTypefaceFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeTypefaceWithChar) {
   auto fontMgr = JsiSkFontMgrFactory::getFontMgr(getContext());
   auto utf8str = arguments[0].asString(runtime).utf8(runtime);
   auto strArg = get_first_codepoint(utf8str);
   sk_sp<SkTypeface> typeface(fontMgr->matchFamilyStyleCharacter(
       nullptr, SkFontStyle(), nullptr, 0, strArg));
   if (typeface == nullptr) {
     return jsi::Value::null();
   }
   return jsi::Object::createFromHostObject(
       runtime, std::make_shared<JsiSkTypeface>(getContext(), typeface));
  }

  JSI_HOST_FUNCTION(MakeFreeTypeFaceFromData) {
    auto data = JsiSkData::fromValue(runtime, arguments[0]);
    auto fontMgr = JsiSkFontMgrFactory::getFontMgr(getContext());
    auto typeface = fontMgr->makeFromData(std::move(data));
    if (typeface == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkTypeface>(getContext(), typeface));
  }

  JSI_EXPORT_FUNCTIONS(
    JSI_EXPORT_FUNC(JsiSkTypefaceFactory, MakeFreeTypeFaceFromData),
    JSI_EXPORT_FUNC(JsiSkTypefaceFactory, MakeTypefaceWithChar))

  explicit JsiSkTypefaceFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
