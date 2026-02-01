#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUTextureView.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPURenderPassDepthStencilAttachment {
  std::shared_ptr<GPUTextureView> view;        // GPUTextureView
  std::optional<double> depthClearValue;       // number
  std::optional<wgpu::LoadOp> depthLoadOp;     // GPULoadOp
  std::optional<wgpu::StoreOp> depthStoreOp;   // GPUStoreOp
  std::optional<bool> depthReadOnly;           // boolean
  std::optional<double> stencilClearValue;     // GPUStencilValue
  std::optional<wgpu::LoadOp> stencilLoadOp;   // GPULoadOp
  std::optional<wgpu::StoreOp> stencilStoreOp; // GPUStoreOp
  std::optional<bool> stencilReadOnly;         // boolean
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<
    std::shared_ptr<rnwgpu::GPURenderPassDepthStencilAttachment>> {
  static std::shared_ptr<rnwgpu::GPURenderPassDepthStencilAttachment>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result =
        std::make_unique<rnwgpu::GPURenderPassDepthStencilAttachment>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "view")) {
        auto prop = value.getProperty(runtime, "view");
        result->view = JSIConverter<std::shared_ptr<GPUTextureView>>::fromJSI(
            runtime, prop, false);
      }
      if (value.hasProperty(runtime, "depthClearValue")) {
        auto prop = value.getProperty(runtime, "depthClearValue");
        result->depthClearValue =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "depthLoadOp")) {
        auto prop = value.getProperty(runtime, "depthLoadOp");
        result->depthLoadOp =
            JSIConverter<std::optional<wgpu::LoadOp>>::fromJSI(runtime, prop,
                                                               false);
      }
      if (value.hasProperty(runtime, "depthStoreOp")) {
        auto prop = value.getProperty(runtime, "depthStoreOp");
        result->depthStoreOp =
            JSIConverter<std::optional<wgpu::StoreOp>>::fromJSI(runtime, prop,
                                                                false);
      }
      if (value.hasProperty(runtime, "depthReadOnly")) {
        auto prop = value.getProperty(runtime, "depthReadOnly");
        result->depthReadOnly =
            JSIConverter<std::optional<bool>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "stencilClearValue")) {
        auto prop = value.getProperty(runtime, "stencilClearValue");
        result->stencilClearValue =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "stencilLoadOp")) {
        auto prop = value.getProperty(runtime, "stencilLoadOp");
        result->stencilLoadOp =
            JSIConverter<std::optional<wgpu::LoadOp>>::fromJSI(runtime, prop,
                                                               false);
      }
      if (value.hasProperty(runtime, "stencilStoreOp")) {
        auto prop = value.getProperty(runtime, "stencilStoreOp");
        result->stencilStoreOp =
            JSIConverter<std::optional<wgpu::StoreOp>>::fromJSI(runtime, prop,
                                                                false);
      }
      if (value.hasProperty(runtime, "stencilReadOnly")) {
        auto prop = value.getProperty(runtime, "stencilReadOnly");
        result->stencilReadOnly =
            JSIConverter<std::optional<bool>>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPURenderPassDepthStencilAttachment> arg) {
    throw std::runtime_error(
        "Invalid GPURenderPassDepthStencilAttachment::toJSI()");
  }
};

} // namespace rnwgpu