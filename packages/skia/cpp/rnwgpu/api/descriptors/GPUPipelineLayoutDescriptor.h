#pragma once

#include <memory>
#include <string>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUBindGroupLayout.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUPipelineLayoutDescriptor {
  std::vector<std::shared_ptr<GPUBindGroupLayout>>
      bindGroupLayouts;             // Iterable<GPUBindGroupLayout>
  std::optional<std::string> label; // string
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUPipelineLayoutDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUPipelineLayoutDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUPipelineLayoutDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "bindGroupLayouts")) {
        auto prop = value.getProperty(runtime, "bindGroupLayouts");
        result->bindGroupLayouts = JSIConverter<
            std::vector<std::shared_ptr<GPUBindGroupLayout>>>::fromJSI(runtime,
                                                                       prop,
                                                                       false);
      }
      if (value.hasProperty(runtime, "label")) {
        auto prop = value.getProperty(runtime, "label");
        result->label = JSIConverter<std::optional<std::string>>::fromJSI(
            runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPUPipelineLayoutDescriptor> arg) {
    throw std::runtime_error("Invalid GPUPipelineLayoutDescriptor::toJSI()");
  }
};

} // namespace rnwgpu