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
//#include "SkString.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkFontMgr : public JsiSkWrappingSkPtrHostObject<SkFontMgr> {
public:
  EXPORT_JSI_API_TYPENAME(JsiSkFontMgr, "FontMgr")

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

  // JSI_HOST_FUNCTION(matchFamily) {
  //   auto name = arguments[0].asString(runtime).utf8(runtime);
  //   auto fontStyleSet = getObject()->matchFamily(name.c_str());
  //   int setSize = fontStyleSet->count();
  //   jsi::Array resultArray = jsi::Array(runtime, setSize);

  //   for (int i = 0; i < setSize; i++) {
  //     SkFontStyle skStyle;
  //     SkString skStringStyle;

  //     fontStyleSet->getStyle(i, &skStyle, &skStringStyle);

  //     // Convert SkFontStyle and SkString to jsi::Object.
  //     jsi::Object jsStyleObj(runtime);
  //     jsStyleObj.setProperty(runtime, "weight",
  //                            jsi::Value(static_cast<int>(skStyle.weight())));
  //     jsStyleObj.setProperty(runtime, "width",
  //                            jsi::Value(static_cast<int>(skStyle.width())));
  //     jsStyleObj.setProperty(runtime, "slant",
  //                            jsi::Value(static_cast<int>(skStyle.slant())));
  //     jsStyleObj.setProperty(
  //         runtime, "name",
  //         jsi::String::createFromUtf8(runtime, skStringStyle.c_str()));

  //     resultArray.setValueAtIndex(runtime, i, jsStyleObj);
  //   }

  //   return resultArray;
  // }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkFontMgr, countFamilies),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, getFamilyName),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, matchFamilyStyle))
};

} // namespace RNSkia
