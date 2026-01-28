#pragma once

#include <jsi/jsi.h>

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUTextureUsage {
public:
  static jsi::Object create(jsi::Runtime &runtime) {
    jsi::Object obj(runtime);
    obj.setProperty(runtime, "COPY_SRC",
                    static_cast<double>(wgpu::TextureUsage::CopySrc));
    obj.setProperty(runtime, "COPY_DST",
                    static_cast<double>(wgpu::TextureUsage::CopyDst));
    obj.setProperty(runtime, "TEXTURE_BINDING",
                    static_cast<double>(wgpu::TextureUsage::TextureBinding));
    obj.setProperty(runtime, "STORAGE_BINDING",
                    static_cast<double>(wgpu::TextureUsage::StorageBinding));
    obj.setProperty(runtime, "RENDER_ATTACHMENT",
                    static_cast<double>(wgpu::TextureUsage::RenderAttachment));
    return obj;
  }
};

} // namespace rnwgpu
