#include "GPUQuerySet.h"

namespace rnwgpu {

void GPUQuerySet::destroy() { _instance.Destroy(); }

wgpu::QueryType GPUQuerySet::getType() { return _instance.GetType(); }

uint32_t GPUQuerySet::getCount() { return _instance.GetCount(); }

} // namespace rnwgpu