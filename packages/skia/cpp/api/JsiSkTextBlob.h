#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkTextBlob.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkTextBlob : public JsiSkWrappingSkPtrHostObject<SkTextBlob> {
public:
  JsiSkTextBlob(std::shared_ptr<RNSkPlatformContext> context,
                sk_sp<SkTextBlob> shader)
      : JsiSkWrappingSkPtrHostObject<SkTextBlob>(std::move(context),
                                                 std::move(shader)) {}

  size_t getMemoryPressure() const override {
    auto textBlob = getObject();
    if (!textBlob)
      return 0;

    // For SkTextBlob, we'll estimate based on glyph data and text positioning
    // SkTextBlob doesn't provide direct size methods, so estimate
    // conservatively
    return textBlob->bounds().width() * textBlob->bounds().height() +
           1024; // Area estimation + base overhead
  }

  EXPORT_JSI_API_TYPENAME(JsiSkTextBlob, TextBlob)
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTextBlob, dispose))
};
} // namespace RNSkia
