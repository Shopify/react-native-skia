#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUStorageTextureBindingLayout {
  std::optional<wgpu::StorageTextureAccess> access; // GPUStorageTextureAccess
  wgpu::TextureFormat format;                       // GPUTextureFormat
  std::optional<wgpu::TextureViewDimension>
      viewDimension; // GPUTextureViewDimension
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUStorageTextureBindingLayout>> {
  static std::shared_ptr<rnwgpu::GPUStorageTextureBindingLayout>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUStorageTextureBindingLayout>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "access")) {
        auto prop = value.getProperty(runtime, "access");
        result->access =
            JSIConverter<std::optional<wgpu::StorageTextureAccess>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "format")) {
        auto prop = value.getProperty(runtime, "format");
        result->format =
            JSIConverter<wgpu::TextureFormat>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "viewDimension")) {
        auto prop = value.getProperty(runtime, "viewDimension");
        result->viewDimension =
            JSIConverter<std::optional<wgpu::TextureViewDimension>>::fromJSI(
                runtime, prop, false);
      }
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPUStorageTextureBindingLayout> arg) {
    throw std::runtime_error("Invalid GPUStorageTextureBindingLayout::toJSI()");
  }
};

} // namespace rnwgpu