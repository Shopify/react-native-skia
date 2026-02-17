#pragma once

#include <functional>
#include <map>
#include <memory>
#include <mutex>
#include <optional>
#include <string>
#include <unordered_set>
#include <utility>
#include <variant>
#include <vector>

#include "descriptors/Unions.h"

#include "jsi2/NativeObject.h"

#include "rnwgpu/async/AsyncRunner.h"
#include "rnwgpu/async/AsyncTaskHandle.h"

#include "webgpu/webgpu_cpp.h"

#include "GPUUncapturedErrorEvent.h"

#include "GPUBindGroup.h"
#include "descriptors/GPUBindGroupDescriptor.h"
#include "GPUBindGroupLayout.h"
#include "descriptors/GPUBindGroupLayoutDescriptor.h"
#include "GPUBuffer.h"
#include "descriptors/GPUBufferDescriptor.h"
#include "GPUCommandEncoder.h"
#include "descriptors/GPUCommandEncoderDescriptor.h"
#include "GPUComputePipeline.h"
#include "descriptors/GPUComputePipelineDescriptor.h"
#include "GPUDeviceLostInfo.h"
#include "GPUError.h"
#include "GPUExternalTexture.h"
#include "descriptors/GPUExternalTextureDescriptor.h"
#include "GPUPipelineLayout.h"
#include "descriptors/GPUPipelineLayoutDescriptor.h"
#include "GPUQuerySet.h"
#include "descriptors/GPUQuerySetDescriptor.h"
#include "GPUQueue.h"
#include "GPURenderBundleEncoder.h"
#include "descriptors/GPURenderBundleEncoderDescriptor.h"
#include "GPURenderPipeline.h"
#include "descriptors/GPURenderPipelineDescriptor.h"
#include "GPUSampler.h"
#include "descriptors/GPUSamplerDescriptor.h"
#include "GPUShaderModule.h"
#include "descriptors/GPUShaderModuleDescriptor.h"
#include "GPUSupportedLimits.h"
#include "GPUTexture.h"
#include "descriptors/GPUTextureDescriptor.h"

namespace rnwgpu {

namespace jsi = facebook::jsi;

// Forward declaration
class GPUDevice;

// Static registry to map wgpu::Device handles to GPUDevice instances
class GPUDeviceRegistry {
public:
  static GPUDeviceRegistry &getInstance() {
    static GPUDeviceRegistry instance;
    return instance;
  }

  void registerDevice(WGPUDevice handle, GPUDevice *device) {
    std::lock_guard<std::mutex> lock(_mutex);
    _devices[handle] = device;
  }

  void unregisterDevice(WGPUDevice handle) {
    std::lock_guard<std::mutex> lock(_mutex);
    _devices.erase(handle);
  }

  GPUDevice *getDevice(WGPUDevice handle) {
    std::lock_guard<std::mutex> lock(_mutex);
    auto it = _devices.find(handle);
    return it != _devices.end() ? it->second : nullptr;
  }

private:
  GPUDeviceRegistry() = default;
  std::mutex _mutex;
  std::map<WGPUDevice, GPUDevice *> _devices;
};

class GPUDevice : public NativeObject<GPUDevice> {
public:
  static constexpr const char *CLASS_NAME = "GPUDevice";

  explicit GPUDevice(wgpu::Device instance,
                     std::shared_ptr<async::AsyncRunner> async,
                     std::string label)
      : NativeObject(CLASS_NAME), _instance(instance), _async(async),
        _label(label) {
    // Register this device in the global registry
    GPUDeviceRegistry::getInstance().registerDevice(_instance.Get(), this);
  }

  ~GPUDevice() {
    // Unregister from the global registry
    GPUDeviceRegistry::getInstance().unregisterDevice(_instance.Get());
  }

public:
  std::string getBrand() { return CLASS_NAME; }

  void destroy();
  std::shared_ptr<GPUBuffer>
  createBuffer(std::shared_ptr<GPUBufferDescriptor> descriptor);
  std::shared_ptr<GPUTexture>
  createTexture(std::shared_ptr<GPUTextureDescriptor> descriptor);
  std::shared_ptr<GPUSampler> createSampler(
      std::optional<std::shared_ptr<GPUSamplerDescriptor>> descriptor);
  std::shared_ptr<GPUExternalTexture> importExternalTexture(
      std::shared_ptr<GPUExternalTextureDescriptor> descriptor);
  std::shared_ptr<GPUBindGroupLayout> createBindGroupLayout(
      std::shared_ptr<GPUBindGroupLayoutDescriptor> descriptor);
  std::shared_ptr<GPUPipelineLayout>
  createPipelineLayout(std::shared_ptr<GPUPipelineLayoutDescriptor> descriptor);
  std::shared_ptr<GPUBindGroup>
  createBindGroup(std::shared_ptr<GPUBindGroupDescriptor> descriptor);
  std::shared_ptr<GPUShaderModule>
  createShaderModule(std::shared_ptr<GPUShaderModuleDescriptor> descriptor);
  std::shared_ptr<GPUComputePipeline> createComputePipeline(
      std::shared_ptr<GPUComputePipelineDescriptor> descriptor);
  std::shared_ptr<GPURenderPipeline>
  createRenderPipeline(std::shared_ptr<GPURenderPipelineDescriptor> descriptor);
  async::AsyncTaskHandle createComputePipelineAsync(
      std::shared_ptr<GPUComputePipelineDescriptor> descriptor);
  async::AsyncTaskHandle createRenderPipelineAsync(
      std::shared_ptr<GPURenderPipelineDescriptor> descriptor);
  std::shared_ptr<GPUCommandEncoder> createCommandEncoder(
      std::optional<std::shared_ptr<GPUCommandEncoderDescriptor>> descriptor);
  std::shared_ptr<GPURenderBundleEncoder> createRenderBundleEncoder(
      std::shared_ptr<GPURenderBundleEncoderDescriptor> descriptor);
  std::shared_ptr<GPUQuerySet>
  createQuerySet(std::shared_ptr<GPUQuerySetDescriptor> descriptor);
  void pushErrorScope(wgpu::ErrorFilter filter);
  async::AsyncTaskHandle popErrorScope();

