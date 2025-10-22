#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkImage.h"
#include "JsiArgParser.h"
#include "JsiArgParserTypes.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 Implementation of the ParagraphBuilderFactory for making ParagraphBuilder JSI
 object
 */
class JsiNativeBufferFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeFromImage) {
    ArgParser parser(runtime, arguments, count);
    auto image = parser.next<sk_sp<SkImage>>();
    image->makeNonTextureImage();
    uint64_t pointer = getContext()->makeNativeBuffer(image);
    return jsi::BigInt::fromUint64(runtime, pointer);
  }

  JSI_HOST_FUNCTION(Release) {
    ArgParser parser(runtime, arguments, count);
    auto pointer = parser.next<jsi::Value>();
    const uintptr_t nativeBufferPointer = pointer.asBigInt(runtime).asUint64(runtime);
    getContext()->releaseNativeBuffer(nativeBufferPointer);
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiNativeBufferFactory, Release),
                       JSI_EXPORT_FUNC(JsiNativeBufferFactory, MakeFromImage))

  size_t getMemoryPressure() const override { return 1024; }

  explicit JsiNativeBufferFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
