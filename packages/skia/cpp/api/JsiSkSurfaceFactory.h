#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#include "JsiSkSurface.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkSurfaceFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    auto width = static_cast<int>(arguments[0].asNumber());
    auto height = static_cast<int>(arguments[1].asNumber());
    auto imageInfo = SkImageInfo::MakeN32Premul(width, height);
    auto surface = SkSurfaces::Raster(imageInfo);
    if (surface == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkSurface>(getContext(), std::move(surface)));
  }

  JSI_HOST_FUNCTION(MakeOffscreen) {
    auto width = static_cast<int>(arguments[0].asNumber());
    auto height = static_cast<int>(arguments[1].asNumber());
    auto context = getContext();
    
    sk_sp<SkSurface> surface;
    if (count > 2 && !arguments[2].isUndefined()) {
      auto colorTypeValue = static_cast<int>(arguments[2].asNumber());
      auto colorType = static_cast<SkColorType>(colorTypeValue);
      surface = context->makeOffscreenSurface(width, height, colorType);
    } else {
      // Use platform-specific default color type
      surface = context->makeOffscreenSurface(width, height);
    }
    
    if (surface == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkSurface>(getContext(), std::move(surface)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSurfaceFactory, Make),
                       JSI_EXPORT_FUNC(JsiSkSurfaceFactory, MakeOffscreen))

  explicit JsiSkSurfaceFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
