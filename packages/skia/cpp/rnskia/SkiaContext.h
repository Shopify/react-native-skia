#pragma once

#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"
#include "include/core/SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

class SkiaContext {
public:
  virtual ~SkiaContext() = default;
  virtual sk_sp<SkSurface> getSurface() = 0;
  virtual void present() = 0;
};

} // namespace RNSkia
