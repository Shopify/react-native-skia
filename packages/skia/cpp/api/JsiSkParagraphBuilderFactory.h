#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkNativeObjects.h"
#include "JsiSkParagraphBuilder.h"
#include "JsiSkParagraphStyle.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "modules/skparagraph/include/ParagraphBuilder.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

namespace para = skia::textlayout;

/**
 Implementation of the ParagraphBuilderFactory for making ParagraphBuilder JSI
 object
 */
class JsiSkParagraphBuilderFactory
    : public JsiSkNativeObject<JsiSkParagraphBuilderFactory> {
public:
  static constexpr const char *CLASS_NAME = "ParagraphBuilderFactory";

  JSI_HOST_FUNCTION(Make) {
    // Get paragraph style from params
    auto paragraphStyle =
        count > 0 ? JsiSkParagraphStyle::fromValue(runtime, arguments[0])
                  : para::ParagraphStyle();

    // get font manager
    auto fontMgr =
        count > 1 ? JsiSkTypefaceFontProvider::fromValue(runtime, arguments[1])
                  : nullptr;

    // Create the paragraph builder
    return makeJsiObject(runtime, std::make_shared<JsiSkParagraphBuilder>(
                                      getContext(), paragraphStyle, fontMgr));
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installHostMethod(runtime, prototype, "Make",
                      &JsiSkParagraphBuilderFactory::Make);
  }

  size_t getMemoryPressure() override { return 1024 * 1024; }

  explicit JsiSkParagraphBuilderFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkParagraphBuilderFactory>(std::move(context)) {}
};

} // namespace RNSkia
