#pragma once

#include <jsi/jsi.h>

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUBufferUsage {
public:
  static jsi::Object create(jsi::Runtime &runtime) {
    jsi::Object obj(runtime);
    obj.setProperty(runtime, "MAP_READ",
                    static_cast<double>(wgpu::BufferUsage::MapRead));
    obj.setProperty(runtime, "MAP_WRITE",
                    static_cast<double>(wgpu::BufferUsage::MapWrite));
    obj.setProperty(runtime, "COPY_SRC",
                    static_cast<double>(wgpu::BufferUsage::CopySrc));
    obj.setProperty(runtime, "COPY_DST",
                    static_cast<double>(wgpu::BufferUsage::CopyDst));
    obj.setProperty(runtime, "INDEX",
                    static_cast<double>(wgpu::BufferUsage::Index));
    obj.setProperty(runtime, "VERTEX",
                    static_cast<double>(wgpu::BufferUsage::Vertex));
    obj.setProperty(runtime, "UNIFORM",
                    static_cast<double>(wgpu::BufferUsage::Uniform));
    obj.setProperty(runtime, "STORAGE",
                    static_cast<double>(wgpu::BufferUsage::Storage));
    obj.setProperty(runtime, "INDIRECT",
                    static_cast<double>(wgpu::BufferUsage::Indirect));
    obj.setProperty(runtime, "QUERY_RESOLVE",
                    static_cast<double>(wgpu::BufferUsage::QueryResolve));
    return obj;
  }
};

} // namespace rnwgpu
