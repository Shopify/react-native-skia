#pragma once

#include <memory>
#include <string>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "GPUBindGroupEntry.h"
#include "rnwgpu/api/GPUBindGroupLayout.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUBindGroupDescriptor {
  std::shared_ptr<GPUBindGroupLayout> layout; // GPUBindGroupLayout
  std::vector<std::shared_ptr<GPUBindGroupEntry>>
      entries;                      // Iterable<GPUBindGroupEntry>
  std::optional<std::string> label; // string
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUBindGroupDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUBindGroupDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUBindGroupDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "layout")) {
        auto prop = value.getProperty(runtime, "layout");
        result->layout =
            JSIConverter<std::shared_ptr<GPUBindGroupLayout>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "entries")) {
        auto prop = value.getProperty(runtime, "entries");
        result->entries = JSIConverter<
            std::vector<std::shared_ptr<GPUBindGroupEntry>>>::fromJSI(runtime,
                                                                      prop,
                                                                      false);
      }
      if (value.hasProperty(runtime, "label")) {
        auto prop = value.getProperty(runtime, "label");
        result->label = JSIConverter<std::optional<std::string>>::fromJSI(
            runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUBindGroupDescriptor> arg) {
    throw std::runtime_error("Invalid GPUBindGroupDescriptor::toJSI()");
  }
};

} // namespace rnwgpu