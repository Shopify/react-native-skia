#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

class PlatformContext {
public:
  PlatformContext() = default;
  virtual ~PlatformContext() = default;

  virtual wgpu::Surface makeSurface(wgpu::Instance instance, void *surface,
                                    int width, int height) = 0;
};

} // namespace rnwgpu
