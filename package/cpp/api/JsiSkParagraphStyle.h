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

} // namespace RNSkia
