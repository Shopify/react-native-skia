#include "GPUDevice.h"

#include <memory>
#include <string>
#include <unordered_set>
#include <utility>
#include <vector>

#include "Convertors.h"
#include "jsi2/JSIConverter.h"

#include "GPUFeatures.h"
#include "GPUInternalError.h"
#include "GPUOutOfMemoryError.h"
#include "GPUValidationError.h"

namespace rnwgpu {

void GPUDevice::notifyDeviceLost(wgpu::DeviceLostReason reason,
                                 std::string message) {
  if (_lostSettled) {
    return;
  }

  _lostSettled = true;
  _lostInfo = std::make_shared<GPUDeviceLostInfo>(reason, std::move(message));

  if (_lostResolve.has_value()) {
    auto resolve = std::move(*_lostResolve);
    _lostResolve.reset();
    resolve([info = _lostInfo](jsi::Runtime &runtime) mutable {
      return JSIConverter<std::shared_ptr<GPUDeviceLostInfo>>::toJSI(runtime,
                                                                     info);
    });
  }

  _lostHandle.reset();
}

void GPUDevice::forceLossForTesting() {
  // wgpu::StringView view("forceLossForTesting invoked from JS");
  _instance.ForceLoss(wgpu::DeviceLostReason::Unknown,
                      "forceLossForTesting invoked from JS");
}

std::shared_ptr<GPUBuffer>
GPUDevice::createBuffer(std::shared_ptr<GPUBufferDescriptor> descriptor) {
  wgpu::BufferDescriptor desc;
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error(
        "GPUDevice::createBuffer(): Error with GPUBufferDescriptor");
  }
  auto result = _instance.CreateBuffer(&desc);
  return std::make_shared<GPUBuffer>(result, _async,
                                     descriptor->label.value_or(""));
}

std::shared_ptr<GPUSupportedLimits> GPUDevice::getLimits() {
  wgpu::Limits limits{};
  if (!_instance.GetLimits(&limits)) {
    throw std::runtime_error("failed to get device limits");
  }
  return std::make_shared<GPUSupportedLimits>(limits);
}

std::shared_ptr<GPUQueue> GPUDevice::getQueue() {
  auto result = _instance.GetQueue();
  return std::make_shared<GPUQueue>(result, _async, _label);
}

std::shared_ptr<GPUCommandEncoder> GPUDevice::createCommandEncoder(
    std::optional<std::shared_ptr<GPUCommandEncoderDescriptor>> descriptor) {
  wgpu::CommandEncoderDescriptor desc;
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("Error with GPUCommandEncoderDescriptor");
  }
  auto result = _instance.CreateCommandEncoder(&desc);
  return std::make_shared<GPUCommandEncoder>(
      result,
      descriptor.has_value() ? descriptor.value()->label.value_or("") : "");
}

void GPUDevice::destroy() {
  _instance.Destroy();
  notifyDeviceLost(wgpu::DeviceLostReason::Destroyed, "device was destroyed");
}

std::shared_ptr<GPUTexture>
GPUDevice::createTexture(std::shared_ptr<GPUTextureDescriptor> descriptor) {
  wgpu::TextureDescriptor desc;
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("Error with GPUTextureDescriptor");
  }
  auto texture = _instance.CreateTexture(&desc);
  return std::make_shared<GPUTexture>(texture, descriptor->label.value_or(""));
}

std::shared_ptr<GPUShaderModule> GPUDevice::createShaderModule(
    std::shared_ptr<GPUShaderModuleDescriptor> descriptor) {
  wgpu::ShaderSourceWGSL wgsl_desc{};
  wgpu::ShaderModuleDescriptor sm_desc{};
  Convertor conv;
  if (!conv(wgsl_desc.code, descriptor->code) ||
      !conv(sm_desc.label, descriptor->label)) {
    return {};
  }
  sm_desc.nextInChain = &wgsl_desc;
  if (descriptor->code.find('\0') != std::string::npos) {
    auto mod = _instance.CreateErrorShaderModule(
        &sm_desc, "The WGSL shader contains an illegal character '\\0'");
    return std::make_shared<GPUShaderModule>(mod, _async, sm_desc.label.data);
  }
  auto module = _instance.CreateShaderModule(&sm_desc);
  return std::make_shared<GPUShaderModule>(module, _async,
                                           descriptor->label.value_or(""));
}

