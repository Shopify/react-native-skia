#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "GPUBlendState.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUColorTargetState {
  wgpu::TextureFormat format;                          // GPUTextureFormat
  std::optional<std::shared_ptr<GPUBlendState>> blend; // GPUBlendState
  std::optional<double> writeMask;                     // GPUColorWriteFlags
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUColorTargetState>> {
  static std::shared_ptr<rnwgpu::GPUColorTargetState>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUColorTargetState>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "format")) {
        auto prop = value.getProperty(runtime, "format");
        result->format =
            JSIConverter<wgpu::TextureFormat>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "blend")) {
        auto prop = value.getProperty(runtime, "blend");
        result->blend = JSIConverter<
            std::optional<std::shared_ptr<GPUBlendState>>>::fromJSI(runtime,
                                                                    prop,
                                                                    false);
      }
      if (value.hasProperty(runtime, "writeMask")) {
        auto prop = value.getProperty(runtime, "writeMask");
        result->writeMask =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUColorTargetState> arg) {
    throw std::runtime_error("Invalid GPUColorTargetState::toJSI()");
  }
};

} // namespace rnwgpu