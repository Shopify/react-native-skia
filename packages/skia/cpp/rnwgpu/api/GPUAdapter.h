#pragma once

#include <memory>
#include <string>
#include <unordered_set>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "rnwgpu/async/AsyncRunner.h"
#include "rnwgpu/async/AsyncTaskHandle.h"

#include "webgpu/webgpu_cpp.h"

#include "GPUAdapterInfo.h"
#include "GPUDevice.h"
#include "descriptors/GPUDeviceDescriptor.h"
#include "GPUSupportedLimits.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

class GPUAdapter : public NativeObject<GPUAdapter> {
public:
  static constexpr const char *CLASS_NAME = "GPUAdapter";

  explicit GPUAdapter(wgpu::Adapter instance,
                      std::shared_ptr<async::AsyncRunner> async)
      : NativeObject(CLASS_NAME), _instance(instance), _async(async) {}

public:
  std::string getBrand() { return CLASS_NAME; }

  async::AsyncTaskHandle
  requestDevice(std::optional<std::shared_ptr<GPUDeviceDescriptor>> descriptor);

  std::unordered_set<std::string> getFeatures();
  std::shared_ptr<GPUSupportedLimits> getLimits();
  std::shared_ptr<GPUAdapterInfo> getInfo();

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUAdapter::getBrand);
    installMethod(runtime, prototype, "requestDevice",
                  &GPUAdapter::requestDevice);
    installGetter(runtime, prototype, "features", &GPUAdapter::getFeatures);
    installGetter(runtime, prototype, "limits", &GPUAdapter::getLimits);
    installGetter(runtime, prototype, "info", &GPUAdapter::getInfo);
  }

  inline const wgpu::Adapter get() { return _instance; }

private:
  wgpu::Adapter _instance;
  std::shared_ptr<async::AsyncRunner> _async;
};

} // namespace rnwgpu
