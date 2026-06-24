#pragma once

#include <memory>
#include <optional>
#include <string>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

// Descriptor for GPUDevice.importSharedFence. `handle` is the native handle
// (an id<MTLSharedEvent> pointer on Apple, an OS file descriptor on Android),
// passed from JS as a BigInt.
struct GPUSharedFenceDescriptor {
  std::string type;
  void *handle = nullptr;
  std::optional<std::string> label;
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUSharedFenceDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUSharedFenceDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUSharedFenceDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "type")) {
        result->type =
            value.getProperty(runtime, "type").asString(runtime).utf8(runtime);
      }
      if (value.hasProperty(runtime, "handle")) {
        auto prop = value.getProperty(runtime, "handle");
        result->handle = JSIConverter<void *>::fromJSI(runtime, prop, false);
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
  toJSI(jsi::Runtime & /*runtime*/,
        std::shared_ptr<rnwgpu::GPUSharedFenceDescriptor> /*arg*/) {
    throw std::runtime_error("Invalid GPUSharedFenceDescriptor::toJSI()");
  }
};

} // namespace rnwgpu
