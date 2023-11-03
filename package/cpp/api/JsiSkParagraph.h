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
 Implementation of the ParagraphStyle object in JSI
 */

class JsiSkParagraphStyle
    : public JsiSkWrappingSharedPtrHostObject<ParagraphStyle> {
public:
  explicit JsiSkParagraphStyle(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkWrappingSharedPtrHostObject(std::move(context),
                                         std::make_shared<ParagraphStyle>()) {}
};

/**
 Implementation of the Paragraph object in JSI
 */
class JsiSkParagraph : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(layout) {
    auto width = getArgumentAsNumber(runtime, arguments, count, 0);
    _paragraph->layout(width);
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraph, layout))

  explicit JsiSkParagraph(std::shared_ptr<RNSkPlatformContext> context,
                          ParagraphBuilder *paragraphBuilder)
      : JsiSkHostObject(std::move(context)) {
    _paragraph = paragraphBuilder->Build();
  }

  Paragraph *getParagraph() { return _paragraph.get(); }

private:
  std::unique_ptr<Paragraph> _paragraph;
};

/**
 Implementation of the ParagraphBuilder object in JSI
 */

class JsiSkParagraphBuilder : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(build) {
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkParagraph>(getContext(), _builder.get()));
  }

  JSI_HOST_FUNCTION(addText) {
    auto text = getArgumentAsString(runtime, arguments, count, 0).utf8(runtime);
    _builder->addText(text.c_str());
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(pushStyle) {
    auto textStyle =
        getArgumentAsHostObject<JsiSkTextStyle>(runtime, arguments, count, 0);
    _builder->pushStyle(*textStyle->getObject().get());
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(pop) {
    _builder->pop();
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphBuilder, build),
                       JSI_EXPORT_FUNC(JsiSkParagraphBuilder, addText),
                       JSI_EXPORT_FUNC(JsiSkParagraphBuilder, pushStyle),
                       JSI_EXPORT_FUNC(JsiSkParagraphBuilder, pop))

  explicit JsiSkParagraphBuilder(
      std::shared_ptr<RNSkPlatformContext> context,
      std::shared_ptr<JsiSkParagraphStyle> paragraphStyle,
      std::shared_ptr<JsiSkFontMgr> fontManager)
      : JsiSkHostObject(std::move(context)) {

    _fontCollection = sk_make_sp<FontCollection>();
    _fontCollection->setDefaultFontManager(fontManager->getObject());
    _fontCollection->enableFontFallback();

    _builder =
        ParagraphBuilder::make(*paragraphStyle->getObject(), _fontCollection);
  }

private:
  std::unique_ptr<ParagraphBuilder> _builder;
  sk_sp<FontCollection> _fontCollection;
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

/**
 Implementation of the ParagraphStyleFactory for making ParagraphStyle JSI
 objects
 */
class JsiSkParagraphStyleFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkParagraphStyle>(getContext()));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphStyleFactory, Make))

  explicit JsiSkParagraphStyleFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

/**
 Implementation of the ParagraphBuilderFactory for making ParagraphBuilder JSI
 object
 */
class JsiSkParagraphBuilderFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    if (count != 2) {
      throw jsi::JSError(
          runtime,
          "Expected 2 arguments for the ParagraphBuilder::Make constructor");
    }

    // Get paragraph style from params
    auto paragraphStyle = getArgumentAsHostObject<JsiSkParagraphStyle>(
        runtime, arguments, count, 0);

    // get font manager
    auto fontMgr =
        getArgumentAsHostObject<JsiSkFontMgr>(runtime, arguments, count, 1);

    // Create the paragraph builder
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkParagraphBuilder>(
                     getContext(), paragraphStyle, fontMgr));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphBuilderFactory, Make))

  explicit JsiSkParagraphBuilderFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
