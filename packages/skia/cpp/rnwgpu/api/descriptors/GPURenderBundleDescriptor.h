#pragma once

#include <memory>
#include <string>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPURenderBundleDescriptor {
  std::optional<std::string> label; // string
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPURenderBundleDescriptor>> {
  static std::shared_ptr<rnwgpu::GPURenderBundleDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPURenderBundleDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
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
        std::shared_ptr<rnwgpu::GPURenderBundleDescriptor> arg) {
    throw std::runtime_error("Invalid GPURenderBundleDescriptor::toJSI()");
  }
};

} // namespace rnwgpu