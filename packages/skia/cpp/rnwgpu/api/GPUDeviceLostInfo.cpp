#include "GPUDeviceLostInfo.h"
#include <string>

namespace rnwgpu {
wgpu::DeviceLostReason getReason();
std::string getMessage();
} // namespace rnwgpu