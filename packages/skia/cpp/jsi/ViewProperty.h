#pragma once

#include <exception>
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <variant>

#include "JsiSkPicture.h"
#include "RuntimeAwareCache.h"

namespace RNJsi {
namespace jsi = facebook::jsi;

class ViewProperty {
public:
  ViewProperty(jsi::Runtime &runtime, const jsi::Value &value) {
    if (value.isObject()) {
      auto object = value.asObject(runtime);
      if (object.isHostObject(runtime)) {
        auto hostObject = object.asHostObject(runtime);
        auto jsiPicture =
            std::dynamic_pointer_cast<RNSkia::JsiSkPicture>(hostObject);
        if (jsiPicture) {
          _value = jsiPicture->getObject();
        }
      }
    }
  }

  template <typename PlatformContext>
  ViewProperty(jsi::Runtime &runtime, const jsi::Value &value,
               PlatformContext platformContext, size_t nativeId) {
    // Set the onSize callback with all the necessary context
    auto weakPlatformContext =
        std::weak_ptr<typename PlatformContext::element_type>(platformContext);
    _value = std::function<void(int, int)>([weakPlatformContext,
                                            nativeId](int width, int height) {
      auto lockedContext = weakPlatformContext.lock();
      if (lockedContext == nullptr) {
        return;
      }

      lockedContext->runOnJavascriptThread([weakPlatformContext, nativeId,
                                            width, height]() {
        auto context = weakPlatformContext.lock();
        if (context == nullptr) {
          return;
        }

        auto *runtime = RNJsi::BaseRuntimeAwareCache::tryGetMainJsRuntime();
        if (runtime == nullptr) {
          return;
        }

        try {
          jsi::Object size(*runtime);
          auto pd = context->getPixelDensity();
          size.setProperty(*runtime, "width", jsi::Value(width / pd));
          size.setProperty(*runtime, "height", jsi::Value(height / pd));

          // Get the stored shared value from global
          std::string globalKey =
              "__onSize_" + std::to_string(static_cast<int>(nativeId));
          auto globalProp =
              runtime->global().getProperty(*runtime, globalKey.c_str());
          if (!globalProp.isUndefined() && globalProp.isObject()) {
            globalProp.asObject(*runtime).setProperty(*runtime, "value", size);
          }
        } catch (const jsi::JSError &err) {
          context->raiseError(err);
        } catch (const std::exception &err) {
          context->raiseError(err);
        }
      });
    });
  }

  bool isNull() { return std::holds_alternative<std::nullptr_t>(_value); }

  sk_sp<SkPicture> getPicture() { return std::get<sk_sp<SkPicture>>(_value); }

  std::variant<std::nullptr_t, std::function<void(int, int)>>
  getOnSize() const {
    if (std::holds_alternative<std::function<void(int, int)>>(_value)) {
      return std::get<std::function<void(int, int)>>(_value);
    }
    return nullptr;
  }

private:
  std::variant<std::nullptr_t, sk_sp<SkPicture>, std::function<void(int, int)>>
      _value = nullptr;
};
} // namespace RNJsi
