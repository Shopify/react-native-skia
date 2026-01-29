#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUBufferBindingLayout {
  std::optional<wgpu::BufferBindingType> type; // GPUBufferBindingType
  std::optional<bool> hasDynamicOffset;        // boolean
  std::optional<double> minBindingSize;        // GPUSize64
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUBufferBindingLayout>> {
  static std::shared_ptr<rnwgpu::GPUBufferBindingLayout>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUBufferBindingLayout>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "type")) {
        auto prop = value.getProperty(runtime, "type");
        result->type =
            JSIConverter<std::optional<wgpu::BufferBindingType>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "hasDynamicOffset")) {
        auto prop = value.getProperty(runtime, "hasDynamicOffset");
        result->hasDynamicOffset =
            JSIConverter<std::optional<bool>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "minBindingSize")) {
        auto prop = value.getProperty(runtime, "minBindingSize");
        result->minBindingSize =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUBufferBindingLayout> arg) {
    throw std::runtime_error("Invalid GPUBufferBindingLayout::toJSI()");
  }
};

} // namespace rnwgpu