#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUTextureBindingLayout {
  std::optional<wgpu::TextureSampleType> sampleType; // GPUTextureSampleType
  std::optional<wgpu::TextureViewDimension>
      viewDimension;                // GPUTextureViewDimension
  std::optional<bool> multisampled; // boolean
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUTextureBindingLayout>> {
  static std::shared_ptr<rnwgpu::GPUTextureBindingLayout>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUTextureBindingLayout>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "sampleType")) {
        auto prop = value.getProperty(runtime, "sampleType");
        result->sampleType =
            JSIConverter<std::optional<wgpu::TextureSampleType>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "viewDimension")) {
        auto prop = value.getProperty(runtime, "viewDimension");
        result->viewDimension =
            JSIConverter<std::optional<wgpu::TextureViewDimension>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "multisampled")) {
        auto prop = value.getProperty(runtime, "multisampled");
        result->multisampled =
            JSIConverter<std::optional<bool>>::fromJSI(runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPUTextureBindingLayout> arg) {
    throw std::runtime_error("Invalid GPUTextureBindingLayout::toJSI()");
  }
};

} // namespace rnwgpu