#pragma once

#include <memory>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "GPUVertexAttribute.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUVertexBufferLayout {
  double arrayStride;                           // GPUSize64
  std::optional<wgpu::VertexStepMode> stepMode; // GPUVertexStepMode
  std::vector<std::shared_ptr<GPUVertexAttribute>>
      attributes; // Iterable<GPUVertexAttribute>
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUVertexBufferLayout>> {
  static std::shared_ptr<rnwgpu::GPUVertexBufferLayout>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUVertexBufferLayout>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "arrayStride")) {
        auto prop = value.getProperty(runtime, "arrayStride");
        result->arrayStride =
            JSIConverter<double>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "stepMode")) {
        auto prop = value.getProperty(runtime, "stepMode");
        result->stepMode =
            JSIConverter<std::optional<wgpu::VertexStepMode>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "attributes")) {
        auto prop = value.getProperty(runtime, "attributes");
        result->attributes = JSIConverter<
            std::vector<std::shared_ptr<GPUVertexAttribute>>>::fromJSI(runtime,
                                                                       prop,
                                                                       false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUVertexBufferLayout> arg) {
    throw std::runtime_error("Invalid GPUVertexBufferLayout::toJSI()");
  }
};

} // namespace rnwgpu