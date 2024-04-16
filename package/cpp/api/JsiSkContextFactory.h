#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkContext.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkContextFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    std::shared_ptr<RNSkContext> skiaContext = getContext()->createSkiaContext();
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkContext>(getContext(), skiaContext));
  }
  
  JSI_HOST_FUNCTION(GetCurrent) {
    std::shared_ptr<RNSkContext> skiaContext = getGlobalSkiaContext(getContext(), runtime);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkContext>(getContext(), skiaContext));
  }
  
  static std::shared_ptr<RNSkContext> getGlobalSkiaContext(std::shared_ptr<RNSkPlatformContext> platformContext, jsi::Runtime& runtime) {
    static constexpr auto NAME = "__skiaContext";
    if (!runtime.global().hasProperty(runtime, NAME)) {
      // create and inject Skia context into this Runtime's global for the first time
      std::shared_ptr<RNSkContext> context = platformContext->createSkiaContext();
      std::shared_ptr<JsiSkContext> jsiContext = std::make_shared<JsiSkContext>(platformContext, context);
      runtime.global().setProperty(runtime, NAME, jsi::Object::createFromHostObject(runtime, jsiContext));
      return context;
    }
    // lookup Skia context from global
    jsi::Object object = runtime.global().getPropertyAsObject(runtime, NAME);
    std::shared_ptr<JsiSkContext> hostObject = object.asHostObject<JsiSkContext>(runtime);
    return hostObject->getContext();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkContextFactory, Make))

  explicit JsiSkContextFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
