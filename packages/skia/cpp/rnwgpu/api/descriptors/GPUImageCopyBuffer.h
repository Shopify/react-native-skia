#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUBuffer.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUImageCopyBuffer {
  std::shared_ptr<GPUBuffer> buffer;  // GPUBuffer
  std::optional<double> offset;       // GPUSize64
  std::optional<double> bytesPerRow;  // GPUSize32
  std::optional<double> rowsPerImage; // GPUSize32
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUImageCopyBuffer>> {
  static std::shared_ptr<rnwgpu::GPUImageCopyBuffer>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUImageCopyBuffer>();
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
      if (value.hasProperty(runtime, "bytesPerRow")) {
        auto prop = value.getProperty(runtime, "bytesPerRow");
        result->bytesPerRow =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "rowsPerImage")) {
        auto prop = value.getProperty(runtime, "rowsPerImage");
        result->rowsPerImage =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUImageCopyBuffer> arg) {
    throw std::runtime_error("Invalid GPUImageCopyBuffer::toJSI()");
  }
};

} // namespace rnwgpu