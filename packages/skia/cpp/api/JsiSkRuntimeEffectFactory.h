#pragma once

#include <memory>
#include <string>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkNativeObjects.h"
#include "JsiSkRuntimeEffect.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkRuntimeEffectFactory
    : public JsiSkNativeObject<JsiSkRuntimeEffectFactory> {
public:
  static constexpr const char *CLASS_NAME = "RuntimeEffectFactory";

  JSI_HOST_FUNCTION(Make) {
    auto sksl = arguments[0].asString(runtime).utf8(runtime);
    auto result = SkRuntimeEffect::MakeForShader(SkString(sksl));
    auto effect = result.effect;
    auto errorText = result.errorText;
    if (!effect) {
      throw jsi::JSError(runtime, std::string("Error in sksl:\n" +
                                              std::string(errorText.c_str()))
                                      .c_str());
      return jsi::Value::null();
    }
    return makeJsiObject(runtime, std::make_shared<JsiSkRuntimeEffect>(
                                      getContext(), std::move(effect)));
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installHostMethod(runtime, prototype, "Make",
                      &JsiSkRuntimeEffectFactory::Make);
  }

  explicit JsiSkRuntimeEffectFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkRuntimeEffectFactory>(std::move(context)) {}
};

} // namespace RNSkia
