#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkFontStyle.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkFontStyle : public JsiSkWrappingSharedPtrHostObject<SkFontStyle> {
public:
  JSI_API_TYPENAME("FontStyle");

  JsiSkFontStyle(std::shared_ptr<RNSkPlatformContext> context,
                 const SkFontStyle &fontStyle)
      : JsiSkWrappingSharedPtrHostObject<SkFontStyle>(
            std::move(context), std::make_shared<SkFontStyle>(fontStyle)) {}

  /**
  Returns the underlying object from a host object of this type
 */
  static std::shared_ptr<SkFontStyle> fromValue(jsi::Runtime &runtime,
                                                const jsi::Value &obj) {
    const auto &object = obj.asObject(runtime);
    if (object.isHostObject(runtime)) {
      return object.asHostObject<JsiSkFontStyle>(runtime)->getObject();
    } else {
      auto weight =
          static_cast<int>(object.getProperty(runtime, "weight").asNumber());
      auto width =
          static_cast<int>(object.getProperty(runtime, "width").asNumber());
      auto slant = static_cast<SkFontStyle::Slant>(
          object.getProperty(runtime, "slant").asNumber());
      SkFontStyle style(weight, width, slant);
      return std::make_shared<SkFontStyle>(style);
    }
  }

  /**
  Returns the jsi object from a host object of this type
 */
  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            const SkFontStyle &fontStyle) {
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkFontStyle>(std::move(context), fontStyle));
  }
};
} // namespace RNSkia