#pragma once

#include <memory>
#include <string>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "GPUShaderModuleCompilationHint.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUShaderModuleDescriptor {
  std::string code; // string
  std::optional<std::vector<std::shared_ptr<GPUShaderModuleCompilationHint>>>
      compilationHints;             // Array<GPUShaderModuleCompilationHint>
  std::optional<std::string> label; // string
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUShaderModuleDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUShaderModuleDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUShaderModuleDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "code")) {
        auto prop = value.getProperty(runtime, "code");
        result->code = JSIConverter<std::string>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "compilationHints")) {
        auto prop = value.getProperty(runtime, "compilationHints");
        result->compilationHints = JSIConverter<std::optional<std::vector<
            std::shared_ptr<GPUShaderModuleCompilationHint>>>>::fromJSI(runtime,
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
        std::shared_ptr<rnwgpu::GPUShaderModuleDescriptor> arg) {
    throw std::runtime_error("Invalid GPUShaderModuleDescriptor::toJSI()");
  }
};

} // namespace rnwgpu