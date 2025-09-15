#pragma once

#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <variant>

#include "JsiSkPicture.h"


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

  template<typename PlatformContext>
  ViewProperty(jsi::Runtime &runtime, const jsi::Value &value,
               PlatformContext platformContext, size_t nativeId) {
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

    // Set the onSize callback with all the necessary context
    _onSizeCallback = [&runtime, platformContext, nativeId](int width, int height) {
      jsi::Object size(runtime);
      auto pd = platformContext->getPixelDensity();
      size.setProperty(runtime, "width", jsi::Value(width / pd));
      size.setProperty(runtime, "height", jsi::Value(height / pd));

      // Get the stored shared value from global
      std::string globalKey = "__onSize_" + std::to_string(static_cast<int>(nativeId));
      auto globalProp = runtime.global().getProperty(runtime, globalKey.c_str());
      if (!globalProp.isUndefined()) {
        globalProp.asObject(runtime).setProperty(runtime, "value", size);
      }
    };
  }


  bool isNull() { return std::holds_alternative<nullptr_t>(_value); }

  sk_sp<SkPicture> getPicture() { return std::get<sk_sp<SkPicture>>(_value); }

  bool hasOnSizeCallback() const { return _onSizeCallback != nullptr; }

  void callOnSize(int width, int height) {
    if (_onSizeCallback) {
      _onSizeCallback(width, height);
    }
  }

private:
  std::variant<nullptr_t, sk_sp<SkPicture>> _value = nullptr;
  std::function<void(int, int)> _onSizeCallback;
};
} // namespace RNJsi
