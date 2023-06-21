#pragma once

#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkFont.h"
#include "JsiSkHostObjects.h"
#include "JsiSkRSXform.h"
#include "JsiSkTextBlob.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkTextBlob.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkFontMgrFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeFromData) {
    throw jsi::JSError(
        runtime, "FontMgrFactory::MakeFromData is only implemented on Web.");
  }

  JSI_HOST_FUNCTION(getInstance) {
    auto context = getContext();
    // Use a static local variable to store the singleton instance.
    static sk_sp<SkFontMgr> fontMgr = context->getFontMgr();
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkFontMgr>(std::move(context), fontMgr));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkFontMgrFactory, MakeFromData),
                       JSI_EXPORT_FUNC(JsiSkFontMgrFactory, getInstance))

  explicit JsiSkFontMgrFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
