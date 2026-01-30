#pragma once

#include <map>
#include <memory>
#include <string>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "GPUQueueDescriptor.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUDeviceDescriptor {
  std::optional<std::vector<wgpu::FeatureName>>
      requiredFeatures; // Iterable<GPUFeatureName>
  std::optional<std::map<std::string, double>>
      requiredLimits; // Record< string, GPUSize64 >
  std::optional<std::shared_ptr<GPUQueueDescriptor>>
      defaultQueue;                 // GPUQueueDescriptor
  std::optional<std::string> label; // string
};

} // namespace rnwgpu

namespace rnwgpu {

// We add this extra convertor because we found so library that are sending
// invalid feature elements
template <> struct JSIConverter<std::vector<wgpu::FeatureName>> {

  static std::vector<wgpu::FeatureName>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    jsi::Array array = arg.asObject(runtime).asArray(runtime);
    size_t length = array.size(runtime);

    std::vector<wgpu::FeatureName> vector;
    vector.reserve(length);
    for (size_t i = 0; i < length; ++i) {
      jsi::Value elementValue = array.getValueAtIndex(runtime, i);
      if (elementValue.isString()) {
        vector.emplace_back(JSIConverter<wgpu::FeatureName>::fromJSI(
            runtime, elementValue, outOfBounds));
      }
    }
    return vector;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUDeviceDescriptor> arg) {
    throw std::runtime_error(
        "Invalid JSIConverter<std::vector<wgpu::FeatureName>>::toJSI()");
  }
};

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUDeviceDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUDeviceDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUDeviceDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "requiredFeatures")) {
        auto prop = value.getProperty(runtime, "requiredFeatures");
        result->requiredFeatures = JSIConverter<
            std::optional<std::vector<wgpu::FeatureName>>>::fromJSI(runtime,
                                                                    prop,
                                                                    false);
      }
      if (value.hasProperty(runtime, "requiredLimits")) {
        auto prop = value.getProperty(runtime, "requiredLimits");
        result->requiredLimits =
            JSIConverter<std::optional<std::map<std::string, double>>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "defaultQueue")) {
        auto prop = value.getProperty(runtime, "defaultQueue");
        result->defaultQueue =
            JSIConverter<std::optional<std::shared_ptr<GPUQueueDescriptor>>>::
                fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "label")) {
        auto prop = value.getProperty(runtime, "label");
        result->label = JSIConverter<std::optional<std::string>>::fromJSI(
            runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUDeviceDescriptor> arg) {
    throw std::runtime_error("Invalid GPUDeviceDescriptor::toJSI()");
  }
};

} // namespace rnwgpu
