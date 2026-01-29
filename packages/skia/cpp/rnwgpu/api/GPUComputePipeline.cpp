#include "GPUComputePipeline.h"
#include <memory>

namespace rnwgpu {

std::shared_ptr<GPUBindGroupLayout>
GPUComputePipeline::getBindGroupLayout(uint32_t groupIndex) {
  auto bindGroup = _instance.GetBindGroupLayout(groupIndex);
  return std::make_shared<GPUBindGroupLayout>(bindGroup, "");
}

} // namespace rnwgpu