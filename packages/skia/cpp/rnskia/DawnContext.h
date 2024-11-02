#pragma once

#include <memory>

#include "webgpu/webgpu_cpp.h"

#include "dawn/dawn_proc.h"
#include "dawn/native/DawnNative.h"

#include "include/gpu/graphite/Context.h"
#include "include/gpu/graphite/ContextOptions.h"
#include "include/gpu/graphite/dawn/DawnBackendContext.h"
#include "include/gpu/graphite/dawn/DawnTypes.h"
#include "include/gpu/graphite/dawn/DawnUtils.h"
#include "include/private/base/SkOnce.h"

#define LOG_ADAPTER 1

namespace RNSkia {

class DawnContext {
private:
  DawnContext(const skgpu::graphite::DawnBackendContext &backendContext)
      : fBackendContext(backendContext) {}

  skgpu::graphite::DawnBackendContext fBackendContext;

public:
  ~DawnContext() { fBackendContext.fDevice = nullptr; }

  static std::unique_ptr<DawnContext> Make() {
	  auto useTintIR = true;
	  /*
	   wgpu::BackendType backend,
												bool useTintIR
	   */
    static std::unique_ptr<dawn::native::Instance> sInstance;
    static SkOnce sOnce;
    static constexpr const char *kToggles[] = {
        "allow_unsafe_apis", // Needed for dual-source blending.
        "use_user_defined_labels_in_backend",
        // Robustness impacts performance and is always disabled when running
        // Graphite in Chrome, so this keeps Skia's tests operating closer to
        // real-use behavior.
        "disable_robustness",
        // Must be last to correctly respond to `useTintIR` parameter.
        "use_tint_ir",
    };
    wgpu::DawnTogglesDescriptor togglesDesc;
    togglesDesc.enabledToggleCount = std::size(kToggles) - (useTintIR ? 0 : 1);
    togglesDesc.enabledToggles = kToggles;

    // Creation of Instance is cheap but calling EnumerateAdapters can be
    // expensive the first time, but then the results are cached on the Instance
    // object. So save the Instance here so we can avoid the overhead of
    // EnumerateAdapters on every test.
    sOnce([&] {
      DawnProcTable backendProcs = dawn::native::GetProcs();
      dawnProcSetProcs(&backendProcs);
      WGPUInstanceDescriptor desc{};
      // need for WaitAny with timeout > 0
      desc.features.timedWaitAnyEnable = true;
      sInstance = std::make_unique<dawn::native::Instance>(&desc);
    });

    dawn::native::Adapter matchedAdaptor;

    wgpu::RequestAdapterOptions options;
	options.compatibilityMode = true;
//    options.compatibilityMode = backend == wgpu::BackendType::OpenGL ||
//                                backend == wgpu::BackendType::OpenGLES;
    options.nextInChain = &togglesDesc;
    std::vector<dawn::native::Adapter> adapters =
        sInstance->EnumerateAdapters(&options);
    SkASSERT(!adapters.empty());
    // Sort adapters by adapterType(DiscreteGPU, IntegratedGPU, CPU) and
    // backendType(WebGPU, D3D11, D3D12, Metal, Vulkan, OpenGL, OpenGLES).
    std::sort(adapters.begin(), adapters.end(),
              [](dawn::native::Adapter a, dawn::native::Adapter b) {
                wgpu::AdapterInfo infoA;
                wgpu::AdapterInfo infoB;
                a.GetInfo(&infoA);
                b.GetInfo(&infoB);
                return std::tuple(infoA.adapterType, infoA.backendType) <
                       std::tuple(infoB.adapterType, infoB.backendType);
              });

    for (const auto &adapter : adapters) {
      wgpu::AdapterInfo props;
      adapter.GetInfo(&props);
//      if (backend == props.backendType) {
//        matchedAdaptor = adapter;
//        break;
//      }
    }

    if (!matchedAdaptor) {
      return nullptr;
    }

#if LOG_ADAPTER
    wgpu::AdapterInfo info;
    // sAdapter.GetInfo(&info);
    // SkDebugf("GPU: %s\nDriver: %s\n", info.device, info.description);
#endif

    std::vector<wgpu::FeatureName> features;
    wgpu::Adapter adapter = matchedAdaptor.Get();
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

    wgpu::DeviceDescriptor desc;
    desc.requiredFeatureCount = features.size();
    desc.requiredFeatures = features.data();
    desc.nextInChain = &togglesDesc;
    desc.SetDeviceLostCallback(
        wgpu::CallbackMode::AllowSpontaneous,
        [](const wgpu::Device &, wgpu::DeviceLostReason reason,
           const char *message) {
          if (reason != wgpu::DeviceLostReason::Destroyed) {
            SK_ABORT("Device lost: %s\n", message);
          }
        });
    desc.SetUncapturedErrorCallback(
        [](const wgpu::Device &, wgpu::ErrorType, const char *message) {
          SkDebugf("Device error: %s\n", message);
        });

    wgpu::Device device =
        wgpu::Device::Acquire(matchedAdaptor.CreateDevice(&desc));
    SkASSERT(device);

    skgpu::graphite::DawnBackendContext backendContext;
    backendContext.fInstance = wgpu::Instance(sInstance->Get());
    backendContext.fDevice = device;
    backendContext.fQueue = device.GetQueue();
    return std::unique_ptr<DawnContext>(new DawnContext(backendContext));
  }

  std::unique_ptr<skgpu::graphite::Context> makeContext() {
    skgpu::graphite::ContextOptions options;
    // Needed to make synchronous readPixels work
    //		options.fOptionsPriv->fStoreContextRefInRecorder = true;
    //
    //		auto backendContext = fBackendContext;
    //		if (options.fNeverYieldToWebGPU) {
    //			backendContext.fTick = nullptr;
    //		}

    return skgpu::graphite::ContextFactory::MakeDawn(fBackendContext, options);
  }
};
} // namespace RNSkia
