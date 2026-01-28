#pragma once

#include <string>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "webgpu/webgpu_cpp.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUDeviceLostInfo : public NativeObject<GPUDeviceLostInfo> {
public:
  static constexpr const char *CLASS_NAME = "GPUDeviceLostInfo";

  explicit GPUDeviceLostInfo(wgpu::DeviceLostReason reason, std::string message)
      : NativeObject(CLASS_NAME), _reason(reason), _message(message) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  wgpu::DeviceLostReason getReason() { return _reason; }
  std::string getMessage() { return _message; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUDeviceLostInfo::getBrand);
    installGetter(runtime, prototype, "reason", &GPUDeviceLostInfo::getReason);
    installGetter(runtime, prototype, "message",
                  &GPUDeviceLostInfo::getMessage);
  }

private:
  wgpu::DeviceLostReason _reason;
  std::string _message;
};

} // namespace rnwgpu
