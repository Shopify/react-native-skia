#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkNativeObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImageInfo.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkImageInfo
    : public JsiSkWrappingSharedPtrNativeObject<JsiSkImageInfo, SkImageInfo> {
public:
  static constexpr const char *CLASS_NAME = "ImageInfo";

  JsiSkImageInfo(std::shared_ptr<RNSkPlatformContext> context,
                 const SkImageInfo &imageInfo)
      : JsiSkWrappingSharedPtrNativeObject<JsiSkImageInfo, SkImageInfo>(
            std::move(context), std::make_shared<SkImageInfo>(imageInfo)) {}

  /**
  Returns the underlying object from a host object of this type
 */
  static std::shared_ptr<SkImageInfo> fromValue(jsi::Runtime &runtime,
                                                const jsi::Value &obj) {
    const auto &object = obj.asObject(runtime);
    auto imageInfo = tryGetJsiObject<JsiSkImageInfo>(runtime, object);
    if (imageInfo) {
      return imageInfo->getObject();
    } else {
      auto width = object.getProperty(runtime, "width").asNumber();
      auto height = object.getProperty(runtime, "height").asNumber();
      auto colorType = static_cast<SkColorType>(
          object.getProperty(runtime, "colorType").asNumber());
      auto alphaType = static_cast<SkAlphaType>(
          object.getProperty(runtime, "alphaType").asNumber());
      // TODO: color space not supported yet
      return std::make_shared<SkImageInfo>(
          SkImageInfo::Make(width, height, colorType, alphaType));
    }
  }

  /**
  Returns the jsi object from a host object of this type
 */
  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            const SkImageInfo &imageInfo) {
    return makeJsiObject(runtime, std::make_shared<JsiSkImageInfo>(
                                      std::move(context), imageInfo));
  }

  JSI_PROPERTY_GET(width) { return static_cast<double>(getObject()->width()); }
  JSI_PROPERTY_GET(height) {
    return static_cast<double>(getObject()->height());
  }
  JSI_PROPERTY_GET(colorType) {
    return static_cast<double>(getObject()->colorType());
  }
  JSI_PROPERTY_GET(alphaType) {
    return static_cast<double>(getObject()->alphaType());
  }

  size_t getMemoryPressure() override {
    return std::max(sizeof(SkImageInfo), kMinMemoryPressure);
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostGetter(runtime, prototype, "width", &JsiSkImageInfo::get_width);
    installHostGetter(runtime, prototype, "height",
                      &JsiSkImageInfo::get_height);
    installHostGetter(runtime, prototype, "colorType",
                      &JsiSkImageInfo::get_colorType);
    installHostGetter(runtime, prototype, "alphaType",
                      &JsiSkImageInfo::get_alphaType);
  }
};
} // namespace RNSkia
