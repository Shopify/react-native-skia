#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkFontStyle.h"
#include "JsiSkFontStyleSet.h"
#include "JsiSkHostObjects.h"
#include "RNSkLog.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFontMgr.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkFontMgr : public JsiSkWrappingSkPtrHostObject<SkFontMgr> {
public:
  EXPORT_JSI_API_TYPENAME(JsiSkFontMgr, FontMgr)

  JsiSkFontMgr(std::shared_ptr<RNSkPlatformContext> context,
               sk_sp<SkFontMgr> fontMgr)
      : JsiSkWrappingSkPtrHostObject(context, fontMgr),
        _systemFontFamilies(context->getSystemFontFamilies()) {}

  JSI_HOST_FUNCTION(countFamilies) {
    return static_cast<int>(getObject()->countFamilies() +
                            _systemFontFamilies.size());
  }

  JSI_HOST_FUNCTION(getFamilyName) {
    auto i = static_cast<int>(arguments[0].asNumber());
    auto baseFamilyCount = getObject()->countFamilies();
    if (i < baseFamilyCount) {
      SkString name;
      getObject()->getFamilyName(i, &name);
      return jsi::String::createFromUtf8(runtime, name.c_str());
    }
    auto systemIndex = i - baseFamilyCount;
    if (systemIndex < static_cast<int>(_systemFontFamilies.size())) {
      return jsi::String::createFromUtf8(runtime,
                                         _systemFontFamilies[systemIndex]);
    }
    throw jsi::JSError(
        runtime,
        "Font family index out of bounds: " + std::to_string(i) +
            " (total families: " +
            std::to_string(baseFamilyCount + _systemFontFamilies.size()) + ")");
  }

  JSI_HOST_FUNCTION(matchFamilyStyle) {
    auto name = arguments[0].asString(runtime).utf8(runtime);
    // Resolve font family aliases (e.g., "System" -> ".AppleSystemUIFont" on
    // iOS)
    auto resolvedName = getContext()->resolveFontFamily(name);
    auto fontStyle = JsiSkFontStyle::fromValue(runtime, arguments[1]);
    auto typeface =
        getObject()->matchFamilyStyle(resolvedName.c_str(), *fontStyle);
    auto hostObjectInstance =
        std::make_shared<JsiSkTypeface>(getContext(), std::move(typeface));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(createStyleSet) {
    auto index = static_cast<int>(arguments[0].asNumber());
    auto styleSet = getObject()->createStyleSet(index);
    if (!styleSet) {
      return jsi::Value::null();
    }
    return JsiSkFontStyleSet::toValue(runtime, getContext(), std::move(styleSet));
  }

  JSI_HOST_FUNCTION(matchFamily) {
    auto name = arguments[0].asString(runtime).utf8(runtime);
    auto resolvedName = getContext()->resolveFontFamily(name);
    auto styleSet = getObject()->matchFamily(resolvedName.c_str());
    if (!styleSet) {
      return jsi::Value::null();
    }
    return JsiSkFontStyleSet::toValue(runtime, getContext(), std::move(styleSet));
  }

  size_t getMemoryPressure() const override { return 2048; }

  std::string getObjectType() const override { return "JsiSkFontMgr"; }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkFontMgr, countFamilies),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, getFamilyName),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, matchFamilyStyle),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, createStyleSet),
                       JSI_EXPORT_FUNC(JsiSkFontMgr, matchFamily))

private:
  std::vector<std::string> _systemFontFamilies;
};

} // namespace RNSkia
