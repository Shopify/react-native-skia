#pragma once

#include <atomic>
#include <functional>
#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <variant>

#include "JsiSkPicture.h"
#include "RuntimeLifecycleMonitor.h"

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
               PlatformContext platformContext, size_t nativeId) {}

  bool isNull() { return std::holds_alternative<std::nullptr_t>(_value); }

  sk_sp<SkPicture> getPicture() { return std::get<sk_sp<SkPicture>>(_value); }

private:
  std::variant<std::nullptr_t, sk_sp<SkPicture>> _value = nullptr;
};
} // namespace RNJsi
