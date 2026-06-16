#pragma once

#include <memory>
#include <string>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

// Non-standard, Dawn-only. Mirrors wgpu::DawnTogglesDescriptor field-for-field
// so the mapping to the native chained struct is 1:1. Chained onto the
// wgpu::DeviceDescriptor in GPUAdapter::requestDevice.
struct GPUDawnTogglesDescriptor {
  std::optional<std::vector<std::string>> enabledToggles;  // Iterable<string>
  std::optional<std::vector<std::string>> disabledToggles; // Iterable<string>
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUDawnTogglesDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUDawnTogglesDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUDawnTogglesDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "enabledToggles")) {
        auto prop = value.getProperty(runtime, "enabledToggles");
        result->enabledToggles =
            JSIConverter<std::optional<std::vector<std::string>>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "disabledToggles")) {
        auto prop = value.getProperty(runtime, "disabledToggles");
        result->disabledToggles =
            JSIConverter<std::optional<std::vector<std::string>>>::fromJSI(
                runtime, prop, false);
      }
    }
    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPUDawnTogglesDescriptor> arg) {
    throw std::runtime_error("Invalid GPUDawnTogglesDescriptor::toJSI()");
  }
};

} // namespace rnwgpu
