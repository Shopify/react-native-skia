
#pragma once

#include <memory>
#include "include/gpu/GrDirectContext.h"
#include "include/core/SkRefCnt.h"

namespace RNSkia {

/**
 * Skia context for the platform-specific graphics API.
 */
class RNSkContext {
public:
  virtual sk_sp<GrDirectContext> getDirectContext() = 0;
  virtual bool isValid() = 0;
};

} // namespace RNSkia
