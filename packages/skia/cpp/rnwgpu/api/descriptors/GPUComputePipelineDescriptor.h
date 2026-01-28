#pragma once

#include <memory>
#include <string>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUPipelineLayout.h"
#include "GPUProgrammableStage.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUComputePipelineDescriptor {
  std::shared_ptr<GPUProgrammableStage> compute; // GPUProgrammableStage
  std::variant<std::nullptr_t, std::shared_ptr<GPUPipelineLayout>>
      layout;                       // | GPUPipelineLayout | GPUAutoLayoutMode
  std::optional<std::string> label; // string
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUComputePipelineDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUComputePipelineDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUComputePipelineDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "compute")) {
        auto prop = value.getProperty(runtime, "compute");
        result->compute =
            JSIConverter<std::shared_ptr<GPUProgrammableStage>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "layout")) {
        auto prop = value.getProperty(runtime, "layout");
        if (prop.isNull() || prop.isString()) {
          result->layout = nullptr;
        } else {
          result->layout =
              JSIConverter<std::shared_ptr<GPUPipelineLayout>>::fromJSI(
                  runtime, prop, false);
        }
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
        std::shared_ptr<rnwgpu::GPUComputePipelineDescriptor> arg) {
    throw std::runtime_error("Invalid GPUComputePipelineDescriptor::toJSI()");
  }
};

} // namespace rnwgpu