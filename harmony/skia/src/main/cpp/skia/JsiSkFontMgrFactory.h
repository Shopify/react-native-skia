#pragma once

#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFontMgr.h"
#include "include/ports/SkFontMgr_data.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkFontMgrFactory : public JsiSkHostObject {
public:
  static sk_sp<SkFontMgr>
  getFontMgr(std::shared_ptr<RNSkPlatformContext> context) {
    static SkOnce once;
    static sk_sp<SkFontMgr> fontMgr;
    once([&context] { fontMgr = context->createFontMgr(); });
    return fontMgr;
  }

  JSI_HOST_FUNCTION(System) {
    auto fontMgr = JsiSkFontMgrFactory::getFontMgr(getContext());
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkFontMgr>(getContext(), fontMgr));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkFontMgrFactory, System))

  explicit JsiSkFontMgrFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