std::shared_ptr<GPURenderPipeline> GPUDevice::createRenderPipeline(
    std::shared_ptr<GPURenderPipelineDescriptor> descriptor) {
  wgpu::RenderPipelineDescriptor desc{};
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("Error with GPURenderPipelineDescriptor");
  }
  // assert(desc.fragment != nullptr && "Fragment state must not be null");
  auto renderPipeline = _instance.CreateRenderPipeline(&desc);
  return std::make_shared<GPURenderPipeline>(renderPipeline,
                                             descriptor->label.value_or(""));
}

std::shared_ptr<GPUBindGroup>
GPUDevice::createBindGroup(std::shared_ptr<GPUBindGroupDescriptor> descriptor) {
  Convertor conv;
  wgpu::BindGroupDescriptor desc{};
  if (!conv(desc.label, descriptor->label) ||
      !conv(desc.layout, descriptor->layout) ||
      !conv(desc.entries, desc.entryCount, descriptor->entries)) {
    throw std::runtime_error(
        "GPUBindGroup::createBindGroup(): Error with GPUBindGroupDescriptor");
  }
  auto bindGroup = _instance.CreateBindGroup(&desc);
  return std::make_shared<GPUBindGroup>(bindGroup,
                                        descriptor->label.value_or(""));
}

std::shared_ptr<GPUSampler> GPUDevice::createSampler(
    std::optional<std::shared_ptr<GPUSamplerDescriptor>> descriptor) {
  wgpu::SamplerDescriptor desc;
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("GPUDevice::createSampler(): Error with "
                             "GPUSamplerDescriptor");
  }
  auto sampler = _instance.CreateSampler(&desc);
  return std::make_shared<GPUSampler>(
      sampler,
      descriptor.has_value() ? descriptor.value()->label.value_or("") : "");
}

std::shared_ptr<GPUComputePipeline> GPUDevice::createComputePipeline(
    std::shared_ptr<GPUComputePipelineDescriptor> descriptor) {
  wgpu::ComputePipelineDescriptor desc;
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("GPUDevice::createComputePipeline(): Error with "
                             "GPUComputePipelineDescriptor");
  }
  auto computePipeline = _instance.CreateComputePipeline(&desc);
  return std::make_shared<GPUComputePipeline>(computePipeline,
                                              descriptor->label.value_or(""));
}

std::shared_ptr<GPUQuerySet>
GPUDevice::createQuerySet(std::shared_ptr<GPUQuerySetDescriptor> descriptor) {
  wgpu::QuerySetDescriptor desc;
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("GPUDevice::createQuerySet(): Error with "
                             "GPUQuerySetDescriptor");
  }
  auto querySet = _instance.CreateQuerySet(&desc);
  return std::make_shared<GPUQuerySet>(querySet,
                                       descriptor->label.value_or(""));
}

std::shared_ptr<GPURenderBundleEncoder> GPUDevice::createRenderBundleEncoder(
    std::shared_ptr<GPURenderBundleEncoderDescriptor> descriptor) {
  Convertor conv;

  wgpu::RenderBundleEncoderDescriptor desc{};
  if (!conv(desc.label, descriptor->label) ||
      !conv(desc.colorFormats, desc.colorFormatCount,
            descriptor->colorFormats) ||
      !conv(desc.depthStencilFormat, descriptor->depthStencilFormat) ||
      !conv(desc.sampleCount, descriptor->sampleCount) ||
      !conv(desc.depthReadOnly, descriptor->depthReadOnly) ||
      !conv(desc.stencilReadOnly, descriptor->stencilReadOnly)) {
    return {};
  }
  return std::make_shared<GPURenderBundleEncoder>(
      _instance.CreateRenderBundleEncoder(&desc),
      descriptor->label.value_or(""));
}

std::shared_ptr<GPUBindGroupLayout> GPUDevice::createBindGroupLayout(
    std::shared_ptr<GPUBindGroupLayoutDescriptor> descriptor) {
  Convertor conv;

  wgpu::BindGroupLayoutDescriptor desc{};
  if (!conv(desc.label, descriptor->label) ||
      !conv(desc.entries, desc.entryCount, descriptor->entries)) {
    return {};
  }
  return std::make_shared<GPUBindGroupLayout>(
      _instance.CreateBindGroupLayout(&desc), descriptor->label.value_or(""));
}

std::shared_ptr<GPUPipelineLayout> GPUDevice::createPipelineLayout(
    std::shared_ptr<GPUPipelineLayoutDescriptor> descriptor) {
  Convertor conv;

  wgpu::PipelineLayoutDescriptor desc{};
  if (!conv(desc.label, descriptor->label) ||
      !conv(desc.bindGroupLayouts, desc.bindGroupLayoutCount,
            descriptor->bindGroupLayouts)) {
    return {};
  }
  return std::make_shared<GPUPipelineLayout>(
      _instance.CreatePipelineLayout(&desc), descriptor->label.value_or(""));
}

