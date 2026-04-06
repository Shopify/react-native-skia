#pragma once

#include <string>
#include <utility>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "Convertors.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUAdapterInfo : public NativeObject<GPUAdapterInfo> {
public:
  static constexpr const char *CLASS_NAME = "GPUAdapterInfo";

  explicit GPUAdapterInfo(wgpu::AdapterInfo &info)
      : NativeObject(CLASS_NAME), _vendor(info.vendor),
        _architecture(info.architecture), _device(info.device),
        _description(info.description),
        _isFallbackAdapter(info.adapterType == wgpu::AdapterType::CPU) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  std::string getVendor() { return _vendor; }
  std::string getArchitecture() { return _architecture; }
  std::string getDevice() { return _device; }
  std::string getDescription() { return _description; }
  bool getIsFallbackAdapter() { return _isFallbackAdapter; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUAdapterInfo::getBrand);
    installGetter(runtime, prototype, "vendor", &GPUAdapterInfo::getVendor);
    installGetter(runtime, prototype, "architecture",
                  &GPUAdapterInfo::getArchitecture);
    installGetter(runtime, prototype, "device", &GPUAdapterInfo::getDevice);
    installGetter(runtime, prototype, "description",
                  &GPUAdapterInfo::getDescription);
    installGetter(runtime, prototype, "isFallbackAdapter",
                  &GPUAdapterInfo::getIsFallbackAdapter);
  }

private:
  std::string _vendor;
  std::string _architecture;
  std::string _device;
  std::string _description;
  bool _isFallbackAdapter;
};

} // namespace rnwgpu
