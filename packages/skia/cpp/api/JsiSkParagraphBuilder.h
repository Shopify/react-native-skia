#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkFont.h"
#include "JsiSkFontMgr.h"
#include "JsiSkFontMgrFactory.h"
#include "JsiSkNativeObjects.h"
#include "JsiSkParagraph.h"
#include "JsiSkParagraphStyle.h"
#include "JsiSkTextStyle.h"
#include "JsiSkTypefaceFontProvider.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "modules/skparagraph/include/ParagraphBuilder.h"

#ifdef __APPLE__
#include "modules/skunicode/include/SkUnicode_libgrapheme.h"
#else
#include "modules/skunicode/include/SkUnicode_icu.h"
#endif

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

namespace para = skia::textlayout;

/**
 Implementation of the ParagraphBuilder object in JSI
 */
class JsiSkParagraphBuilder : public JsiSkNativeObject<JsiSkParagraphBuilder> {
public:
  static constexpr const char *CLASS_NAME = "ParagraphBuilder";

  JSI_HOST_FUNCTION(build) {
    return makeJsiObject(runtime, std::make_shared<JsiSkParagraph>(
                                      getContext(), _builder.get()));
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

  JSI_HOST_FUNCTION(addPlaceholder) {
    auto width =
        count >= 1 ? getArgumentAsNumber(runtime, arguments, count, 0) : 0;
    auto height =
        count >= 2 ? getArgumentAsNumber(runtime, arguments, count, 1) : 0;
    auto alignment =
        count >= 3 ? static_cast<para::PlaceholderAlignment>(
                         getArgumentAsNumber(runtime, arguments, count, 2))
                   : para::PlaceholderAlignment::kBaseline;
    auto baseline = count >= 4
                        ? static_cast<para::TextBaseline>(
                              getArgumentAsNumber(runtime, arguments, count, 3))
                        : para::TextBaseline::kAlphabetic;
    auto offset =
        count >= 5 ? getArgumentAsNumber(runtime, arguments, count, 4) : 0;

    para::PlaceholderStyle style(width, height, alignment, baseline, offset);
    _builder->addPlaceholder(style);

    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(pushStyle) {
    auto textStyle = JsiSkTextStyle::fromValue(runtime, arguments[0]);
    // Foreground paint
    if (count >= 2) {
      auto foreground = tryGetJsiObject<JsiSkPaint>(
          runtime, getArgument(runtime, arguments, count, 1));
      if (foreground) {
        textStyle.setForegroundPaint(*foreground->getObject().get());
      }
    }
    // Background paint
    if (count >= 3) {
      auto background = tryGetJsiObject<JsiSkPaint>(
          runtime, getArgument(runtime, arguments, count, 2));
      if (background) {
        textStyle.setBackgroundPaint(*background->getObject().get());
      }
    }

    _builder->pushStyle(textStyle);

    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(pop) {
    _builder->pop();
    return thisValue.asObject(runtime);
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "build",
                      &JsiSkParagraphBuilder::build);
    installHostMethod(runtime, prototype, "reset",
                      &JsiSkParagraphBuilder::reset);
    installHostMethod(runtime, prototype, "addText",
                      &JsiSkParagraphBuilder::addText);
    installHostMethod(runtime, prototype, "addPlaceholder",
                      &JsiSkParagraphBuilder::addPlaceholder);
    installHostMethod(runtime, prototype, "pushStyle",
                      &JsiSkParagraphBuilder::pushStyle);
    installHostMethod(runtime, prototype, "pop", &JsiSkParagraphBuilder::pop);
  }

  size_t getMemoryPressure() override { return 1024 * 1024; }

  explicit JsiSkParagraphBuilder(std::shared_ptr<RNSkPlatformContext> context,
                                 para::ParagraphStyle paragraphStyle,
                                 sk_sp<SkFontMgr> fontManager)
      : JsiSkNativeObject<JsiSkParagraphBuilder>(std::move(context)) {
    _fontCollection = sk_make_sp<para::FontCollection>();
    auto fontMgr = JsiSkFontMgrFactory::getFontMgr(getContext());
    _fontCollection->setDefaultFontManager(fontMgr);
    if (fontManager != nullptr) {
      _fontCollection->setAssetFontManager(fontManager);
    }
    _fontCollection->enableFontFallback();
    sk_sp<SkUnicode> unicode;
#ifdef __APPLE__
    unicode = SkUnicodes::Libgrapheme::Make();
#else
    unicode = SkUnicodes::ICU::Make();
#endif
    _builder =
        para::ParagraphBuilder::make(paragraphStyle, _fontCollection, unicode);
  }

private:
  std::unique_ptr<para::ParagraphBuilder> _builder;
  sk_sp<para::FontCollection> _fontCollection;
};
} // namespace RNSkia
