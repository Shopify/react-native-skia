#pragma once

#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUQuerySet : public NativeObject<GPUQuerySet> {
public:
  static constexpr const char *CLASS_NAME = "GPUQuerySet";

  explicit GPUQuerySet(wgpu::QuerySet instance, std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _label(label) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  void destroy();

  wgpu::QueryType getType();
  uint32_t getCount();

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUQuerySet::getBrand);
    installMethod(runtime, prototype, "destroy", &GPUQuerySet::destroy);
    installGetter(runtime, prototype, "type", &GPUQuerySet::getType);
    installGetter(runtime, prototype, "count", &GPUQuerySet::getCount);
    installGetterSetter(runtime, prototype, "label", &GPUQuerySet::getLabel,
                        &GPUQuerySet::setLabel);
  }

  inline const wgpu::QuerySet get() { return _instance; }

  size_t getMemoryPressure() override {
    uint32_t count = getCount();
    wgpu::QueryType type = getType();

    // Estimate bytes per query based on type
    size_t bytesPerQuery = 8; // Default estimate
    switch (type) {
    case wgpu::QueryType::Occlusion:
      bytesPerQuery = 8; // 64-bit counter
      break;
    case wgpu::QueryType::Timestamp:
      bytesPerQuery = 8; // 64-bit timestamp
      break;
    default:
      bytesPerQuery = 8; // Safe default
      break;
    }

    return static_cast<size_t>(count) * bytesPerQuery;
  }

private:
  wgpu::QuerySet _instance;
  std::string _label;
};

} // namespace rnwgpu
