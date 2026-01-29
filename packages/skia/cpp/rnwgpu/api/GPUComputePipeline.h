#pragma once

#include <memory>
#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

#include "GPUBindGroupLayout.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUComputePipeline : public NativeObject<GPUComputePipeline> {
public:
  static constexpr const char *CLASS_NAME = "GPUComputePipeline";

  explicit GPUComputePipeline(wgpu::ComputePipeline instance, std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::shared_ptr<GPUBindGroupLayout> getBindGroupLayout(uint32_t index);

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUComputePipeline::getBrand);
    installMethod(runtime, prototype, "getBindGroupLayout",
                  &GPUComputePipeline::getBindGroupLayout);
    installGetterSetter(runtime, prototype, "label",
                        &GPUComputePipeline::getLabel,
                        &GPUComputePipeline::setLabel);
  }

  inline const wgpu::ComputePipeline get() { return _instance; }

  size_t getMemoryPressure() override {
    // Compute pipelines contain compiled compute shader state and
    // driver-specific optimized code
    // Estimate: 16KB for a typical compute pipeline (single compute shader)
    return 16 * 1024;
  }

private:
  wgpu::ComputePipeline _instance;
  std::string _label;
  friend class GPUDevice;
};

} // namespace rnwgpu
