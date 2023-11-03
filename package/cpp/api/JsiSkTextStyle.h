#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include <JsiSkFont.h>
#include <JsiSkFontMgr.h>
#include <JsiSkHostObjects.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "Paragraph.h"
#include "ParagraphBuilder.h"
#include "ParagraphStyle.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

using namespace skia::textlayout; // NOLINT

/**
 Implementation of the TextStyle object in JSI
 */
class JsiSkTextStyle : public JsiSkWrappingSharedPtrHostObject<TextStyle> {
public:
  JSI_HOST_FUNCTION(setFontSize) {
    getObject()->setFontSize(getArgumentAsNumber(runtime, arguments, count, 0));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setColor) {
    SkColor color = JsiSkColor::fromValue(runtime, arguments[0]);
    getObject()->setColor(color);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setFontFamilies) {
    auto jsiFontFamilies = getArgumentAsArray(runtime, arguments, count, 0);
    std::vector<SkString> fontFamilies;
    auto size = jsiFontFamilies.size(runtime);
    fontFamilies.resize(size);
    for (size_t i = 0; i < size; ++i) {
      auto string = jsiFontFamilies.getValueAtIndex(runtime, i)
                        .asString(runtime)
                        .utf8(runtime);
      fontFamilies[i] = SkString(string);
    }
    getObject()->setFontFamilies(fontFamilies);
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTextStyle, setFontSize),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setColor),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontFamilies))

  explicit JsiSkTextStyle(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkWrappingSharedPtrHostObject(std::move(context),
                                         std::make_shared<TextStyle>()) {}
};

/**
 Implementation of the TextStyleFactory for making TextStyle JSI objects
 */
class JsiSkTextStyleFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkTextStyle>(getContext()));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTextStyleFactory, Make))

  explicit JsiSkTextStyleFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
