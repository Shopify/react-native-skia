#pragma once

#include <memory>

#include "JsiSkColorFilter.h"
#include "JsiSkData.h"
#include "JsiSkHostObjects.h"
#include "JsiSkPicture.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkData.h"
#include "include/core/SkPicture.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPictureFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakePicture) {
    // Handle null case - create JsiSkPicture with nullptr
    if (arguments[0].isNull()) {
      auto hostObjectInstance =
          std::make_shared<JsiSkPicture>(getContext(), nullptr);
      return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
          runtime, hostObjectInstance, getContext());
    }

    if (!arguments[0].isObject()) {
      throw jsi::JSError(
          runtime, "Expected ArrayBuffer or TypedArray as first parameter");
    }

    auto obj = arguments[0].asObject(runtime);
    jsi::ArrayBuffer buffer = [&]() {
      // Check if it's already an ArrayBuffer
      if (obj.isArrayBuffer(runtime)) {
        return obj.getArrayBuffer(runtime);
      } else {
        // Otherwise, assume it's a TypedArray and get its buffer property
        if (!obj.hasProperty(runtime, "buffer")) {
          throw jsi::JSError(
              runtime, "Expected ArrayBuffer or TypedArray as first parameter");
        }
        return obj
            .getProperty(runtime, jsi::PropNameID::forAscii(runtime, "buffer"))
            .asObject(runtime)
            .getArrayBuffer(runtime);
      }
    }();

    sk_sp<SkData> data =
        SkData::MakeWithCopy(buffer.data(runtime), buffer.size(runtime));
    auto picture = SkPicture::MakeFromData(data.get());
    if (picture != nullptr) {
      auto hostObjectInstance =
          std::make_shared<JsiSkPicture>(getContext(), std::move(picture));
      return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
          runtime, hostObjectInstance, getContext());
    } else {
      return jsi::Value::undefined();
    }
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPictureFactory, MakePicture))

  size_t getMemoryPressure() const override { return 1024; }

  std::string getObjectType() const override { return "JsiSkPictureFactory"; }

  explicit JsiSkPictureFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
