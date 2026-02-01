#pragma once

#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUCommandBuffer : public NativeObject<GPUCommandBuffer> {
public:
  static constexpr const char *CLASS_NAME = "GPUCommandBuffer";

  explicit GPUCommandBuffer(wgpu::CommandBuffer instance, std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUCommandBuffer::getBrand);
    installGetterSetter(runtime, prototype, "label",
                        &GPUCommandBuffer::getLabel,
                        &GPUCommandBuffer::setLabel);
  }

  inline const wgpu::CommandBuffer get() { return _instance; }

private:
  wgpu::CommandBuffer _instance;
  std::string _label;
};

} // namespace rnwgpu
