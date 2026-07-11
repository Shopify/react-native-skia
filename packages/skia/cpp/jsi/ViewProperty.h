#pragma once

#include <atomic>
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <utility>
#include <variant>

#include "RuntimeLifecycleMonitor.h"
#include "api/JsiSkPicture.h"

namespace RNJsi {
namespace jsi = facebook::jsi;

class RuntimeAwareRuntimeGuard : public RuntimeLifecycleListener {
public:
  explicit RuntimeAwareRuntimeGuard(jsi::Runtime &runtime)
      : _runtime(&runtime) {
    RuntimeLifecycleMonitor::addListener(runtime, this);
  }

  ~RuntimeAwareRuntimeGuard() override {
    auto runtime = _runtime.load();
    if (runtime != nullptr) {
      RuntimeLifecycleMonitor::removeListener(*runtime, this);
    }
  }

  void onRuntimeDestroyed(jsi::Runtime *) override { _runtime.store(nullptr); }

  jsi::Runtime *getRuntime() const { return _runtime.load(); }

private:
  std::atomic<jsi::Runtime *> _runtime;
};

class ViewProperty {
public:
  ViewProperty(jsi::Runtime &runtime, const jsi::Value &value) {
    setObjectValue(runtime, value);
  }

  template <typename PlatformContext>
  ViewProperty(jsi::Runtime &runtime, const jsi::Value &value,
               PlatformContext platformContext, size_t) {
    if (value.isObject()) {
      auto object = value.asObject(runtime);
      if (object.isFunction(runtime)) {
        auto runtimeGuard = std::make_shared<RuntimeAwareRuntimeGuard>(runtime);
        auto function =
            std::make_shared<jsi::Function>(object.getFunction(runtime));
        _value = [runtimeGuard, function,
                  platformContext = std::move(platformContext)]() {
          platformContext->runOnJavascriptThread([runtimeGuard, function]() {
            auto runtime = runtimeGuard->getRuntime();
            if (runtime != nullptr) {
              function->call(*runtime);
            }
          });
        };
        return;
      }
    }
    setObjectValue(runtime, value);
  }

  bool isNull() { return std::holds_alternative<std::nullptr_t>(_value); }

  sk_sp<SkPicture> getPicture() { return std::get<sk_sp<SkPicture>>(_value); }

  std::function<void()> getFunction() {
    return std::get<std::function<void()>>(_value);
  }

private:
  void setObjectValue(jsi::Runtime &runtime, const jsi::Value &value) {
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

  std::variant<std::nullptr_t, sk_sp<SkPicture>, std::function<void()>> _value =
      nullptr;
};
} // namespace RNJsi
