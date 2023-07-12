#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "RNSkLog.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkFont.h"
#include "SkTypeface.h"
#include "include/TypefaceFontProvider.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;
namespace para = skia::textlayout;

class JsiSkTypefaceFontProvider : public JsiSkWrappingSkPtrHostObject<para::TypefaceFontProvider> {
public:
  EXPORT_JSI_API_TYPENAME(JsiSkTypefaceFontProvider, "TypefaceFontProvider")
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTypefaceFontProvider, dispose))

  JsiSkTypefaceFontProvider(std::shared_ptr<RNSkPlatformContext> context,
                sk_sp<para::TypefaceFontProvider> typeface)
      : JsiSkWrappingSkPtrHostObject(std::move(context), std::move(typeface)) {}

  /**
   Returns the jsi object from a host object of this type
  */
  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            sk_sp<para::TypefaceFontProvider> tf) {
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkTypefaceFontProvider>(std::move(context), std::move(tf)));
  }
};

} // namespace RNSkia
