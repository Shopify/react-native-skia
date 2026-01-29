#pragma once

#include <jsi/jsi.h>

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUMapMode {
public:
  static jsi::Object create(jsi::Runtime &runtime) {
    jsi::Object obj(runtime);
    obj.setProperty(runtime, "READ", static_cast<double>(wgpu::MapMode::Read));
    obj.setProperty(runtime, "WRITE",
                    static_cast<double>(wgpu::MapMode::Write));
    return obj;
  }
};

} // namespace rnwgpu
