#pragma once

#include <string>

namespace RNSkia {

/**
 * Pixel format selection for the on-screen Metal drawable.
 *
 * The strings used on the JS side are mirrored here so the JS prop
 * value (e.g. "rgba16f") can be translated at the bridge boundary
 * with a single helper.
 */
enum class WindowPixelFormat {
  BGRA8 = 0,   // MTLPixelFormatBGRA8Unorm, kBGRA_8888_SkColorType
  BGRA10 = 1,  // MTLPixelFormatBGR10A2Unorm, kBGRA_1010102_SkColorType
  RGBA16F = 2, // MTLPixelFormatRGBA16Float, kRGBA_F16_SkColorType (EDR)
};

inline WindowPixelFormat windowPixelFormatFromString(const std::string &name) {
  if (name == "bgra10") {
    return WindowPixelFormat::BGRA10;
  }
  if (name == "rgba16f") {
    return WindowPixelFormat::RGBA16F;
  }
  return WindowPixelFormat::BGRA8;
}

} // namespace RNSkia
