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

  JSI_HOST_FUNCTION(MakeFromNativeSurface) {
    jsi::BigInt pointer = arguments[0].asBigInt(runtime);
    const uintptr_t nativeBufferPointer = pointer.asUint64(runtime);
    void *surface = reinterpret_cast<void *>(nativeBufferPointer);
    auto width = static_cast<int>(arguments[1].asNumber());
    auto height = static_cast<int>(arguments[2].asNumber());
    auto context = getContext();
    auto result = context->makeSurfaceFromNativeSurface(surface, width, height);
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(MakeOffscreen) {
    auto width = static_cast<int>(arguments[0].asNumber());
    auto height = static_cast<int>(arguments[1].asNumber());
    auto context = getContext();
    auto surface = context->makeOffscreenSurface(width, height);
    if (surface == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkSurface>(getContext(), std::move(surface)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSurfaceFactory, Make),
                       JSI_EXPORT_FUNC(JsiSkSurfaceFactory, MakeOffscreen),
                       JSI_EXPORT_FUNC(JsiSkSurfaceFactory, MakeFromNativeSurface))

  explicit JsiSkSurfaceFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
