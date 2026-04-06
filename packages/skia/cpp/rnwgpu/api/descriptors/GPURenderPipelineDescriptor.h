#pragma once

#include <memory>
#include <string>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "GPUDepthStencilState.h"
#include "GPUFragmentState.h"
#include "GPUMultisampleState.h"
#include "GPUPrimitiveState.h"
#include "GPUVertexState.h"
#include "rnwgpu/api/GPUPipelineLayout.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPURenderPipelineDescriptor {
  std::shared_ptr<GPUVertexState> vertex; // GPUVertexState
  std::optional<std::shared_ptr<GPUPrimitiveState>>
      primitive; // GPUPrimitiveState
  std::optional<std::shared_ptr<GPUDepthStencilState>>
      depthStencil; // GPUDepthStencilState
  std::optional<std::shared_ptr<GPUMultisampleState>>
      multisample; // GPUMultisampleState
  std::optional<std::shared_ptr<GPUFragmentState>> fragment; // GPUFragmentState
  std::variant<std::nullptr_t, std::shared_ptr<GPUPipelineLayout>>
      layout;                       // | GPUPipelineLayout | GPUAutoLayoutMode
  std::optional<std::string> label; // string
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPURenderPipelineDescriptor>> {
  static std::shared_ptr<rnwgpu::GPURenderPipelineDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPURenderPipelineDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "vertex")) {
        auto prop = value.getProperty(runtime, "vertex");
        result->vertex = JSIConverter<std::shared_ptr<GPUVertexState>>::fromJSI(
            runtime, prop, false);
      }
      if (value.hasProperty(runtime, "primitive")) {
        auto prop = value.getProperty(runtime, "primitive");
        result->primitive = JSIConverter<
            std::optional<std::shared_ptr<GPUPrimitiveState>>>::fromJSI(runtime,
                                                                        prop,
                                                                        false);
      }
      if (value.hasProperty(runtime, "depthStencil")) {
        auto prop = value.getProperty(runtime, "depthStencil");
        result->depthStencil =
            JSIConverter<std::optional<std::shared_ptr<GPUDepthStencilState>>>::
                fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "multisample")) {
        auto prop = value.getProperty(runtime, "multisample");
        result->multisample =
            JSIConverter<std::optional<std::shared_ptr<GPUMultisampleState>>>::
                fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "fragment")) {
        auto prop = value.getProperty(runtime, "fragment");
        result->fragment = JSIConverter<
            std::optional<std::shared_ptr<GPUFragmentState>>>::fromJSI(runtime,
                                                                       prop,
                                                                       false);
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
        std::shared_ptr<rnwgpu::GPURenderPipelineDescriptor> arg) {
    throw std::runtime_error("Invalid GPURenderPipelineDescriptor::toJSI()");
  }
};

} // namespace rnwgpu