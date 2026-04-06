#pragma once

#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUBindGroup : public NativeObject<GPUBindGroup> {
public:
  static constexpr const char *CLASS_NAME = "GPUBindGroup";

  explicit GPUBindGroup(wgpu::BindGroup instance, std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUBindGroup::getBrand);
    installGetterSetter(runtime, prototype, "label", &GPUBindGroup::getLabel,
                        &GPUBindGroup::setLabel);
  }

  inline const wgpu::BindGroup get() { return _instance; }

  size_t getMemoryPressure() override {
    // Bind groups store resource bindings and descriptor state
    // They reference buffers, textures, samplers, etc.
    // Estimate: 1KB per bind group (descriptor tables and binding state)
    return 1024;
  }

private:
  wgpu::BindGroup _instance;
  std::string _label;
};

} // namespace rnwgpu
