#pragma once

#include <cstdint>
#include <memory>
#include <optional>
#include <string>

#include "webgpu/webgpu_cpp.h"

#include "jsi2/JSIConverter.h"

namespace jsi = facebook::jsi;

namespace rnwgpu {

// Descriptor for GPUDevice.importSharedTextureMemory.
//
// `handle` is a native buffer pointer as a uintptr_t (passed as a BigInt from
// JS), i.e. the value returned by Skia.NativeBuffer.MakeFromImage:
//   - Apple platforms: CVPixelBufferRef (its backing IOSurface is imported)
//   - Android: AHardwareBuffer*
//
// Lifetime: the caller is responsible for keeping the underlying object alive
// (via Skia.NativeBuffer.Release) for as long as this shared memory is in use.
struct GPUSharedTextureMemoryDescriptor {
  uint64_t handle = 0;
  std::optional<std::string> label;
};

} // namespace rnwgpu

namespace rnwgpu {

template <>
struct JSIConverter<std::shared_ptr<rnwgpu::GPUSharedTextureMemoryDescriptor>> {
  static std::shared_ptr<rnwgpu::GPUSharedTextureMemoryDescriptor>
  fromJSI(jsi::Runtime &runtime, const jsi::Value &arg, bool outOfBounds) {
    auto result = std::make_shared<rnwgpu::GPUSharedTextureMemoryDescriptor>();
    if (!outOfBounds && arg.isObject()) {
      auto value = arg.getObject(runtime);
      if (value.hasProperty(runtime, "handle")) {
        auto prop = value.getProperty(runtime, "handle");
        // The native buffer pointer arrives as a BigInt (uintptr_t value). It
        // must be a BigInt: a JS number can't represent a 64-bit pointer
        // without truncation, so we reject it rather than corrupt the address.
        if (prop.isBigInt()) {
          result->handle = prop.asBigInt(runtime).asUint64(runtime);
        } else if (!prop.isUndefined() && !prop.isNull()) {
          throw jsi::JSError(
              runtime, "GPUSharedTextureMemoryDescriptor.handle must be a "
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
    }
    return result;
  }
  static jsi::Value
  toJSI(jsi::Runtime & /*runtime*/,
        std::shared_ptr<rnwgpu::GPUSharedTextureMemoryDescriptor> /*arg*/) {
    throw std::runtime_error(
        "Invalid GPUSharedTextureMemoryDescriptor::toJSI()");
  }
};

} // namespace rnwgpu
