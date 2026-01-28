#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "GPUBlendComponent.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUBlendState {
  std::shared_ptr<GPUBlendComponent> color; // GPUBlendComponent
  std::shared_ptr<GPUBlendComponent> alpha; // GPUBlendComponent
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUBlendState>> {
  static std::shared_ptr<rnwgpu::GPUBlendState>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUBlendState>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "color")) {
        auto prop = value.getProperty(runtime, "color");
        result->color =
            JSIConverter<std::shared_ptr<GPUBlendComponent>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "alpha")) {
        auto prop = value.getProperty(runtime, "alpha");
        result->alpha =
            JSIConverter<std::shared_ptr<GPUBlendComponent>>::fromJSI(
                runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUBlendState> arg) {
    throw std::runtime_error("Invalid GPUBlendState::toJSI()");
  }
};

} // namespace rnwgpu