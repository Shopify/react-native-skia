#pragma once

#include <cstdint>
#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "rnwgpu/api/GPUSharedFence.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

// A fence and the timeline value to wait for / signal at.
struct GPUSharedFenceState {
  std::shared_ptr<GPUSharedFence> fence;
  uint64_t signaledValue = 0;
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUSharedFenceState>> {
  static std::shared_ptr<rnwgpu::GPUSharedFenceState>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUSharedFenceState>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "fence")) {
        auto prop = value.getProperty(runtime, "fence");
        result->fence = JSIConverter<std::shared_ptr<GPUSharedFence>>::fromJSI(
            runtime, prop, false);
      }
      if (value.hasProperty(runtime, "signaledValue")) {
        auto prop = value.getProperty(runtime, "signaledValue");
        result->signaledValue =
            JSIConverter<uint64_t>::fromJSI(runtime, prop, false);
      }
    }
    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUSharedFenceState> arg) {
    throw std::runtime_error("Invalid GPUSharedFenceState::toJSI()");
  }
};

} // namespace rnwgpu
