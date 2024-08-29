#if __ANDROID_API__ >= 26

#include "AHardwareBufferUtils.h"
#include <android/hardware_buffer.h>

namespace RNSkia {

uint32_t GetBufferFormatFromSkColorType(SkColorType bufferFormat) {
  switch (bufferFormat) {
  case kRGBA_8888_SkColorType:
    return AHARDWAREBUFFER_FORMAT_R8G8B8A8_UNORM;
  case kRGB_888x_SkColorType:
    return AHARDWAREBUFFER_FORMAT_R8G8B8X8_UNORM;
  case kRGBA_F16_SkColorType:
    return AHARDWAREBUFFER_FORMAT_R16G16B16A16_FLOAT;
  case kRGB_565_SkColorType:
    return AHARDWAREBUFFER_FORMAT_R5G6B5_UNORM;
  case kRGBA_1010102_SkColorType:
    return AHARDWAREBUFFER_FORMAT_R10G10B10A2_UNORM;
#if __ANDROID_API__ >= 33
  case kAlpha_8_SkColorType:
    return AHARDWAREBUFFER_FORMAT_R8_UNORM;
#endif
  default:
    return AHARDWAREBUFFER_FORMAT_R8G8B8A8_UNORM;
  }
}

} // namespace RNSkia

#endif