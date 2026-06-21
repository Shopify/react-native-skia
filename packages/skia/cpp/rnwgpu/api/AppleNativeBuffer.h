#pragma once

#if defined(__APPLE__)

#include <cstdint>

namespace rnwgpu {

// Extract the backing IOSurface and dimensions from a CVPixelBufferRef pointer
// (the value Skia's NativeBuffer.MakeFromImage returns on Apple). The returned
// IOSurfaceRef is owned by the CVPixelBuffer; the caller must keep the
// CVPixelBuffer alive while the IOSurface is in use. Returns nullptr (and
// leaves the out-params at 0) if the buffer has no IOSurface.
//
// Defined in apple/RNWebGPUAppleNativeBuffer.mm (Objective-C++ so it can use
// CoreVideo, which isn't available from the cpp/ translation units).
void *GetIOSurfaceFromNativeBuffer(void *cvPixelBuffer, uint32_t *outWidth,
                                   uint32_t *outHeight);

} // namespace rnwgpu

#endif // __APPLE__
