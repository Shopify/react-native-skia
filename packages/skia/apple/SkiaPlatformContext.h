#pragma once

#ifdef SK_GRAPHITE

#include "rnwgpu/PlatformContext.h"

namespace rnwgpu {

class SkiaPlatformContext : public PlatformContext {
public:
  SkiaPlatformContext() = default;
  ~SkiaPlatformContext() = default;

  wgpu::Surface makeSurface(wgpu::Instance instance, void *surface, int width,
                            int height) override;
};

} // namespace rnwgpu

#endif // SK_GRAPHITE
