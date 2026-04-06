#pragma once

#include <memory>
#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

#include "GPUBindGroupLayout.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPURenderPipeline : public NativeObject<GPURenderPipeline> {
public:
  static constexpr const char *CLASS_NAME = "GPURenderPipeline";

  explicit GPURenderPipeline(wgpu::RenderPipeline instance, std::string label)
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
    installGetter(runtime, prototype, "__brand", &GPURenderPipeline::getBrand);
    installMethod(runtime, prototype, "getBindGroupLayout",
                  &GPURenderPipeline::getBindGroupLayout);
    installGetterSetter(runtime, prototype, "label",
                        &GPURenderPipeline::getLabel,
                        &GPURenderPipeline::setLabel);
  }

  inline const wgpu::RenderPipeline get() { return _instance; }

  size_t getMemoryPressure() override {
    // Render pipelines contain compiled shader state, vertex/fragment shaders,
    // render state, and driver-specific optimized code
    // Estimate: 24KB for a typical render pipeline with vertex + fragment
    // shaders
    return 24 * 1024;
  }

private:
  wgpu::RenderPipeline _instance;
  std::string _label;
  friend class GPUDevice;
};

} // namespace rnwgpu
