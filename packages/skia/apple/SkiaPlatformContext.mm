#ifdef SK_GRAPHITE

#include "SkiaPlatformContext.h"

#include <TargetConditionals.h>

namespace rnwgpu {

wgpu::Surface SkiaPlatformContext::makeSurface(wgpu::Instance instance,
                                                void *surface, int width,
                                                int height) {
  wgpu::SurfaceSourceMetalLayer metalSurfaceDesc;
  metalSurfaceDesc.layer = surface;
  wgpu::SurfaceDescriptor surfaceDescriptor;
  surfaceDescriptor.nextInChain = &metalSurfaceDesc;
  return instance.CreateSurface(&surfaceDescriptor);
}

} // namespace rnwgpu

#endif // SK_GRAPHITE
