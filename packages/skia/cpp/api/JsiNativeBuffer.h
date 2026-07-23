#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkImage.h"
#include "JsiSkNativeObjects.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 Implementation of the ParagraphBuilderFactory for making ParagraphBuilder JSI
 object
 */
class JsiNativeBufferFactory
    : public JsiSkNativeObject<JsiNativeBufferFactory> {
public:
  static constexpr const char *CLASS_NAME = "NativeBufferFactory";

  JSI_HOST_FUNCTION(MakeFromImage) {
    auto image = JsiSkImage::fromValue(runtime, arguments[0]);
    image->makeNonTextureImage();
    uint64_t pointer = getContext()->makeNativeBuffer(image);
    return jsi::BigInt::fromUint64(runtime, pointer);
  }

  JSI_HOST_FUNCTION(MakeTestBuffer) {
    auto width = static_cast<int>(arguments[0].asNumber());
    auto height = static_cast<int>(arguments[1].asNumber());
    uint64_t pointer = getContext()->makeTestNativeBuffer(width, height);
    return jsi::BigInt::fromUint64(runtime, pointer);
  }

  JSI_HOST_FUNCTION(Release) {

    jsi::BigInt pointer = arguments[0].asBigInt(runtime);
    const uintptr_t nativeBufferPointer = pointer.asUint64(runtime);

    getContext()->releaseNativeBuffer(nativeBufferPointer);
    return jsi::Value::undefined();
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installHostMethod(runtime, prototype, "Release",
                      &JsiNativeBufferFactory::Release);
    installHostMethod(runtime, prototype, "MakeFromImage",
                      &JsiNativeBufferFactory::MakeFromImage);
    installHostMethod(runtime, prototype, "MakeTestBuffer",
                      &JsiNativeBufferFactory::MakeTestBuffer);
  }

  size_t getMemoryPressure() override { return 1024; }

  explicit JsiNativeBufferFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiNativeBufferFactory>(std::move(context)) {}
};

} // namespace RNSkia
