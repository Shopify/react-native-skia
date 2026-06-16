#pragma once

#include <jsi/jsi.h>

#include "descriptors/GPUBufferUsage.h"
#include "descriptors/GPUColorWrite.h"
#include "descriptors/GPUMapMode.h"
#include "descriptors/GPUShaderStage.h"
#include "descriptors/GPUTextureUsage.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

// Installs the WebGPU flag constants (GPUBufferUsage, GPUColorWrite, GPUMapMode,
// GPUShaderStage, GPUTextureUsage) as plain JS objects on `runtime`'s global.
//
// The numeric values are derived from the Dawn wgpu::*Usage enums (single source
// of truth in C++), so this is safe to call on ANY runtime: the main JS runtime
// at install time, and any worklet runtime (Reanimated UI, dedicated worklet
// runtimes, Vision Camera frame processors) via the global `installWebGPU()`
// host function. It is idempotent: re-installing overwrites the globals with
// equal values.
inline void installWebGPUConstants(jsi::Runtime &runtime) {
  auto global = runtime.global();
  global.setProperty(runtime, "GPUBufferUsage",
                     GPUBufferUsage::create(runtime));
  global.setProperty(runtime, "GPUColorWrite", GPUColorWrite::create(runtime));
  global.setProperty(runtime, "GPUMapMode", GPUMapMode::create(runtime));
  global.setProperty(runtime, "GPUShaderStage",
                     GPUShaderStage::create(runtime));
  global.setProperty(runtime, "GPUTextureUsage",
                     GPUTextureUsage::create(runtime));
}

} // namespace rnwgpu
