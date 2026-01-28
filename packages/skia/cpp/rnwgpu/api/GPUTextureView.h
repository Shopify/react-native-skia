#pragma once

#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUTextureView : public NativeObject<GPUTextureView> {
public:
  static constexpr const char *CLASS_NAME = "GPUTextureView";

  explicit GPUTextureView(wgpu::TextureView instance, std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUTextureView::getBrand);
    installGetterSetter(runtime, prototype, "label", &GPUTextureView::getLabel,
                        &GPUTextureView::setLabel);
  }

  inline const wgpu::TextureView get() { return _instance; }

private:
  wgpu::TextureView _instance;
  std::string _label;
};

} // namespace rnwgpu
