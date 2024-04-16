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

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkContextFactory, Make))

  explicit JsiSkContextFactory(
      std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
