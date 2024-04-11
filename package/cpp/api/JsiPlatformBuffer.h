#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkImage.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 Implementation of the ParagraphBuilderFactory for making ParagraphBuilder JSI
 object
 */
class JsiPlatformBufferFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeFromImage) {
    auto image = JsiSkImage::fromValue(runtime, arguments[0]);
    image->makeNonTextureImage();

    uint64_t pointer = getContext()->makePlatformBuffer(image);
    jsi::HostFunctionType deleteFunc =
        [=](jsi::Runtime &runtime, const jsi::Value &thisArg,
            const jsi::Value *args, size_t count) -> jsi::Value {
      getContext()->releasePlatformBuffer(pointer);
      return jsi::Value::undefined();
    };
    return jsi::BigInt::fromUint64(runtime, pointer);
  }

  JSI_HOST_FUNCTION(Release) {

    jsi::BigInt pointer = arguments[0].asBigInt(runtime);
    const uintptr_t platformBufferPointer = pointer.asUint64(runtime);

    getContext()->releasePlatformBuffer(platformBufferPointer);
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiPlatformBufferFactory, Release),
                       JSI_EXPORT_FUNC(JsiPlatformBufferFactory, MakeFromImage))

  explicit JsiPlatformBufferFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
