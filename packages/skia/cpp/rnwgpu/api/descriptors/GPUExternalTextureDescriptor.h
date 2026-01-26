#pragma once

#include <memory>
#include <optional>
#include <string>
#include <variant>

#include "webgpu/webgpu_cpp.h"

#include "Convertors.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

struct GPUExternalTextureDescriptor {
  // std::variant<std::shared_ptr<HTMLVideoElement>,
  // std::shared_ptr<VideoFrame>>
  //     source; // | HTMLVideoElement | VideoFrame
  // std::optional<wgpu::DefinedColorSpace> colorSpace; // PredefinedColorSpace
  std::optional<std::string> label; // string
};

static bool conv(wgpu::ExternalTextureDescriptor &out,
                 const std::shared_ptr<GPUExternalTextureDescriptor> &in) {
  // TODO: implement
  // return conv(out.source, in->source) && conv(out.colorSpace, in->colorSpace)
  // &&
  // return conv(out.label, in->label);
  return false;
}
} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUExternalTextureDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUExternalTextureDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_unique<rnwgpu::GPUExternalTextureDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "source")) {
        auto prop = value.getProperty(runtime, "source");
        // result->source = JSIConverter<
        //     std::variant<std::shared_ptr<HTMLVideoElement>,
        //                  std::shared_ptr<VideoFrame>>>::fromJSI(runtime,
        //                  prop,
        //                                                         false);
      }
      if (value.hasProperty(runtime, "colorSpace")) {
        auto prop = value.getProperty(runtime, "colorSpace");
        if (!prop.isUndefined()) {
          // result->colorSpace =
          //     JSIConverter<std::optional<wgpu::definedColorSpace>>::fromJSI(
          //         runtime, prop, false);
        }
      }
      if (value.hasProperty(runtime, "label")) {
        auto prop = value.getProperty(runtime, "label");
        if (!prop.isUndefined()) {
          result->label = JSIConverter<std::optional<std::string>>::fromJSI(
              runtime, prop, false);
        }
      }
    }

    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime &runtime,
        std::shared_ptr<rnwgpu::GPUExternalTextureDescriptor> arg) {
    throw std::runtime_error("Invalid GPUExternalTextureDescriptor::toJSI()");
  }
};

} // namespace rnwgpu
