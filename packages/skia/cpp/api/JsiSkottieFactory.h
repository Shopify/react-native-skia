#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkSkottie.h"

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkottieFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    auto str = arguments[0].asString(runtime).utf8(runtime);
    auto builder = skottie::Animation::Builder();
    auto slotManager = builder.getSlotManager();
    auto propManager = std::make_unique<skottie_utils::CustomPropertyManager>();
    builder.setPropertyObserver(propManager->getPropertyObserver()).setMarkerObserver(propManager->getMarkerObserver());
    auto animation = builder.make(str.c_str(), str.size());
    if (!animation) {
      return jsi::Value::null();
    }
    auto managedAnimation = std::make_shared<ManagedAnimation>(
        std::move(animation), std::move(propManager));
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkSkottie>(getContext(), std::move(managedAnimation)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkottieFactory, Make))

  explicit JsiSkottieFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
