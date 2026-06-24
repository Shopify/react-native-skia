#include "GPUAdapter.h"

#include <cstdio>
#include <memory>
#include <string>
#include <unordered_set>
#include <utility>
#include <vector>

#include "Convertors.h"

#include "GPUFeatures.h"
#include "GPUInternalError.h"
#include "GPUOutOfMemoryError.h"
#include "GPUValidationError.h"
#include "jsi2/JSIConverter.h"

namespace rnwgpu {

async::AsyncTaskHandle GPUAdapter::requestDevice(
    std::optional<std::shared_ptr<GPUDeviceDescriptor>> descriptor) {
  wgpu::DeviceDescriptor aDescriptor;
  Convertor conv;
  if (!conv(aDescriptor, descriptor)) {
    throw std::runtime_error("Failed to convert GPUDeviceDescriptor");
  }
  auto deviceLostBinding = std::make_shared<std::weak_ptr<GPUDevice>>();
  // Set device lost callback using new template API
  aDescriptor.SetDeviceLostCallback(
      wgpu::CallbackMode::AllowSpontaneous,
      [deviceLostBinding](const wgpu::Device & /*device*/,
                          wgpu::DeviceLostReason reason,
                          wgpu::StringView message) {
        const char *lostReason = "";
        switch (reason) {
        case wgpu::DeviceLostReason::Destroyed:
          lostReason = "Destroyed";
          break;
        case wgpu::DeviceLostReason::Unknown:
          lostReason = "Unknown";
          break;
        default:
          lostReason = "Unknown";
        }
        std::string msg =
            message.length ? std::string(message.data, message.length) : "";
        fprintf(stderr, "GPU Device Lost (%s): %s\n", lostReason, msg.c_str());
        if (auto deviceHost = deviceLostBinding->lock()) {
          deviceHost->notifyDeviceLost(reason, std::move(msg));
        }
      });

  // Set uncaptured error callback using new template API
  aDescriptor.SetUncapturedErrorCallback([](const wgpu::Device &device,
                                            wgpu::ErrorType type,
                                            wgpu::StringView message) {
    const char *errorType = "";
    switch (type) {
    case wgpu::ErrorType::Validation:
      errorType = "Validation";
      break;
    case wgpu::ErrorType::OutOfMemory:
      errorType = "Out of Memory";
      break;
    case wgpu::ErrorType::Internal:
      errorType = "Internal";
      break;
    case wgpu::ErrorType::Unknown:
      errorType = "Unknown";
      break;
    default:
      errorType = "Unknown";
    }
    std::string fullMessage =
        message.length > 0 ? std::string(errorType) + ": " +
                                 std::string(message.data, message.length)
                           : "no message";
    fprintf(stderr, "%s", fullMessage.c_str());

    // Look up the GPUDevice from the registry and notify it
    auto *gpuDevice = GPUDeviceRegistry::getInstance().getDevice(device.Get());
    if (gpuDevice != nullptr) {
      std::string messageStr =
          message.length > 0 ? std::string(message.data, message.length) : "";

      GPUErrorVariant error;
      switch (type) {
      case wgpu::ErrorType::Validation:
        error = std::make_shared<GPUValidationError>(messageStr);
        break;
      case wgpu::ErrorType::OutOfMemory:
        error = std::make_shared<GPUOutOfMemoryError>(messageStr);
        break;
      case wgpu::ErrorType::Internal:
      case wgpu::ErrorType::Unknown:
      default:
        error = std::make_shared<GPUInternalError>(messageStr);
        break;
      }
      gpuDevice->notifyUncapturedError(std::move(error));
    }
  });
  std::string label =
      descriptor.has_value() ? descriptor.value()->label.value_or("") : "";

  auto creationRuntime = getCreationRuntime();
  return _async->postTask(
      [this, aDescriptor, descriptor, label = std::move(label),
       deviceLostBinding,
       creationRuntime](const async::AsyncTaskHandle::ResolveFunction &resolve,
                        const async::AsyncTaskHandle::RejectFunction &reject) {
        // Build a local mutable copy so we can chain Dawn's device toggles.
        // The toggle name strings are owned by `descriptor` (captured above),
        // and the const char* / DawnTogglesDescriptor locals live for the
        // whole synchronous RequestDevice call below, which is when Dawn reads
        // the chained struct.
        wgpu::DeviceDescriptor deviceDesc = aDescriptor;
        wgpu::DawnTogglesDescriptor toggles{};
        std::vector<const char *> enabledToggles;
        std::vector<const char *> disabledToggles;
        if (descriptor.has_value() && descriptor.value()->dawnToggles) {
          const auto &dawnToggles = descriptor.value()->dawnToggles.value();
          if (dawnToggles->enabledToggles) {
            for (const auto &t : dawnToggles->enabledToggles.value()) {
              enabledToggles.push_back(t.c_str());
            }
            toggles.enabledToggleCount = enabledToggles.size();
            toggles.enabledToggles = enabledToggles.data();
          }
          if (dawnToggles->disabledToggles) {
            for (const auto &t : dawnToggles->disabledToggles.value()) {
              disabledToggles.push_back(t.c_str());
            }
            toggles.disabledToggleCount = disabledToggles.size();
            toggles.disabledToggles = disabledToggles.data();
          }
          deviceDesc.nextInChain = &toggles;
        }
        _instance.RequestDevice(
            &deviceDesc, wgpu::CallbackMode::AllowProcessEvents,
            [context = _async, resolve, reject, label, creationRuntime,
             deviceLostBinding](wgpu::RequestDeviceStatus status,
                                wgpu::Device device,
                                wgpu::StringView message) {
              if (message.length) {
                fprintf(stderr, "%s", message.data);
              }

              if (status != wgpu::RequestDeviceStatus::Success || !device) {
                std::string error =
                    message.length ? std::string(message.data, message.length)
                                   : "Failed to request device";
                reject(std::move(error));
                return;
              }

              // SetLoggingCallback is a repeatable callback (no callback mode),
              // which rejects capturing lambdas. Pass the runtime pointer
              // through Dawn's userdata argument instead of capturing it.
              device.SetLoggingCallback(
                  [](wgpu::LoggingType type, wgpu::StringView msg,
                     jsi::Runtime *runtime) {
                    if (runtime == nullptr) {
                      return;
                    }
                    const char *logLevel = "";
                    switch (type) {
                    case wgpu::LoggingType::Warning:
                      logLevel = "Warning";
                      fprintf(stderr, "WebGPU Warning: %.*s\n",
                              static_cast<int>(msg.length), msg.data);
                      break;
                    case wgpu::LoggingType::Error:
                      logLevel = "Error";
                      fprintf(stderr, "WebGPU Error: %.*s\n",
                              static_cast<int>(msg.length), msg.data);
                      break;
                    case wgpu::LoggingType::Verbose:
                      logLevel = "Verbose";
                      break;
                    case wgpu::LoggingType::Info:
                      logLevel = "Info";
                      break;
                    default:
                      logLevel = "Unknown";
                      fprintf(stderr, "%s: %.*s\n", logLevel,
                              static_cast<int>(msg.length), msg.data);
                    }
                  },
                  creationRuntime);

              auto deviceHost = std::make_shared<GPUDevice>(std::move(device),
                                                            context, label);
              *deviceLostBinding = deviceHost;
              resolve([deviceHost = std::move(deviceHost)](
                          jsi::Runtime &runtime) mutable {
                return JSIConverter<std::shared_ptr<GPUDevice>>::toJSI(
                    runtime, deviceHost);
              });
            });
      });
}

std::unordered_set<std::string> GPUAdapter::getFeatures() {
  wgpu::SupportedFeatures supportedFeatures;
  _instance.GetFeatures(&supportedFeatures);
  std::unordered_set<std::string> result;
  for (size_t i = 0; i < supportedFeatures.featureCount; ++i) {
    auto feature = supportedFeatures.features[i];
    std::string name;
    convertEnumToJSUnion(feature, &name);
    if (name != "") {
      result.insert(name);
    }
  }
  return result;
}

std::shared_ptr<GPUSupportedLimits> GPUAdapter::getLimits() {
  wgpu::Limits limits{};
  if (!_instance.GetLimits(&limits)) {
    throw std::runtime_error("Failed to get limits");
  }
  return std::make_shared<GPUSupportedLimits>(limits);
}

std::shared_ptr<GPUAdapterInfo> GPUAdapter::getInfo() {
  wgpu::AdapterInfo info = {};
  _instance.GetInfo(&info);
  return std::make_shared<GPUAdapterInfo>(info);
}

} // namespace rnwgpu
