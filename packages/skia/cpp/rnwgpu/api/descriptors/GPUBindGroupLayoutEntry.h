#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "GPUBufferBindingLayout.h"
#include "GPUExternalTextureBindingLayout.h"
#include "GPUSamplerBindingLayout.h"
#include "GPUStorageTextureBindingLayout.h"
#include "GPUTextureBindingLayout.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUBindGroupLayoutEntry {
  double binding;    // GPUIndex32
  double visibility; // GPUShaderStageFlags
  std::optional<std::shared_ptr<GPUBufferBindingLayout>>
      buffer; // GPUBufferBindingLayout
  std::optional<std::shared_ptr<GPUSamplerBindingLayout>>
      sampler; // GPUSamplerBindingLayout
  std::optional<std::shared_ptr<GPUTextureBindingLayout>>
      texture; // GPUTextureBindingLayout
  std::optional<std::shared_ptr<GPUStorageTextureBindingLayout>>
      storageTexture; // GPUStorageTextureBindingLayout
  std::optional<std::shared_ptr<GPUExternalTextureBindingLayout>>
      externalTexture; // GPUExternalTextureBindingLayout
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUBindGroupLayoutEntry>> {
  static std::shared_ptr<rnwgpu::GPUBindGroupLayoutEntry>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUBindGroupLayoutEntry>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "binding")) {
        auto prop = value.getProperty(runtime, "binding");
        result->binding = JSIConverter<double>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "visibility")) {
        auto prop = value.getProperty(runtime, "visibility");
        result->visibility =
            JSIConverter<double>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "buffer")) {
        auto prop = value.getProperty(runtime, "buffer");
        result->buffer = JSIConverter<std::optional<
            std::shared_ptr<GPUBufferBindingLayout>>>::fromJSI(runtime, prop,
                                                               false);
      }
      if (value.hasProperty(runtime, "sampler")) {
        auto prop = value.getProperty(runtime, "sampler");
        result->sampler = JSIConverter<std::optional<
            std::shared_ptr<GPUSamplerBindingLayout>>>::fromJSI(runtime, prop,
                                                                false);
      }
      if (value.hasProperty(runtime, "texture")) {
        auto prop = value.getProperty(runtime, "texture");
        result->texture = JSIConverter<std::optional<
            std::shared_ptr<GPUTextureBindingLayout>>>::fromJSI(runtime, prop,
                                                                false);
      }
      if (value.hasProperty(runtime, "storageTexture")) {
        auto prop = value.getProperty(runtime, "storageTexture");
        result->storageTexture = JSIConverter<std::optional<
            std::shared_ptr<GPUStorageTextureBindingLayout>>>::fromJSI(runtime,
                                                                       prop,
                                                                       false);
      }
      if (value.hasProperty(runtime, "externalTexture")) {
        auto prop = value.getProperty(runtime, "externalTexture");
        result->externalTexture = JSIConverter<std::optional<
            std::shared_ptr<GPUExternalTextureBindingLayout>>>::fromJSI(runtime,
                                                                        prop,
                                                                        false);
      }
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPUBindGroupLayoutEntry> arg) {
    throw std::runtime_error("Invalid GPUBindGroupLayoutEntry::toJSI()");
  }
};

} // namespace rnwgpu