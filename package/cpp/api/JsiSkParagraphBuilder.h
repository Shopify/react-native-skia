#pragma once

#include <utility>
#include <memory>

#include <jsi/jsi.h>

#include <JsiSkHostObjects.h>
#include <JsiSkFont.h>
#include <JsiSkFontMgr.h>
#include <JsiSkParagraph.h>
#include <JsiSkParagraphStyle.h>
#include <JsiSkTextStyle.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "ParagraphBuilder.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

using namespace skia::textlayout; // NOLINT

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

  JSI_HOST_FUNCTION(reset) {
    _builder->Reset();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(addText) {
    auto text = getArgumentAsString(runtime, arguments, count, 0).utf8(runtime);
    _builder->addText(text.c_str());
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(pushStyle) {
    auto textStyle =
        getArgumentAsHostObject<JsiSkTextStyle>(runtime, arguments, count, 0);
    _builder->pushStyle(*textStyle->getObject().get());
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(pop) {
    _builder->pop();
    return thisValue.asObject(runtime);
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphBuilder, build),
                       JSI_EXPORT_FUNC(JsiSkParagraphBuilder, reset),
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
