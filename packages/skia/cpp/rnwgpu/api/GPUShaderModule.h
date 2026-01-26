#pragma once

#include <memory>
#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "rnwgpu/async/AsyncRunner.h"
#include "rnwgpu/async/AsyncTaskHandle.h"

#include "webgpu/webgpu_cpp.h"

#include "GPUCompilationInfo.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUShaderModule : public NativeObject<GPUShaderModule> {
public:
  static constexpr const char *CLASS_NAME = "GPUShaderModule";

  explicit GPUShaderModule(wgpu::ShaderModule instance,
                           std::shared_ptr<async::AsyncRunner> async,
                           std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _async(async),
        _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  async::AsyncTaskHandle getCompilationInfo();

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUShaderModule::getBrand);
    installMethod(runtime, prototype, "getCompilationInfo",
                  &GPUShaderModule::getCompilationInfo);
    installGetterSetter(runtime, prototype, "label", &GPUShaderModule::getLabel,
                        &GPUShaderModule::setLabel);
  }

  inline const wgpu::ShaderModule get() { return _instance; }

  size_t getMemoryPressure() override {
    // Estimate memory usage for compiled shader module
    // Shaders can vary widely, but a reasonable estimate is 8-16KB for typical
    // shaders Complex shaders (with many uniforms, textures, or computations)
    // can be much larger
    return 12 * 1024; // 12KB estimate for average shader
  }

private:
  wgpu::ShaderModule _instance;
  std::shared_ptr<async::AsyncRunner> _async;
  std::string _label;
};

} // namespace rnwgpu
