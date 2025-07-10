#pragma once

#include "webgpu/webgpu_cpp.h"

#include "dawn/dawn_proc.h"
#include "dawn/native/DawnNative.h"

#include "RNSkLog.h"
#include "include/core/SkColorType.h"
#include "include/gpu/graphite/dawn/DawnBackendContext.h"

namespace DawnUtils {

#ifdef __APPLE__
static const SkColorType PreferedColorType = kBGRA_8888_SkColorType;
static const wgpu::TextureFormat PreferredTextureFormat =
    wgpu::TextureFormat::BGRA8Unorm;
#else
static const SkColorType PreferedColorType = kRGBA_8888_SkColorType;
static const wgpu::TextureFormat PreferredTextureFormat =
    wgpu::TextureFormat::RGBA8Unorm;
#endif

inline skgpu::graphite::DawnBackendContext
createDawnBackendContext(dawn::native::Instance *instance) {

  auto useTintIR = false;
  static constexpr const char *kToggles[] = {
#if !defined(SK_DEBUG)
      "skip_validation",
#endif
      "disable_lazy_clear_for_mapped_at_creation_buffer",
      "allow_unsafe_apis",
      "use_user_defined_labels_in_backend",
      "disable_robustness",
      "use_tint_ir",
  };
  wgpu::DawnTogglesDescriptor togglesDesc;
  togglesDesc.enabledToggleCount = std::size(kToggles) - (useTintIR ? 0 : 1);
  togglesDesc.enabledToggles = kToggles;

  dawn::native::Adapter matchedAdaptor;

  wgpu::RequestAdapterOptions options;
#ifdef __APPLE__
  constexpr auto kDefaultBackendType = wgpu::BackendType::Metal;
#elif __ANDROID__
  constexpr auto kDefaultBackendType = wgpu::BackendType::Vulkan;
#endif
  options.backendType = kDefaultBackendType;
  options.featureLevel = wgpu::FeatureLevel::Core;
  options.nextInChain = &togglesDesc;

  std::vector<dawn::native::Adapter> adapters =
      instance->EnumerateAdapters(&options);
  if (adapters.empty()) {
    throw std::runtime_error("No matching adapter found");
  }

  // Sort adapters by adapterType(DiscreteGPU, IntegratedGPU, CPU) and
  // backendType(Metal, Vulkan, OpenGL, OpenGLES, WebGPU).
  std::sort(adapters.begin(), adapters.end(),
            [](dawn::native::Adapter a, dawn::native::Adapter b) {
              wgpu::Adapter wgpuA = a.Get();
              wgpu::Adapter wgpuB = b.Get();
              wgpu::AdapterInfo infoA;
              wgpu::AdapterInfo infoB;
              wgpuA.GetInfo(&infoA);
              wgpuB.GetInfo(&infoB);
              return std::tuple(infoA.adapterType, infoA.backendType) <
                     std::tuple(infoB.adapterType, infoB.backendType);
            });

  for (const auto &adapter : adapters) {
    wgpu::Adapter wgpuAdapter = adapter.Get();
    wgpu::AdapterInfo props;
    wgpuAdapter.GetInfo(&props);
    if (kDefaultBackendType == props.backendType) {
      matchedAdaptor = adapter;
      break;
    }
  }

  if (!matchedAdaptor) {
    throw std::runtime_error("No matching adapter found");
  }

  wgpu::Adapter adapter = matchedAdaptor.Get();

  // Log selected adapter info
  wgpu::AdapterInfo adapterInfo;
  adapter.GetInfo(&adapterInfo);
  std::string deviceName =
      adapterInfo.device.data
          ? std::string(adapterInfo.device.data, adapterInfo.device.length)
          : "Unknown";
  std::string description = adapterInfo.description.data
                                ? std::string(adapterInfo.description.data,
                                              adapterInfo.description.length)
                                : "Unknown";

  std::string backendName;
  switch (adapterInfo.backendType) {
  case wgpu::BackendType::Metal:
    backendName = "Metal";
    break;
  case wgpu::BackendType::Vulkan:
    backendName = "Vulkan";
    break;
  case wgpu::BackendType::OpenGL:
    backendName = "OpenGL";
    break;
  case wgpu::BackendType::OpenGLES:
    backendName = "OpenGLES";
    break;
  case wgpu::BackendType::WebGPU:
    backendName = "WebGPU";
    break;
  case wgpu::BackendType::Null:
    backendName = "Null";
    break;
  default:
    backendName = "Undefined (" +
                  std::to_string(static_cast<int>(adapterInfo.backendType)) +
                  ")";
    break;
  }

  RNSkia::RNSkLogger::logToConsole(
      "Selected Dawn adapter - Backend: %s, Device: %s, Description: %s",
      backendName.c_str(), deviceName.c_str(), description.c_str());

  std::vector<wgpu::FeatureName> features;
  if (adapter.HasFeature(wgpu::FeatureName::MSAARenderToSingleSampled)) {
    features.push_back(wgpu::FeatureName::MSAARenderToSingleSampled);
  }
  if (adapter.HasFeature(wgpu::FeatureName::TransientAttachments)) {
    features.push_back(wgpu::FeatureName::TransientAttachments);
  }
  if (adapter.HasFeature(wgpu::FeatureName::Unorm16TextureFormats)) {
    features.push_back(wgpu::FeatureName::Unorm16TextureFormats);
  }
  if (adapter.HasFeature(wgpu::FeatureName::DualSourceBlending)) {
    features.push_back(wgpu::FeatureName::DualSourceBlending);
  }
  if (adapter.HasFeature(wgpu::FeatureName::FramebufferFetch)) {
    features.push_back(wgpu::FeatureName::FramebufferFetch);
  }
  if (adapter.HasFeature(wgpu::FeatureName::BufferMapExtendedUsages)) {
    features.push_back(wgpu::FeatureName::BufferMapExtendedUsages);
  }
  if (adapter.HasFeature(wgpu::FeatureName::TextureCompressionETC2)) {
    features.push_back(wgpu::FeatureName::TextureCompressionETC2);
  }
  if (adapter.HasFeature(wgpu::FeatureName::TextureCompressionBC)) {
    features.push_back(wgpu::FeatureName::TextureCompressionBC);
  }
  if (adapter.HasFeature(wgpu::FeatureName::R8UnormStorage)) {
    features.push_back(wgpu::FeatureName::R8UnormStorage);
  }
  if (adapter.HasFeature(wgpu::FeatureName::DawnLoadResolveTexture)) {
    features.push_back(wgpu::FeatureName::DawnLoadResolveTexture);
  }
  if (adapter.HasFeature(wgpu::FeatureName::DawnPartialLoadResolveTexture)) {
    features.push_back(wgpu::FeatureName::DawnPartialLoadResolveTexture);
  }
  if (adapter.HasFeature(wgpu::FeatureName::TimestampQuery)) {
    features.push_back(wgpu::FeatureName::TimestampQuery);
  }
  if (adapter.HasFeature(wgpu::FeatureName::DawnTexelCopyBufferRowAlignment)) {
    features.push_back(wgpu::FeatureName::DawnTexelCopyBufferRowAlignment);
  }
  if (adapter.HasFeature(wgpu::FeatureName::ImplicitDeviceSynchronization)) {
    features.push_back(wgpu::FeatureName::ImplicitDeviceSynchronization);
  }
#ifdef __APPLE__
  if (adapter.HasFeature(wgpu::FeatureName::SharedTextureMemoryIOSurface)) {
    features.push_back(wgpu::FeatureName::SharedTextureMemoryIOSurface);
  }
#else
  if (adapter.HasFeature(
          wgpu::FeatureName::SharedTextureMemoryAHardwareBuffer)) {
    features.push_back(wgpu::FeatureName::SharedTextureMemoryAHardwareBuffer);
  }
#endif

  wgpu::DeviceDescriptor desc;
  desc.requiredFeatureCount = features.size();
  desc.requiredFeatures = features.data();
  desc.nextInChain = &togglesDesc;
  desc.SetDeviceLostCallback(
      wgpu::CallbackMode::AllowSpontaneous,
      [](const wgpu::Device &, wgpu::DeviceLostReason reason,
         wgpu::StringView message) {
        if (reason != wgpu::DeviceLostReason::Destroyed) {
          SK_ABORT("Device lost: %.*s\n", static_cast<int>(message.length),
                   message.data);
        }
      });
  desc.SetUncapturedErrorCallback(
      [](const wgpu::Device &, wgpu::ErrorType, wgpu::StringView message) {
        SkDebugf("Device error: %.*s\n", static_cast<int>(message.length),
                 message.data);
      });

  wgpu::Device device =
      wgpu::Device::Acquire(matchedAdaptor.CreateDevice(&desc));
  SkASSERT(device);

  skgpu::graphite::DawnBackendContext backendContext;
  backendContext.fInstance = wgpu::Instance(instance->Get());
  backendContext.fDevice = device;
  backendContext.fQueue = device.GetQueue();

  return backendContext;
}

} // namespace DawnUtils