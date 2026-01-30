#include "GPU.h"

#include <cstdio>
#include <memory>
#include <string>
#include <unordered_set>
#include <utility>
#include <vector>

#include "Convertors.h"
#include "jsi2/JSIConverter.h"
#include "rnwgpu/async/JSIMicrotaskDispatcher.h"

namespace rnwgpu {

GPU::GPU(jsi::Runtime &runtime, wgpu::Instance instance)
    : NativeObject(CLASS_NAME), _instance(instance) {
  auto dispatcher = std::make_shared<async::JSIMicrotaskDispatcher>(runtime);
  _async = async::AsyncRunner::getOrCreate(runtime, _instance, dispatcher);
}

async::AsyncTaskHandle GPU::requestAdapter(
    std::optional<std::shared_ptr<GPURequestAdapterOptions>> options) {
  wgpu::RequestAdapterOptions aOptions;
  Convertor conv;
  if (!conv(aOptions, options)) {
    throw std::runtime_error("Failed to convert GPUDeviceDescriptor");
  }
#ifdef __APPLE__
  constexpr auto kDefaultBackendType = wgpu::BackendType::Metal;
#else
  constexpr auto kDefaultBackendType = wgpu::BackendType::Vulkan;
#endif
  aOptions.backendType = kDefaultBackendType;
  return _async->postTask(
      [this, aOptions](const async::AsyncTaskHandle::ResolveFunction &resolve,
                       const async::AsyncTaskHandle::RejectFunction &reject) {
        _instance.RequestAdapter(
            &aOptions, wgpu::CallbackMode::AllowProcessEvents,
            [asyncRunner = _async, resolve,
             reject](wgpu::RequestAdapterStatus status, wgpu::Adapter adapter,
                     wgpu::StringView message) {
              if (message.length) {
                fprintf(stderr, "%s", message.data);
              }

              if (status == wgpu::RequestAdapterStatus::Success && adapter) {
                auto adapterHost = std::make_shared<GPUAdapter>(
                    std::move(adapter), asyncRunner);
                auto result =
                    std::variant<std::nullptr_t, std::shared_ptr<GPUAdapter>>(
                        adapterHost);
                resolve([result =
                             std::move(result)](jsi::Runtime &runtime) mutable {
                  return JSIConverter<decltype(result)>::toJSI(runtime, result);
                });
              } else {
                auto result =
                    std::variant<std::nullptr_t, std::shared_ptr<GPUAdapter>>(
                        nullptr);
                resolve([result =
                             std::move(result)](jsi::Runtime &runtime) mutable {
                  return JSIConverter<decltype(result)>::toJSI(runtime, result);
                });
              }
            });
      });
}

std::unordered_set<std::string> GPU::getWgslLanguageFeatures() {
  wgpu::SupportedWGSLLanguageFeatures supportedFeatures = {};
  _instance.GetWGSLLanguageFeatures(&supportedFeatures);

  std::unordered_set<std::string> result;
  for (size_t i = 0; i < supportedFeatures.featureCount; i++) {
    wgpu::WGSLLanguageFeatureName feature = supportedFeatures.features[i];
    std::string name;
    switch (feature) {
    case wgpu::WGSLLanguageFeatureName::ReadonlyAndReadwriteStorageTextures:
      name = "readonly_and_readwrite_storage_textures";
      break;
    case wgpu::WGSLLanguageFeatureName::Packed4x8IntegerDotProduct:
      name = "packed_4x8_integer_dot_product";
      break;
    case wgpu::WGSLLanguageFeatureName::UnrestrictedPointerParameters:
      name = "unrestricted_pointer_parameters";
      break;
    case wgpu::WGSLLanguageFeatureName::PointerCompositeAccess:
      name = "pointer_composite_access";
      break;
    case wgpu::WGSLLanguageFeatureName::ChromiumTestingUnimplemented:
      name = "chromium_testing_unimplemented";
      break;
    case wgpu::WGSLLanguageFeatureName::ChromiumTestingUnsafeExperimental:
      name = "chromium_testing_unsafe_experimental";
      break;
    case wgpu::WGSLLanguageFeatureName::ChromiumTestingExperimental:
      name = "chromium_testing_experimental";
      break;
    case wgpu::WGSLLanguageFeatureName::ChromiumTestingShippedWithKillswitch:
      name = "chromium_testing_shipped_with_killswitch";
      break;
    case wgpu::WGSLLanguageFeatureName::ChromiumTestingShipped:
      name = "chromium_testing_shipped";
      break;
    case wgpu::WGSLLanguageFeatureName::SizedBindingArray:
      name = "sized_binding_array";
      break;
    case wgpu::WGSLLanguageFeatureName::TexelBuffers:
      name = "texel_buffers";
      break;
    case wgpu::WGSLLanguageFeatureName::ChromiumPrint:
      name = "chromium_print";
      break;
    }
    result.insert(name);
  }
  return result;
}

wgpu::TextureFormat GPU::getPreferredCanvasFormat() {
#if defined(__ANDROID__)
  return wgpu::TextureFormat::RGBA8Unorm;
#else
  return wgpu::TextureFormat::BGRA8Unorm;
#endif // defined(__ANDROID__)
}

} // namespace rnwgpu
