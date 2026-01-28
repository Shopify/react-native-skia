#pragma once

#include <memory>
#include <variant>

#include "webgpu/webgpu_cpp.h"

#include "GPUBufferBinding.h"
#include "rnwgpu/api/GPUExternalTexture.h"
#include "rnwgpu/api/GPUSampler.h"
#include "rnwgpu/api/GPUTextureView.h"
#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUBindGroupEntry {
  double binding;
  std::shared_ptr<GPUSampler> sampler = nullptr;
  std::shared_ptr<GPUTextureView> textureView = nullptr;
  std::shared_ptr<GPUBufferBinding> buffer = nullptr;
  // external textures
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUBindGroupEntry>> {
  static std::shared_ptr<rnwgpu::GPUBindGroupEntry>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUBindGroupEntry>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "binding")) {
        result->binding = value.getProperty(runtime, "binding").asNumber();
      }
      if (value.hasProperty(runtime, "resource")) {
        auto prop = value.getProperty(runtime, "resource");
        if (prop.isObject()) {
          auto obj = prop.getObject(runtime);
          if (obj.hasNativeState<rnwgpu::GPUSampler>(runtime)) {
            result->sampler = obj.getNativeState<rnwgpu::GPUSampler>(runtime);
          } else if (obj.hasNativeState<rnwgpu::GPUTextureView>(runtime)) {
            result->textureView =
                obj.getNativeState<rnwgpu::GPUTextureView>(runtime);
          } else {
            result->buffer = JSIConverter<
                std::shared_ptr<rnwgpu::GPUBufferBinding>>::fromJSI(runtime,
                                                                    prop,
                                                                    false);
          }
        }
        // result->resource = JSIConverter<std::variant<
        //     std::shared_ptr<GPUSampler>, std::shared_ptr<GPUTextureView>,
        //     std::shared_ptr<GPUBufferBinding>,
        //     std::shared_ptr<GPUExternalTexture>>>::fromJSI(runtime, prop,
        //                                                    false);
      }
    }

    return result;
  }
  static jsi::Value toJSI(jsi::Runtime &runtime,
                          std::shared_ptr<rnwgpu::GPUBindGroupEntry> arg) {
    throw std::runtime_error("Invalid GPUBindGroupEntry::toJSI()");
  }
};

} // namespace rnwgpu
