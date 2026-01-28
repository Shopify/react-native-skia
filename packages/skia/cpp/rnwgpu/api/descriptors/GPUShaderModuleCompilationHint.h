#pragma once

#include <memory>
#include <string>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUPipelineLayout.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUShaderModuleCompilationHint {
  std::string entryPoint; // string
  std::optional<
      std::variant<std::nullptr_t, std::shared_ptr<GPUPipelineLayout>>>
      layout; // | GPUPipelineLayout | GPUAutoLayoutMode
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUShaderModuleCompilationHint>> {
  static std::shared_ptr<rnwgpu::GPUShaderModuleCompilationHint>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUShaderModuleCompilationHint>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "entryPoint")) {
        auto prop = value.getProperty(runtime, "entryPoint");
        result->entryPoint =
            JSIConverter<std::string>::fromJSI(runtime, prop, false);
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
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPUShaderModuleCompilationHint> arg) {
    throw std::runtime_error("Invalid GPUShaderModuleCompilationHint::toJSI()");
  }
};

} // namespace rnwgpu