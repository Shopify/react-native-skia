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
    auto fontMgr = JsiSkFontMgrFactory::getFontMgr(getContext());
    auto json = arguments[0].asString(runtime).utf8(runtime);
    SkottieAssetProvider::AssetMap assets;
    if (count > 1 && arguments[1].isObject()) {
      auto jsAssetMap = arguments[1].asObject(runtime);

      // Convert JS object to C++ AssetMap
      auto propertyNames = jsAssetMap.getPropertyNames(runtime);
      size_t propertyCount = propertyNames.size(runtime);

      for (size_t i = 0; i < propertyCount; i++) {
        auto propertyName =
            propertyNames.getValueAtIndex(runtime, i).asString(runtime);
        auto key = propertyName.utf8(runtime);
        auto jsValue = jsAssetMap.getProperty(runtime, propertyName);

        if (jsValue.isObject()) {
          auto jsObject = jsValue.asObject(runtime);

          // Check if the object is a SkData host object
          if (jsObject.isHostObject(runtime)) {
            auto hostObject = jsObject.getHostObject(runtime);
            auto skData = std::dynamic_pointer_cast<JsiSkData>(hostObject);
            if (skData) {
              std::string k = key;
              assets[k] = skData->getObject();
            }
          }
        }
      }
    }

    auto managedAnimation = std::make_shared<ManagedAnimation>(
        json, std::move(assets), std::move(fontMgr));
    if (!managedAnimation->_animation) {
      return jsi::Value::null();
    }
    auto skottie = std::make_shared<JsiSkSkottie>(getContext(),
                                                  std::move(managedAnimation));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, skottie,
                                                       getContext());
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkottieFactory, Make))

  size_t getMemoryPressure() const override { return 4096; }

  explicit JsiSkottieFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