std::shared_ptr<GPUExternalTexture> GPUDevice::importExternalTexture(
    std::shared_ptr<GPUExternalTextureDescriptor> descriptor) {
  throw std::runtime_error(
      "GPUDevice::importExternalTexture(): Not implemented");
}

async::AsyncTaskHandle GPUDevice::createComputePipelineAsync(
    std::shared_ptr<GPUComputePipelineDescriptor> descriptor) {
  wgpu::ComputePipelineDescriptor desc{};
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error("GPUDevice::createComputePipeline(): Error with "
                             "GPUComputePipelineDescriptor");
  }

  auto label = std::string(
      descriptor->label.has_value() ? descriptor->label.value() : "");
  auto pipelineHolder = std::make_shared<GPUComputePipeline>(nullptr, label);

  return _async->postTask([device = _instance, desc, descriptor,
                           pipelineHolder](
                              const async::AsyncTaskHandle::ResolveFunction
                                  &resolve,
                              const async::AsyncTaskHandle::RejectFunction
                                  &reject) {
    (void)descriptor;
    device.CreateComputePipelineAsync(
        &desc, wgpu::CallbackMode::AllowProcessEvents,
        [pipelineHolder, resolve,
         reject](wgpu::CreatePipelineAsyncStatus status,
                 wgpu::ComputePipeline pipeline, const char *msg) mutable {
          if (status == wgpu::CreatePipelineAsyncStatus::Success && pipeline) {
            pipelineHolder->_instance = pipeline;
            resolve([pipelineHolder](jsi::Runtime &runtime) mutable {
              return JSIConverter<std::shared_ptr<GPUComputePipeline>>::toJSI(
                  runtime, pipelineHolder);
            });
          } else {
            std::string error =
                msg ? std::string(msg) : "Failed to create compute pipeline";
            reject(std::move(error));
          }
        });
  });
}

async::AsyncTaskHandle GPUDevice::createRenderPipelineAsync(
    std::shared_ptr<GPURenderPipelineDescriptor> descriptor) {
  wgpu::RenderPipelineDescriptor desc{};
  Convertor conv;
  if (!conv(desc, descriptor)) {
    throw std::runtime_error(
        "GPUDevice::createRenderPipelineAsync(): Error with "
        "GPURenderPipelineDescriptor");
  }

  auto label = std::string(
      descriptor->label.has_value() ? descriptor->label.value() : "");
  auto pipelineHolder = std::make_shared<GPURenderPipeline>(nullptr, label);

  return _async->postTask([device = _instance, desc, descriptor,
                           pipelineHolder](
                              const async::AsyncTaskHandle::ResolveFunction
                                  &resolve,
                              const async::AsyncTaskHandle::RejectFunction
                                  &reject) {
    (void)descriptor;
    device.CreateRenderPipelineAsync(
        &desc, wgpu::CallbackMode::AllowProcessEvents,
        [pipelineHolder, resolve,
         reject](wgpu::CreatePipelineAsyncStatus status,
                 wgpu::RenderPipeline pipeline, const char *msg) mutable {
          if (status == wgpu::CreatePipelineAsyncStatus::Success && pipeline) {
            pipelineHolder->_instance = pipeline;
            resolve([pipelineHolder](jsi::Runtime &runtime) mutable {
              return JSIConverter<std::shared_ptr<GPURenderPipeline>>::toJSI(
                  runtime, pipelineHolder);
            });
          } else {
            std::string error =
                msg ? std::string(msg) : "Failed to create render pipeline";
            reject(std::move(error));
          }
        });
  });
}

void GPUDevice::pushErrorScope(wgpu::ErrorFilter filter) {
  _instance.PushErrorScope(filter);
}

