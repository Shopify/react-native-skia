
#pragma once

#include <memory>
#include "include/gpu/GrDirectContext.h"

namespace RNSkia {

/**
 * Skia context for the platform-specific graphics API.
 */
class RNSkContext {
public:
  virtual std::shared_ptr<GrDirectContext> getDirectContext() = 0;
  virtual bool isValid() = 0;
};

} // namespace RNSkia
