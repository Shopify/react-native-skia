#pragma once

#include <memory>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

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
 Implementation of the TextStyle object in JSI for the paragraph builder
 */
class JsiSkTextStyle : public JsiSkWrappingSharedPtrHostObject<TextStyle> {
public:
  JSI_API_TYPENAME("TextStyle");

  JSI_HOST_FUNCTION(setDecorationType) {
    getObject()->setDecoration(static_cast<TextDecoration>(
        getArgumentAsNumber(runtime, arguments, count, 0)));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setDecorationColor) {
    SkColor color = JsiSkColor::fromValue(runtime, arguments[0]);
    getObject()->setDecorationColor(color);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setDecorationThickness) {
    getObject()->setDecorationThicknessMultiplier(
        static_cast<double>(getArgumentAsNumber(runtime, arguments, count, 0)));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setDecorationStyle) {
    getObject()->setDecorationStyle(static_cast<TextDecorationStyle>(
        getArgumentAsNumber(runtime, arguments, count, 0)));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(getDecorationType) {
    return static_cast<double>(getObject()->getDecorationType());
  }

  JSI_HOST_FUNCTION(getDecorationColor) {
    return JsiSkColor::toValue(runtime, getObject()->getDecorationColor());
  }

  JSI_HOST_FUNCTION(getDecorationThickness) {
    return static_cast<double>(getObject()->getDecorationThicknessMultiplier());
  }

  JSI_HOST_FUNCTION(getDecorationStyle) {
    return static_cast<double>(getObject()->getDecorationStyle());
  }

  JSI_HOST_FUNCTION(setColor) {
    SkColor color = JsiSkColor::fromValue(runtime, arguments[0]);
    getObject()->setColor(color);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(setBackgroundColor) {
    SkColor color = JsiSkColor::fromValue(runtime, arguments[0]);
    SkPaint p;
    p.setColor(color);
    getObject()->setBackgroundPaint(p);
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

  JSI_HOST_FUNCTION(setShadows) {
    auto jsiShadows = getArgumentAsArray(runtime, arguments, count, 0);

    getObject()->resetShadows();
    size_t size = jsiShadows.size(runtime);

    for (size_t i = 0; i < size; ++i) {
      auto shadow = jsiShadows.getValueAtIndex(runtime, i).asObject(runtime);
      auto color = shadow.hasProperty(runtime, "color")
                       ? JsiSkColor::fromValue(
                             runtime, shadow.getProperty(runtime, "color"))
                       : SK_ColorBLACK;

      auto offset = shadow.hasProperty(runtime, "offset")
                        ? *JsiSkPoint::fromValue(
                               runtime, shadow.getProperty(runtime, "offset"))
                               .get()
                        : SkPoint::Make(0, 0);

      double blur = shadow.hasProperty(runtime, "blurRadius")
                        ? shadow.getProperty(runtime, "blurRadius").asNumber()
                        : 0;
      getObject()->addShadow(TextShadow(color, offset, blur));
    }

    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(getShadows) {
    auto shadows = getObject()->getShadows();
    size_t size = shadows.size();
    auto retVal = jsi::Array(runtime, size);
    for (size_t i = 0; i < size; ++i) {
      auto shadow = jsi::Object(runtime);
      shadow.setProperty(runtime, "color",
                         JsiSkColor::toValue(runtime, shadows[i].fColor));
      shadow.setProperty(
          runtime, "offset",
          JsiSkPoint::toValue(runtime, getContext(), shadows[i].fOffset));
      shadow.setProperty(runtime, "blur", shadows[i].fBlurSigma);
    }
    return retVal;
  }

  JSI_HOST_FUNCTION(getColor) {
    return JsiSkColor::toValue(runtime, getObject()->getColor());
  }

  JSI_HOST_FUNCTION(getBackgroundColor) {
    return JsiSkColor::toValue(runtime,
                               getObject()->getBackground().getColor());
  }

  JSI_HOST_FUNCTION(getFontSize) {
    return static_cast<double>(getObject()->getFontSize());
  }

  JSI_HOST_FUNCTION(getFontWeight) {
    return getObject()->getFontStyle().weight();
  }

  JSI_HOST_FUNCTION(getFontSlant) {
    return static_cast<double>(getObject()->getFontStyle().slant());
  }

  JSI_HOST_FUNCTION(getFontWidth) {
    return static_cast<double>(getObject()->getFontStyle().width());
  }

  JSI_HOST_FUNCTION(getFontFamilies) {
    auto fontFamilies = getObject()->getFontFamilies();
    auto size = fontFamilies.size();
    auto jsiFontFamilies = jsi::Array(runtime, size);

    for (size_t i = 0; i < size; ++i) {
      jsiFontFamilies.setValueAtIndex(
          runtime, i,
          jsi::String::createFromUtf8(runtime, fontFamilies[i].c_str()));
    }
    return jsiFontFamilies;
  }

  JSI_HOST_FUNCTION(getLetterSpacing) {
    return static_cast<double>(getObject()->getLetterSpacing());
  }

  JSI_HOST_FUNCTION(getWordSpacing) {
    return static_cast<double>(getObject()->getWordSpacing());
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTextStyle, setShadows),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setDecorationType),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setDecorationThickness),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setDecorationColor),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setDecorationStyle),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setColor),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setBackgroundColor),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontSize),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontWeight),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontSlant),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontWidth),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setFontFamilies),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setLetterSpacing),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, setWordSpacing),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getShadows),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getColor),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getBackgroundColor),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getFontSize),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getFontWeight),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getFontSlant),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getFontWidth),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getFontFamilies),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getLetterSpacing),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getWordSpacing),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getDecorationType),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getDecorationThickness),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getDecorationColor),
                       JSI_EXPORT_FUNC(JsiSkTextStyle, getDecorationStyle))

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
