#pragma once

#include <map>
#include <memory>
#include <string>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUShaderModule.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUProgrammableStage {
  std::shared_ptr<GPUShaderModule> module; // GPUShaderModule
  std::optional<std::string> entryPoint;   // string
  std::optional<std::map<std::string, double>>
      constants; // Record< string, GPUPipelineConstantValue >
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUProgrammableStage>> {
  static std::shared_ptr<rnwgpu::GPUProgrammableStage>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUProgrammableStage>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "module")) {
        auto prop = value.getProperty(runtime, "module");
        result->module =
            JSIConverter<std::shared_ptr<GPUShaderModule>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "entryPoint")) {
        auto prop = value.getProperty(runtime, "entryPoint");
        result->entryPoint = JSIConverter<std::optional<std::string>>::fromJSI(
            runtime, prop, false);
      }
      if (value.hasProperty(runtime, "constants")) {
        auto prop = value.getProperty(runtime, "constants");
        result->constants =
            JSIConverter<std::optional<std::map<std::string, double>>>::fromJSI(
                runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUProgrammableStage> arg) {
    throw std::runtime_error("Invalid GPUProgrammableStage::toJSI()");
  }
};

} // namespace rnwgpu