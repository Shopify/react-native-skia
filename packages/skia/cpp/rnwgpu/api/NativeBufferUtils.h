#pragma once

#include <cstdint>
#include <stdexcept>
#include <string>

#include "webgpu/webgpu_cpp.h"

#if defined(__APPLE__)
#include "AppleNativeBuffer.h"
#elif defined(__ANDROID__)
#include <android/hardware_buffer.h>
#endif

namespace rnwgpu {

// Import a Skia NativeBuffer pointer (a CVPixelBufferRef on Apple, an
// AHardwareBuffer* on Android, as returned by Skia.NativeBuffer.MakeFromImage /
// MakeTestBuffer) as a wgpu::SharedTextureMemory on `device`. When non-null,
// outWidth/outHeight receive the surface dimensions. Returns a null
// SharedTextureMemory if the import itself fails (the caller decides how to
// report that); throws std::runtime_error for pre-import failures (a buffer
// with no IOSurface, or an unsupported platform).
//
// The platform-specific chained descriptor only needs to outlive the
// ImportSharedTextureMemory call, so it lives entirely within this function.
// Shared by GPUDevice::importSharedTextureMemory and
// GPUExternalTexture::Create.
inline wgpu::SharedTextureMemory importNativeBufferAsSharedTextureMemory(
    const wgpu::Device &device, void *bufferPtr, const std::string &label,
    uint32_t *outWidth, uint32_t *outHeight) {
  wgpu::SharedTextureMemoryDescriptor memDesc{};
  if (!label.empty()) {
    memDesc.label = wgpu::StringView(label.c_str(), label.size());
  }

  uint32_t width = 0;
  uint32_t height = 0;
  wgpu::SharedTextureMemory memory;

#if defined(__APPLE__)
  // Skia's NativeBuffer is a CVPixelBufferRef; extract its backing IOSurface
  // (and dimensions) in Objective-C++ since CoreVideo isn't available here.
  void *ioSurface = GetIOSurfaceFromNativeBuffer(bufferPtr, &width, &height);
  if (ioSurface == nullptr) {
    throw std::runtime_error(
        "importNativeBufferAsSharedTextureMemory(): native "
        "buffer has no IOSurface");
  }
  wgpu::SharedTextureMemoryIOSurfaceDescriptor platformDesc{};
  platformDesc.ioSurface = ioSurface;
  // Default off: enabling it propagates StorageBinding into properties.usage,
  // which then forces memory.createTexture() (no-descriptor form) to validate
  // the format against storage capabilities. bgra8unorm (the standard
  // CVPixelBuffer format) only supports storage when the device opts into the
  // bgra8unorm-storage feature, so unconditionally setting this here breaks the
  // common sample-only case.
  platformDesc.allowStorageBinding = false;
  memDesc.nextInChain = &platformDesc;
  memory = device.ImportSharedTextureMemory(&memDesc);
#elif defined(__ANDROID__)
  auto *ahb = reinterpret_cast<AHardwareBuffer *>(bufferPtr);
  AHardwareBuffer_Desc ahbDesc = {};
  AHardwareBuffer_describe(ahb, &ahbDesc);
  width = ahbDesc.width;
  height = ahbDesc.height;
  wgpu::SharedTextureMemoryAHardwareBufferDescriptor platformDesc{};
  platformDesc.handle = ahb;
  memDesc.nextInChain = &platformDesc;
  memory = device.ImportSharedTextureMemory(&memDesc);
#else
  (void)device;
  (void)bufferPtr;
  throw std::runtime_error(
      "importNativeBufferAsSharedTextureMemory(): unsupported platform");
#endif

  if (outWidth != nullptr) {
    *outWidth = width;
  }
  if (outHeight != nullptr) {
    *outHeight = height;
  }
  return memory;
}

} // namespace rnwgpu
