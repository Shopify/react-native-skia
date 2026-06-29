#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkFontStyle.h"
#include "JsiSkHostObjects.h"
#include "JsiSkTypeface.h"
#include "RNSkLog.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFontMgr.h"
#include "include/core/SkFontStyle.h"
#include "include/core/SkString.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkFontStyleSet : public JsiSkWrappingSkPtrHostObject<SkFontStyleSet> {
public:
  EXPORT_JSI_API_TYPENAME(JsiSkFontStyleSet, FontStyleSet)

  JsiSkFontStyleSet(std::shared_ptr<RNSkPlatformContext> context,
                    sk_sp<SkFontStyleSet> fontStyleSet)
      : JsiSkWrappingSkPtrHostObject(std::move(context),
                                     std::move(fontStyleSet)) {}

  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            sk_sp<SkFontStyleSet> styleSet) {
    auto hostObjectInstance =
        std::make_shared<JsiSkFontStyleSet>(context, std::move(styleSet));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, context);
  }

  JSI_HOST_FUNCTION(count) { return getObject()->count(); }

  JSI_HOST_FUNCTION(getStyle) {
    auto index = static_cast<int>(arguments[0].asNumber());
    auto styleCount = getObject()->count();
    if (index < 0 || index >= styleCount) {
      throw jsi::JSError(runtime, "FontStyleSet.getStyle: index out of bounds");
    }
    SkFontStyle style;
    SkString name;
    getObject()->getStyle(index, &style, &name);
    auto result = jsi::Object(runtime);
    result.setProperty(runtime, "weight", jsi::Value(style.weight()));
    result.setProperty(runtime, "width", jsi::Value(style.width()));
    result.setProperty(runtime, "slant",
                       jsi::Value(static_cast<int>(style.slant())));
    result.setProperty(runtime, "name",
                       jsi::String::createFromUtf8(runtime, name.c_str()));
    return result;
  }

  JSI_HOST_FUNCTION(createTypeface) {
    auto index = static_cast<int>(arguments[0].asNumber());
    auto typeface = getObject()->createTypeface(index);
    if (!typeface) {
      return jsi::Value::null();
    }
    return JsiSkTypeface::toValue(runtime, getContext(), std::move(typeface));
  }

  JSI_HOST_FUNCTION(matchStyle) {
    auto fontStyle = JsiSkFontStyle::fromValue(runtime, arguments[0]);
    auto typeface = getObject()->matchStyle(*fontStyle);
    if (!typeface) {
      return jsi::Value::null();
    }
    return JsiSkTypeface::toValue(runtime, getContext(), std::move(typeface));
  }

  size_t getMemoryPressure() const override { return 2048; }

  std::string getObjectType() const override { return "JsiSkFontStyleSet"; }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkFontStyleSet, count),
                       JSI_EXPORT_FUNC(JsiSkFontStyleSet, getStyle),
                       JSI_EXPORT_FUNC(JsiSkFontStyleSet, createTypeface),
                       JSI_EXPORT_FUNC(JsiSkFontStyleSet, matchStyle),
                       JSI_EXPORT_FUNC(JsiSkFontStyleSet, dispose))
};

} // namespace RNSkia
