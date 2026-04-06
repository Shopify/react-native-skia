#pragma once

#include <jsi/jsi.h>

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUColorWrite {
public:
  static jsi::Object create(jsi::Runtime &runtime) {
    jsi::Object obj(runtime);
    obj.setProperty(runtime, "RED",
                    static_cast<double>(wgpu::ColorWriteMask::Red));
    obj.setProperty(runtime, "GREEN",
                    static_cast<double>(wgpu::ColorWriteMask::Green));
    obj.setProperty(runtime, "BLUE",
                    static_cast<double>(wgpu::ColorWriteMask::Blue));
    obj.setProperty(runtime, "ALPHA",
                    static_cast<double>(wgpu::ColorWriteMask::Alpha));
    obj.setProperty(runtime, "ALL",
                    static_cast<double>(wgpu::ColorWriteMask::All));
    return obj;
  }
};

} // namespace rnwgpu
