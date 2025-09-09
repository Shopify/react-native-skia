#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

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
class JsiSkParagraphBuilderFactory : public JsiSkHostObject {
public:
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
    auto builder = std::make_shared<JsiSkParagraphBuilder>(
        getContext(), paragraphStyle, fontMgr);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, builder,
                                                       getContext());
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkParagraphBuilderFactory, Make))

  size_t getMemoryPressure() const override { return 3072; }

  explicit JsiSkParagraphBuilderFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
