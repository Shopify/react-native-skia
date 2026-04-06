#pragma once

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {
enum class PredefinedColorSpace : uint32_t {
  DisplayP3 = 0,
  Srgb = 1,
};

enum class PremultiplyAlpha : uint32_t { Default = 0, None = 1, Premultiply };
} // namespace rnwgpu
