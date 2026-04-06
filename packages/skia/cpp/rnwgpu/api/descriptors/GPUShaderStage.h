#pragma once

#include <jsi/jsi.h>

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUShaderStage {
public:
  static jsi::Object create(jsi::Runtime &runtime) {
    jsi::Object obj(runtime);
    obj.setProperty(runtime, "VERTEX",
                    static_cast<double>(wgpu::ShaderStage::Vertex));
    obj.setProperty(runtime, "FRAGMENT",
                    static_cast<double>(wgpu::ShaderStage::Fragment));
    obj.setProperty(runtime, "COMPUTE",
                    static_cast<double>(wgpu::ShaderStage::Compute));
    return obj;
  }
};

} // namespace rnwgpu
