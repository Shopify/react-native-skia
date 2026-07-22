#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkAnimatedImage.h"
#include "JsiSkData.h"
#include "JsiSkNativeObjects.h"
#include "jsi/JsiPromises.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkAnimatedImageFactory
    : public JsiSkNativeObject<JsiSkAnimatedImageFactory> {
public:
  static constexpr const char *CLASS_NAME = "AnimatedImageFactory";

  JSI_HOST_FUNCTION(MakeAnimatedImageFromEncoded) {
    auto data = JsiSkData::fromValue(runtime, arguments[0]);
    auto codec = SkAndroidCodec::MakeFromData(data);
    auto image = SkAnimatedImage::Make(std::move(codec));
    if (image == nullptr) {
      return jsi::Value::null();
    }
    return makeJsiObject(runtime, std::make_shared<JsiSkAnimatedImage>(
                                      getContext(), std::move(image)));
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "MakeAnimatedImageFromEncoded",
                      &JsiSkAnimatedImageFactory::MakeAnimatedImageFromEncoded);
  }

  explicit JsiSkAnimatedImageFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkAnimatedImageFactory>(std::move(context)) {}
};

} // namespace RNSkia
