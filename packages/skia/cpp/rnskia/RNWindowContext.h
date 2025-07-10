#pragma once

#include <string>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"
#include "include/core/SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

class WindowContext {
public:
  virtual ~WindowContext() = default;
  virtual sk_sp<SkSurface> getSurface() = 0;
  virtual void present() = 0;
  virtual void resize(int width, int height) = 0;
  virtual int getWidth() = 0;
  virtual int getHeight() = 0;
};

} // namespace RNSkia
