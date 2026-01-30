#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUBlendComponent {
  std::optional<wgpu::BlendOperation> operation; // GPUBlendOperation
  std::optional<wgpu::BlendFactor> srcFactor;    // GPUBlendFactor
  std::optional<wgpu::BlendFactor> dstFactor;    // GPUBlendFactor
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUBlendComponent>> {
  static std::shared_ptr<rnwgpu::GPUBlendComponent>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUBlendComponent>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "operation")) {
        auto prop = value.getProperty(runtime, "operation");
        result->operation =
            JSIConverter<std::optional<wgpu::BlendOperation>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "srcFactor")) {
        auto prop = value.getProperty(runtime, "srcFactor");
        result->srcFactor =
            JSIConverter<std::optional<wgpu::BlendFactor>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "dstFactor")) {
        auto prop = value.getProperty(runtime, "dstFactor");
        result->dstFactor =
            JSIConverter<std::optional<wgpu::BlendFactor>>::fromJSI(
                runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUBlendComponent> arg) {
    throw std::runtime_error("Invalid GPUBlendComponent::toJSI()");
  }
};

} // namespace rnwgpu