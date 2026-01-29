#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUStencilFaceState {
  std::optional<wgpu::CompareFunction> compare;      // GPUCompareFunction
  std::optional<wgpu::StencilOperation> failOp;      // GPUStencilOperation
  std::optional<wgpu::StencilOperation> depthFailOp; // GPUStencilOperation
  std::optional<wgpu::StencilOperation> passOp;      // GPUStencilOperation
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUStencilFaceState>> {
  static std::shared_ptr<rnwgpu::GPUStencilFaceState>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUStencilFaceState>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "compare")) {
        auto prop = value.getProperty(runtime, "compare");
        result->compare =
            JSIConverter<std::optional<wgpu::CompareFunction>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "failOp")) {
        auto prop = value.getProperty(runtime, "failOp");
        result->failOp =
            JSIConverter<std::optional<wgpu::StencilOperation>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "depthFailOp")) {
        auto prop = value.getProperty(runtime, "depthFailOp");
        result->depthFailOp =
            JSIConverter<std::optional<wgpu::StencilOperation>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "passOp")) {
        auto prop = value.getProperty(runtime, "passOp");
        result->passOp =
            JSIConverter<std::optional<wgpu::StencilOperation>>::fromJSI(
                runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUStencilFaceState> arg) {
    throw std::runtime_error("Invalid GPUStencilFaceState::toJSI()");
  }
};

} // namespace rnwgpu