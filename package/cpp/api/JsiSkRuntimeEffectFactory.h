#pragma once

#include "JsiSKRuntimeEffect.h"
#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

namespace RNSkia {

using namespace facebook;

class JsiSkRuntimeEffectFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    auto sksl = arguments[0].asString(runtime).utf8(runtime);
    auto result = SkRuntimeEffect::MakeForShader(SkString(sksl));
    auto effect = result.effect;
    auto errorText = result.errorText;
    if (!effect) {
      jsi::detail::throwJSError(
          runtime,
          std::string("Error in sksl:\n" + std::string(errorText.c_str()))
              .c_str());
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkRuntimeEffect>(getContext(), effect));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkRuntimeEffectFactory, Make))

  JsiSkRuntimeEffectFactory(RNSkPlatformContext *context)
      : JsiSkHostObject(context) {}
};

} // namespace RNSkia
