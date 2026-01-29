#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUBuffer.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUBufferBinding {
  std::shared_ptr<GPUBuffer> buffer; // GPUBuffer
  std::optional<double> offset;      // GPUSize64
  std::optional<double> size;        // GPUSize64
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUBufferBinding>> {
  static std::shared_ptr<rnwgpu::GPUBufferBinding>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUBufferBinding>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "buffer")) {
        auto prop = value.getProperty(runtime, "buffer");
        result->buffer = JSIConverter<std::shared_ptr<GPUBuffer>>::fromJSI(
            runtime, prop, false);
      }
      if (value.hasProperty(runtime, "offset")) {
        auto prop = value.getProperty(runtime, "offset");
        result->offset =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "size")) {
        auto prop = value.getProperty(runtime, "size");
        result->size =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUBufferBinding> arg) {
    throw std::runtime_error("Invalid GPUBufferBinding::toJSI()");
  }
};

} // namespace rnwgpu