
#pragma once

#include <jsi/jsi.h>

#include <algorithm>
#include <chrono>
#include <functional>
#include <memory>
#include <utility>
#include <vector>

#include "RNSkPlatformContext.h"
#include "RNSkValue.h"

namespace RNSkia {
namespace jsi = facebook::jsi;

/**
  Creates a readonly value that depends on one or more other values. The derived
  value has a callback function that is used to calculate the new value when any
  of the dependencies change.
 */
class RNSkComputedValue : public RNSkValue {
public:
  RNSkComputedValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                    jsi::Runtime &runtime, const jsi::Value *arguments,
                    size_t count)
      : RNSkValue(platformContext), _runtime(runtime) {
    // Verify input
    if (!arguments[0].isObject() ||
        !arguments[0].asObject(runtime).isFunction(runtime)) {
      throw jsi::JSError(runtime,
                         "Expected callback function as first parameter");
    }

    if (!arguments[1].isObject() ||
        !arguments[1].asObject(runtime).isArray(runtime)) {
      throw jsi::JSError(runtime,
                         "Expected array of dependencies as second parameter");
    }

    // Get callback for calculating result
    _callback = std::make_shared<jsi::Function>(
        arguments[0].asObject(runtime).asFunction(runtime));

    // Set initial value to undefined in the computed value
    getCurrent().setUndefined();
  }

  void invalidate() override {
    RNSkValue::invalidate();

    // Unregister listeners
    for (const auto &unsubscribe : _unsubscribers) {
      unsubscribe();
    }
    _unsubscribers.clear();
  }

  void initializeDependencies(jsi::Runtime &runtime,
                              const jsi::Value *arguments, size_t count) {
    // Save dependencies
    std::vector<std::shared_ptr<RNSkValue>> dependencies;

    // Ensure that all dependencies are Values
    auto deps = arguments[1].asObject(runtime).asArray(runtime);
    const std::size_t size = deps.size(runtime);
    dependencies.reserve(size);
    for (size_t i = 0; i < size; ++i) {
      auto dep = deps.getValueAtIndex(runtime, i);
      if (!dep.isObject() || !dep.asObject(runtime).isHostObject(runtime)) {
        continue;
      }
      auto value = dep.asObject(runtime).asHostObject<RNSkValue>(runtime);
      if (value == nullptr) {
        continue;
      }
      dependencies.push_back(value);
    }

    // register change handler on dependencies
    _unsubscribers.reserve(_unsubscribers.size() + size);
    for (const auto &dep : dependencies) {
      _unsubscribers.push_back(
          dep->addListener([weakSelf = weak_from_this()](RNSkValue *) {
            auto self = weakSelf.lock();
            if (self) {
              auto selfAsThis =
                  std::dynamic_pointer_cast<RNSkComputedValue>(self);
              selfAsThis->dependencyUpdated();
            }
          }));
    }

    // Set initial value - if we're constructing this value from the JS thread
    // (Which we should since this ctor takes the runtime as its parameter)
    if (!getContext()->isOnJavascriptThread()) {
      throw std::runtime_error("Computed values must be created on the Javascript thread so that their initial value can be calculated.");
    } else {
      auto initialValue = _callback->call(runtime, nullptr, 0);
      setCurrent(runtime, initialValue);
    }
  }

private:
  void dependencyUpdated() {
    getContext()->runOnJavascriptThread([weakSelf = weak_from_this()]() {
      auto self = weakSelf.lock();
      if (self) {
        // Update value
        auto selfAsThis = std::static_pointer_cast<RNSkComputedValue>(self);
        auto newValue = JsiValue(
            selfAsThis->_runtime,
            selfAsThis->_callback->call(selfAsThis->_runtime, nullptr, 0));
        // Updated should be done on the main thread
        selfAsThis->getContext()->runOnMainThread(
            [weakSelf, current = std::move(newValue)]() {
              auto self = weakSelf.lock();
              if (self) {
                // Update value
                auto selfAsThis =
                    std::static_pointer_cast<RNSkComputedValue>(self);
                selfAsThis->setCurrent(std::move(current));
              }
            });
      }
    });
  }

  jsi::Runtime &_runtime;
  std::shared_ptr<jsi::Function> _callback;
  std::vector<std::function<void()>> _unsubscribers;
};
} // namespace RNSkia
