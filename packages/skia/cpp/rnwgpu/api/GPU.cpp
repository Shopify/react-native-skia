#include "GPU.h"

#include <cstdio>
#include <memory>
#include <string>
#include <unordered_set>
#include <utility>
#include <vector>

#include "JSIConverter.h"
#include "rnwgpu/async/JSIMicrotaskDispatcher.h"

namespace rnwgpu {

GPU::GPU(jsi::Runtime &runtime) : NativeObject(CLASS_NAME) {
  wgpu::InstanceDescriptor instanceDesc{};
  _instance = wgpu::CreateInstance(&instanceDesc);

  auto dispatcher = std::make_shared<async::JSIMicrotaskDispatcher>(runtime);
  _async = async::AsyncRunner::getOrCreate(runtime, _instance, dispatcher);
}

async::AsyncTaskHandle GPU::requestAdapter() {
  // Stubbed implementation - returns null for now
  // Full implementation will be added when GPUAdapter is ported
  return _async->postTask(
      [](const async::AsyncTaskHandle::ResolveFunction &resolve,
         const async::AsyncTaskHandle::RejectFunction & /*reject*/) {
        resolve([](jsi::Runtime & /*runtime*/) {
          return jsi::Value::null();
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
    }
    if (!name.empty()) {
      result.insert(name);
    }
  }
  return result;
}

std::string GPU::getPreferredCanvasFormat() {
#if defined(__ANDROID__)
  return "rgba8unorm";
#else
  return "bgra8unorm";
#endif
}

} // namespace rnwgpu
