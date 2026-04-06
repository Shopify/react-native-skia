#pragma once

#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUBindGroupLayout : public NativeObject<GPUBindGroupLayout> {
public:
  static constexpr const char *CLASS_NAME = "GPUBindGroupLayout";

  explicit GPUBindGroupLayout(wgpu::BindGroupLayout instance, std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUBindGroupLayout::getBrand);
    installGetterSetter(runtime, prototype, "label",
                        &GPUBindGroupLayout::getLabel,
                        &GPUBindGroupLayout::setLabel);
  }

  inline const wgpu::BindGroupLayout get() { return _instance; }

  size_t getMemoryPressure() override {
    // Bind group layouts define the structure/schema for bind groups
    // They store binding descriptors, types, and validation info
    // Estimate: 512 bytes per layout (smaller than actual bind groups)
    return 512;
  }

private:
  wgpu::BindGroupLayout _instance;
  std::string _label;
};

} // namespace rnwgpu
