#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include <JsiSkFont.h>
#include <JsiSkFontStyle.h>
#include <JsiSkHostObjects.h>
#include <JsiSkPaint.h>

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
 Implementation of the TextStyle object in JSI for the paragraph builder
 */
class JsiSkTextStyle : public JsiSkWrappingSharedPtrHostObject<TextStyle> {
public:
  JSI_HOST_FUNCTION(setColor) {
    SkColor color = JsiSkColor::fromValue(runtime, arguments[0]);
    getObject()->setColor(color);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setFontSize) {
    getObject()->setFontSize(getArgumentAsNumber(runtime, arguments, count, 0));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setFontWeight) {
    auto current = getObject()->getFontStyle();
    getObject()->setFontStyle(
        SkFontStyle(static_cast<SkFontStyle::Weight>(
                        getArgumentAsNumber(runtime, arguments, count, 0)),
                    current.width(), current.slant()));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setFontSlant) {
    auto current = getObject()->getFontStyle();
    getObject()->setFontStyle(
        SkFontStyle(current.weight(), current.width(),
                    static_cast<SkFontStyle::Slant>(
                        getArgumentAsNumber(runtime, arguments, count, 0))));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setFontWidth) {
    auto current = getObject()->getFontStyle();
    getObject()->setFontStyle(
        SkFontStyle(current.weight(),
                    static_cast<SkFontStyle::Weight>(
                        getArgumentAsNumber(runtime, arguments, count, 0)),
                    current.slant()));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setFontStyle) {
    auto style = JsiSkFontStyle::fromValue(
        runtime, getArgumentAsObject(runtime, arguments, count, 0));
    getObject()->setFontStyle(*style.get());
    return thisValue.asObject(runtime);
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
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setForegroundPaint) {
    auto paint =
        getArgumentAsHostObject<JsiSkPaint>(runtime, arguments, count, 0);
    getObject()->setForegroundPaint(*paint->getObject().get());
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setBackgroundPaint) {
    auto paint =
        getArgumentAsHostObject<JsiSkPaint>(runtime, arguments, count, 0);
    getObject()->setBackgroundPaint(*paint->getObject().get());
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setLetterSpacing) {
    getObject()->setLetterSpacing(
        getArgumentAsNumber(runtime, arguments, count, 0));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setWordSpacing) {
    getObject()->setWordSpacing(
        getArgumentAsNumber(runtime, arguments, count, 0));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setBaselineShift) {
    getObject()->setBaselineShift(
        getArgumentAsNumber(runtime, arguments, count, 0));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setHeight) {
    getObject()->setHeight(getArgumentAsNumber(runtime, arguments, count, 0));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setHeightOverride) {
    getObject()->setHeightOverride(
        getArgumentAsNumber(runtime, arguments, count, 0));
    return thisValue.asObject(runtime);
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTextStyle, setColor),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontSize),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontStyle),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontWeight),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontSlant),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontWidth),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontFamilies),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setForegroundPaint),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setBackgroundPaint),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setLetterSpacing),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setWordSpacing),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setHeight),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setHeightOverride),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setBaselineShift))

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
