#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkHostObjects.h"
#include "RNSkLog.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkFontMgr.h"

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
    SkFontStyle normalStyle(SkFontStyle::kNormal_Weight,
                            SkFontStyle::kNormal_Width,
                            SkFontStyle::kUpright_Slant);
    auto typeface = getObject()->matchFamilyStyle(name.c_str(), normalStyle);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkTypeface>(getContext(), typeface));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkFontMgr, countFamilies),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, getFamilyName),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, matchFamilyStyle))

  /**
   * Creates the function for construction a new instance of the SkFontMgr
   * wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the SkFontMgr
   * class
   */
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto fontMgr = context->getFontMgr();
      // Return the newly constructed object
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkFontMgr>(std::move(context), fontMgr));
    };
  }
};

} // namespace RNSkia
