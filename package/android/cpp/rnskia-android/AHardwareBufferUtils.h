#pragma once

#include "include/core/SkColorType.h"

#if __ANDROID_API__ >= 26

namespace RNSkia {

uint32_t GetBufferFormatFromSkColorType(SkColorType bufferFormat);

} // namespace RNSkia

#endif