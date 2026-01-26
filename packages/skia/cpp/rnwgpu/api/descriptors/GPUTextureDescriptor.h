#pragma once

#include <memory>
#include <string>
#include <vector>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

#include "GPUExtent3D.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUTextureDescriptor {
  std::shared_ptr<GPUExtent3D> size;               // GPUExtent3DStrict
  std::optional<double> mipLevelCount;             // GPUIntegerCoordinate
  std::optional<double> sampleCount;               // GPUSize32
  std::optional<wgpu::TextureDimension> dimension; // GPUTextureDimension
  wgpu::TextureFormat format;                      // GPUTextureFormat
  double usage;                                    // GPUTextureUsageFlags
  std::optional<std::vector<wgpu::TextureFormat>>
      viewFormats;                  // Iterable<GPUTextureFormat>
  std::optional<std::string> label; // string
};

} // namespace rnwgpu

namespace rnwgpu {

template <> struct JSIConverter<std::shared_ptr<rnwgpu::GPUTextureDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUTextureDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUTextureDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "size")) {
        auto prop = value.getProperty(runtime, "size");
        result->size = JSIConverter<std::shared_ptr<GPUExtent3D>>::fromJSI(
            runtime, prop, false);
      }
      if (value.hasProperty(runtime, "mipLevelCount")) {
        auto prop = value.getProperty(runtime, "mipLevelCount");
        result->mipLevelCount =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "sampleCount")) {
        auto prop = value.getProperty(runtime, "sampleCount");
        result->sampleCount =
            JSIConverter<std::optional<double>>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "dimension")) {
        auto prop = value.getProperty(runtime, "dimension");
        result->dimension =
            JSIConverter<std::optional<wgpu::TextureDimension>>::fromJSI(
                runtime, prop, false);
      }
      if (value.hasProperty(runtime, "format")) {
        auto prop = value.getProperty(runtime, "format");
        result->format =
            JSIConverter<wgpu::TextureFormat>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "usage")) {
        auto prop = value.getProperty(runtime, "usage");
        result->usage = JSIConverter<double>::fromJSI(runtime, prop, false);
      }
      if (value.hasProperty(runtime, "viewFormats")) {
        auto prop = value.getProperty(runtime, "viewFormats");
        result->viewFormats = JSIConverter<
            std::optional<std::vector<wgpu::TextureFormat>>>::fromJSI(runtime,
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
                          std::shared_ptr<rnwgpu::GPUTextureDescriptor> arg) {
    throw std::runtime_error("Invalid GPUTextureDescriptor::toJSI()");
  }
};

} // namespace rnwgpu