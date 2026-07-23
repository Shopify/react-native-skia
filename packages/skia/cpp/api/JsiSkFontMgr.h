#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkFontStyle.h"
#include "JsiSkNativeObjects.h"
#include "utils/RNSkLog.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFontMgr.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkFontMgr
    : public JsiSkWrappingSkPtrNativeObject<JsiSkFontMgr, SkFontMgr> {
public:
  static constexpr const char *CLASS_NAME = "FontMgr";

  JsiSkFontMgr(std::shared_ptr<RNSkPlatformContext> context,
               sk_sp<SkFontMgr> fontMgr)
      : JsiSkWrappingSkPtrNativeObject<JsiSkFontMgr, SkFontMgr>(context,
                                                                fontMgr),
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
    return makeJsiObject(runtime, std::make_shared<JsiSkTypeface>(
                                      getContext(), std::move(typeface)));
  }

  size_t getMemoryPressure() override { return 2048; }

  static sk_sp<SkFontMgr> fromValue(jsi::Runtime &runtime,
                                    const jsi::Value &obj) {
    return objectFromValue(runtime, obj);
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "countFamilies",
                      &JsiSkFontMgr::countFamilies);
    installHostMethod(runtime, prototype, "getFamilyName",
                      &JsiSkFontMgr::getFamilyName);
    installHostMethod(runtime, prototype, "matchFamilyStyle",
                      &JsiSkFontMgr::matchFamilyStyle);
  }

private:
  std::vector<std::string> _systemFontFamilies;
};

} // namespace RNSkia
