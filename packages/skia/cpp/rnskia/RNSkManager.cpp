#include "RNSkManager.h"

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkApi.h"
#include "RNSkJsiViewApi.h"
#include "RNSkView.h"

#include "RuntimeAwareCache.h"

#ifdef SK_GRAPHITE
#include "RNDawnContext.h"
#include "rnwgpu/api/GPU.h"
#include "rnwgpu/api/descriptors/GPUBufferUsage.h"
#include "rnwgpu/api/descriptors/GPUColorWrite.h"
#include "rnwgpu/api/descriptors/GPUMapMode.h"
#include "rnwgpu/api/descriptors/GPUShaderStage.h"
#include "rnwgpu/api/descriptors/GPUTextureUsage.h"
#endif

namespace RNSkia {
namespace jsi = facebook::jsi;

RNSkManager::RNSkManager(
    jsi::Runtime *jsRuntime,
    std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker,
    std::shared_ptr<RNSkPlatformContext> platformContext)
    : _jsRuntime(jsRuntime), _platformContext(platformContext),
      _jsCallInvoker(jsCallInvoker),
      _viewApi(std::make_shared<RNSkJsiViewApi>(platformContext)) {

  // Register main runtime (used by both Skia and WebGPU bindings)
  RNJsi::BaseRuntimeAwareCache::setMainJsRuntime(_jsRuntime);

  // Install bindings
  installBindings();
}

RNSkManager::~RNSkManager() {
  // Free up any references
  _viewApi = nullptr;
  _jsRuntime = nullptr;
  _platformContext = nullptr;
  _jsCallInvoker = nullptr;
}

void RNSkManager::registerSkiaView(size_t nativeId,
                                   std::shared_ptr<RNSkView> view) {
  _viewApi->registerSkiaView(nativeId, std::move(view));
}

void RNSkManager::unregisterSkiaView(size_t nativeId) {
  _viewApi->unregisterSkiaView(nativeId);
}

void RNSkManager::setSkiaView(size_t nativeId, std::shared_ptr<RNSkView> view) {
  _viewApi->setSkiaView(nativeId, std::move(view));
}

void RNSkManager::installBindings() {
  // Create the API objects and install it on the global object in the
  // provided runtime.
  auto skiaApi = std::make_shared<JsiSkApi>(_platformContext);
  _jsRuntime->global().setProperty(
      *_jsRuntime, "SkiaApi",
      jsi::Object::createFromHostObject(*_jsRuntime, std::move(skiaApi)));

  _jsRuntime->global().setProperty(
      *_jsRuntime, "SkiaViewApi",
      jsi::Object::createFromHostObject(*_jsRuntime, _viewApi));

  // Install WebGPU GPU constructor
  rnwgpu::GPU::installConstructor(*_jsRuntime);

#ifdef SK_GRAPHITE
  // Create and expose navigator.gpu using DawnContext's instance
  auto &dawnContext = DawnContext::getInstance();
  auto gpu = std::make_shared<rnwgpu::GPU>(*_jsRuntime, dawnContext.getWGPUInstance());
  auto navigatorValue = _jsRuntime->global().getProperty(*_jsRuntime, "navigator");
  if (navigatorValue.isObject()) {
    auto navigator = navigatorValue.asObject(*_jsRuntime);
    navigator.setProperty(*_jsRuntime, "gpu", rnwgpu::GPU::create(*_jsRuntime, gpu));
  } else {
    // Create navigator object if it doesn't exist
    jsi::Object navigator(*_jsRuntime);
    navigator.setProperty(*_jsRuntime, "gpu", rnwgpu::GPU::create(*_jsRuntime, gpu));
    _jsRuntime->global().setProperty(*_jsRuntime, "navigator", std::move(navigator));
  }

  // Install WebGPU constant objects as plain JS objects
  _jsRuntime->global().setProperty(*_jsRuntime, "GPUBufferUsage",
                                   rnwgpu::GPUBufferUsage::create(*_jsRuntime));
  _jsRuntime->global().setProperty(*_jsRuntime, "GPUColorWrite",
                                   rnwgpu::GPUColorWrite::create(*_jsRuntime));
  _jsRuntime->global().setProperty(*_jsRuntime, "GPUMapMode",
                                   rnwgpu::GPUMapMode::create(*_jsRuntime));
  _jsRuntime->global().setProperty(*_jsRuntime, "GPUShaderStage",
                                   rnwgpu::GPUShaderStage::create(*_jsRuntime));
  _jsRuntime->global().setProperty(*_jsRuntime, "GPUTextureUsage",
                                   rnwgpu::GPUTextureUsage::create(*_jsRuntime));
#endif
}
} // namespace RNSkia