async::AsyncTaskHandle GPUDevice::popErrorScope() {
  auto device = _instance;

  return _async->postTask([device](const async::AsyncTaskHandle::ResolveFunction
                                       &resolve,
                                   const async::AsyncTaskHandle::RejectFunction
                                       &reject) {
    device.PopErrorScope(
        wgpu::CallbackMode::AllowProcessEvents,
        [resolve, reject](wgpu::PopErrorScopeStatus status,
                          wgpu::ErrorType type, wgpu::StringView message) {
          if (status == wgpu::PopErrorScopeStatus::Error ||
              status == wgpu::PopErrorScopeStatus::CallbackCancelled) {
            reject("PopErrorScope failed");
            return;
          }

          std::string messageString =
              message.length ? std::string(message.data, message.length) : "";

          switch (type) {
          case wgpu::ErrorType::NoError:
            resolve([](jsi::Runtime &runtime) mutable {
              return jsi::Value::null();
            });
            break;
          case wgpu::ErrorType::Validation: {
            auto error = std::make_shared<GPUValidationError>(messageString);
            resolve([error](jsi::Runtime &runtime) mutable {
              return JSIConverter<std::shared_ptr<GPUValidationError>>::toJSI(
                  runtime, error);
            });
            break;
          }
          case wgpu::ErrorType::OutOfMemory: {
            auto error = std::make_shared<GPUOutOfMemoryError>(messageString);
            resolve([error](jsi::Runtime &runtime) mutable {
              return JSIConverter<std::shared_ptr<GPUOutOfMemoryError>>::toJSI(
                  runtime, error);
            });
            break;
          }
          case wgpu::ErrorType::Internal:
          case wgpu::ErrorType::Unknown: {
            auto error = std::make_shared<GPUInternalError>(messageString);
            resolve([error](jsi::Runtime &runtime) mutable {
              return JSIConverter<std::shared_ptr<GPUInternalError>>::toJSI(
                  runtime, error);
            });
            break;
          }
          default:
            reject("Unhandled GPU error type");
            return;
          }
        });
  });
}

std::unordered_set<std::string> GPUDevice::getFeatures() {
  wgpu::SupportedFeatures supportedFeatures;
  _instance.GetFeatures(&supportedFeatures);
  std::unordered_set<std::string> result;
  for (size_t i = 0; i < supportedFeatures.featureCount; ++i) {
    auto feature = supportedFeatures.features[i];
    std::string name;
    convertEnumToJSUnion(feature, &name);
    result.insert(name);
  }
  return result;
}

async::AsyncTaskHandle GPUDevice::getLost() {
  if (_lostHandle.has_value()) {
    return *_lostHandle;
  }

  if (_lostSettled && _lostInfo) {
    return _async->postTask(
        [info = _lostInfo](
            const async::AsyncTaskHandle::ResolveFunction &resolve,
            const async::AsyncTaskHandle::RejectFunction & /*reject*/) {
          resolve([info](jsi::Runtime &runtime) mutable {
            return JSIConverter<std::shared_ptr<GPUDeviceLostInfo>>::toJSI(
                runtime, info);
          });
        },
        false);
  }

  auto handle = _async->postTask(
      [this](const async::AsyncTaskHandle::ResolveFunction &resolve,
             const async::AsyncTaskHandle::RejectFunction & /*reject*/) {
        if (_lostSettled && _lostInfo) {
          resolve([info = _lostInfo](jsi::Runtime &runtime) mutable {
            return JSIConverter<std::shared_ptr<GPUDeviceLostInfo>>::toJSI(
                runtime, info);
          });
          return;
        }

        _lostResolve = resolve;
      },
      false);

  _lostHandle = handle;
  return handle;
}
void GPUDevice::addEventListener(std::string type, jsi::Function callback) {
  std::lock_guard<std::mutex> lock(_listenersMutex);
  auto sharedCallback = std::make_shared<jsi::Function>(std::move(callback));
  _eventListeners[type].push_back(sharedCallback);
}

void GPUDevice::removeEventListener(std::string type, jsi::Function callback) {
  std::lock_guard<std::mutex> lock(_listenersMutex);
  auto it = _eventListeners.find(type);
  if (it != _eventListeners.end()) {
    auto &listeners = it->second;
    // Remove the last listener of this type (simple approach since we can't
    // easily compare jsi::Function objects)
    if (!listeners.empty()) {
      listeners.pop_back();
    }
  }
}

void GPUDevice::notifyUncapturedError(GPUErrorVariant error) {
  auto runtime = getCreationRuntime();
  if (runtime == nullptr) {
    return;
  }

  std::vector<std::shared_ptr<jsi::Function>> listeners;
  {
    std::lock_guard<std::mutex> lock(_listenersMutex);
    auto it = _eventListeners.find("uncapturederror");
    if (it != _eventListeners.end()) {
      listeners = it->second;
    }
  }

  if (listeners.empty()) {
    return;
  }

  // Create the event object
  auto event = std::make_shared<GPUUncapturedErrorEvent>(std::move(error));
  auto eventValue = GPUUncapturedErrorEvent::create(*runtime, event);

  // Call all listeners
  for (const auto &listener : listeners) {
    try {
      listener->call(*runtime, eventValue);
    } catch (const std::exception &e) {
      fprintf(stderr, "Error in uncapturederror listener: %s\n", e.what());
    }
  }
}

} // namespace rnwgpu
