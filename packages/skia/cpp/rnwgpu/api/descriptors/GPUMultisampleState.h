#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUMultisampleState {
  std::optional<double> count;                // GPUSize32
  std::optional<double> mask;                 // GPUSampleMask
  std::optional<bool> alphaToCoverageEnabled; // boolean
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUMultisampleState>> {
  static std::shared_ptr<rnwgpu::GPUMultisampleState>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUMultisampleState>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "count")) {
        auto prop = value.getProperty(runtime, "count");
        result->count =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "mask")) {
        auto prop = value.getProperty(runtime, "mask");
        result->mask =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "alphaToCoverageEnabled")) {
        auto prop = value.getProperty(runtime, "alphaToCoverageEnabled");
        result->alphaToCoverageEnabled =
            JSIConverter<std::optional<bool>>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUMultisampleState> arg) {
    throw std::runtime_error("Invalid GPUMultisampleState::toJSI()");
  }
};

} // namespace rnwgpu