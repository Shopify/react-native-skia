#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFontStyle.h"

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
      auto weightProp = object.getProperty(runtime, "weight");
      auto weight = static_cast<int>(
          weightProp.isUndefined()
              ? static_cast<double>(SkFontStyle::Weight::kNormal_Weight)
              : weightProp.asNumber());
      auto widthProp = object.getProperty(runtime, "width");
      auto width = static_cast<int>(
          widthProp.isUndefined()
              ? static_cast<double>(SkFontStyle::Width::kNormal_Width)
              : widthProp.asNumber());
      auto slantProp = object.getProperty(runtime, "slant");
      auto slant = static_cast<SkFontStyle::Slant>(
          slantProp.isUndefined()
              ? static_cast<double>(SkFontStyle::Slant::kUpright_Slant)
              : slantProp.asNumber());
      SkFontStyle style(weight, width, slant);
      return std::make_shared<SkFontStyle>(style);
    }
  }

  size_t getMemoryPressure() const override { return sizeof(SkFontStyle); }

  /**
  Returns the jsi object from a host object of this type
 */
  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            const SkFontStyle &fontStyle) {
    auto fontStyleObj =
        std::make_shared<JsiSkFontStyle>(std::move(context), fontStyle);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, fontStyleObj,
                                                       context);
  }
};
} // namespace RNSkia
