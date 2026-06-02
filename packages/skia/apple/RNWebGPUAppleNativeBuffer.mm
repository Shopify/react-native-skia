#ifdef SK_GRAPHITE

#import <CoreVideo/CoreVideo.h>

#include "rnwgpu/api/AppleNativeBuffer.h"

namespace rnwgpu {

void *GetIOSurfaceFromNativeBuffer(void *cvPixelBuffer, uint32_t *outWidth,
                                   uint32_t *outHeight) {
  auto pixelBuffer = reinterpret_cast<CVPixelBufferRef>(cvPixelBuffer);
  if (pixelBuffer == nullptr) {
    if (outWidth != nullptr) {
      *outWidth = 0;
    }
    if (outHeight != nullptr) {
      *outHeight = 0;
    }
    return nullptr;
  }
  if (outWidth != nullptr) {
    *outWidth = static_cast<uint32_t>(CVPixelBufferGetWidth(pixelBuffer));
  }
  if (outHeight != nullptr) {
    *outHeight = static_cast<uint32_t>(CVPixelBufferGetHeight(pixelBuffer));
  }
  // The IOSurface is owned by the CVPixelBuffer; we don't retain it here.
  return CVPixelBufferGetIOSurface(pixelBuffer);
}

} // namespace rnwgpu

#endif // SK_GRAPHITE
