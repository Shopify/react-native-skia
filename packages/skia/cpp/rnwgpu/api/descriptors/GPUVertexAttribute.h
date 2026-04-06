#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUVertexAttribute {
  wgpu::VertexFormat format; // GPUVertexFormat
  double offset;             // GPUSize64
  double shaderLocation;     // GPUIndex32
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUVertexAttribute>> {
  static std::shared_ptr<rnwgpu::GPUVertexAttribute>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUVertexAttribute>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "format")) {
        auto prop = value.getProperty(runtime, "format");
        result->format =
            JSIConverter<wgpu::VertexFormat>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "offset")) {
        auto prop = value.getProperty(runtime, "offset");
        result->offset = JSIConverter<double>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "shaderLocation")) {
        auto prop = value.getProperty(runtime, "shaderLocation");
        result->shaderLocation =
            JSIConverter<double>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUVertexAttribute> arg) {
    throw std::runtime_error("Invalid GPUVertexAttribute::toJSI()");
  }
};

} // namespace rnwgpu