  std::unordered_set<std::string> getFeatures();
  std::shared_ptr<GPUSupportedLimits> getLimits();
  std::shared_ptr<GPUQueue> getQueue();
  async::AsyncTaskHandle getLost();
  void notifyDeviceLost(wgpu::DeviceLostReason reason, std::string message);
  void forceLossForTesting();

  // Event listener methods
  void addEventListener(std::string type, jsi::Function callback);
  void removeEventListener(std::string type, jsi::Function callback);
  void notifyUncapturedError(GPUErrorVariant error);

  std::string getLabel() { return _label; }
  void setLabel(const std::string &label) {
    _label = label;
    _instance.SetLabel(_label.c_str());
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installGetter(runtime, prototype, "__brand", &GPUDevice::getBrand);
    installMethod(runtime, prototype, "destroy", &GPUDevice::destroy);
    installMethod(runtime, prototype, "createBuffer", &GPUDevice::createBuffer);
    installMethod(runtime, prototype, "createTexture",
                  &GPUDevice::createTexture);
    installMethod(runtime, prototype, "createSampler",
                  &GPUDevice::createSampler);
    installMethod(runtime, prototype, "importExternalTexture",
                  &GPUDevice::importExternalTexture);
    installMethod(runtime, prototype, "createBindGroupLayout",
                  &GPUDevice::createBindGroupLayout);
    installMethod(runtime, prototype, "createPipelineLayout",
                  &GPUDevice::createPipelineLayout);
    installMethod(runtime, prototype, "createBindGroup",
                  &GPUDevice::createBindGroup);
    installMethod(runtime, prototype, "createShaderModule",
                  &GPUDevice::createShaderModule);
    installMethod(runtime, prototype, "createComputePipeline",
                  &GPUDevice::createComputePipeline);
    installMethod(runtime, prototype, "createRenderPipeline",
                  &GPUDevice::createRenderPipeline);
    installMethod(runtime, prototype, "createComputePipelineAsync",
                  &GPUDevice::createComputePipelineAsync);
    installMethod(runtime, prototype, "createRenderPipelineAsync",
                  &GPUDevice::createRenderPipelineAsync);
    installMethod(runtime, prototype, "createCommandEncoder",
                  &GPUDevice::createCommandEncoder);
    installMethod(runtime, prototype, "createRenderBundleEncoder",
                  &GPUDevice::createRenderBundleEncoder);
    installMethod(runtime, prototype, "createQuerySet",
                  &GPUDevice::createQuerySet);
    installMethod(runtime, prototype, "pushErrorScope",
                  &GPUDevice::pushErrorScope);
    installMethod(runtime, prototype, "popErrorScope",
                  &GPUDevice::popErrorScope);
    installGetter(runtime, prototype, "features", &GPUDevice::getFeatures);
    installGetter(runtime, prototype, "limits", &GPUDevice::getLimits);
    installGetter(runtime, prototype, "queue", &GPUDevice::getQueue);
    installGetter(runtime, prototype, "lost", &GPUDevice::getLost);
    installGetterSetter(runtime, prototype, "label", &GPUDevice::getLabel,
                        &GPUDevice::setLabel);
    installMethod(runtime, prototype, "forceLossForTesting",
                  &GPUDevice::forceLossForTesting);
    installMethod(runtime, prototype, "addEventListener",
                  &GPUDevice::addEventListener);
    installMethod(runtime, prototype, "removeEventListener",
                  &GPUDevice::removeEventListener);
  }

  inline const wgpu::Device get() { return _instance; }

private:
  friend class GPUAdapter;

  wgpu::Device _instance;
  std::shared_ptr<async::AsyncRunner> _async;
  std::string _label;
  std::optional<async::AsyncTaskHandle> _lostHandle;
  std::shared_ptr<GPUDeviceLostInfo> _lostInfo;
  bool _lostSettled = false;
  std::optional<async::AsyncTaskHandle::ResolveFunction> _lostResolve;

  // Event listeners storage
  std::mutex _listenersMutex;
  std::map<std::string, std::vector<std::shared_ptr<jsi::Function>>>
      _eventListeners;
};

} // namespace rnwgpu
