#pragma once

#include <cstdint>
#include <memory>
#include <optional>
#include <string>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

// Mirror of GPUExternalTextureDescriptor from the WebGPU spec, adapted to
// Skia's binding. Skia has no VideoFrame; instead `source` is a native buffer
// pointer (the BigInt returned by Skia.NativeBuffer.MakeFromImage): a
// CVPixelBufferRef on Apple, an AHardwareBuffer* on Android. The pointer's
// lifetime is owned by the caller (Skia.NativeBuffer.Release); the imported
// texture must not outlive it.
//
// We don't expose colorSpace yet; the C++ side picks dst-sRGB and identity
// gamut, the right default for "render this BGRA frame to an sRGB framebuffer".
//
// `rotation` / `mirrored` are a non-spec extension baked into Dawn's sampling
// transform. `rotation` is in degrees and must be one of 0 / 90 / 180 / 270.
struct GPUExternalTextureDescriptor {
  // native buffer pointer (CVPixelBufferRef / AHardwareBuffer*)
  uint64_t source = 0;
  std::optional<std::string> label;
  std::optional<double> rotation;
  std::optional<bool> mirrored;
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUExternalTextureDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUExternalTextureDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_shared<rnwgpu::GPUExternalTextureDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "source")) {
        auto prop = value.getProperty(runtime, "source");
        // The native buffer pointer arrives as a BigInt (uintptr_t value). It
        // must be a BigInt: a JS number can't represent a 64-bit pointer
        // without truncation, so we reject it rather than corrupt the address.
        if (prop.isBigInt()) {
          result->source = prop.asBigInt(runtime).asUint64(runtime);
        } else if (!prop.isUndefined() && !prop.isNull()) {
          throw jsi::JSError(
              runtime, "GPUExternalTextureDescriptor.source must be a "
                       "NativeBuffer (BigInt) from "
                       "Skia.NativeBuffer.MakeFromImage / MakeTestBuffer");
        }
      }
      if (value.hasProperty(runtime, "label")) {
        auto prop = value.getProperty(runtime, "label");
        if (!prop.isUndefined()) {
          result->label = JSIConverter<std::optional<std::string>>::fromJSI(
              runtime, prop, false);
        }
      }
      if (value.hasProperty(runtime, "rotation")) {
        auto prop = value.getProperty(runtime, "rotation");
        if (prop.isNumber()) {
          result->rotation = prop.asNumber();
        }
      }
      if (value.hasProperty(runtime, "mirrored")) {
        auto prop = value.getProperty(runtime, "mirrored");
        if (prop.isBool()) {
          result->mirrored = prop.getBool();
        }
      }
    }
    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime & /*runtime*/,
        std::shared_ptr<rnwgpu::GPUExternalTextureDescriptor> /*arg*/) {
    throw std::runtime_error("Invalid GPUExternalTextureDescriptor::toJSI()");
  }
};

} // namespace rnwgpu
