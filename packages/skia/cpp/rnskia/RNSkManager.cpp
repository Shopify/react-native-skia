#include "RNSkManager.h"

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkApi.h"
#include "RNSkJsiViewApi.h"
#include "RNSkView.h"

#include "RuntimeAwareCache.h"

// WebGPU bindings
#include "jsi2/RuntimeAwareCache.h"
#include "rnwgpu/api/GPU.h"

namespace RNSkia {
namespace jsi = facebook::jsi;

RNSkManager::RNSkManager(
    jsi::Runtime *jsRuntime,
    std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker,
    std::shared_ptr<RNSkPlatformContext> platformContext)
    : _jsRuntime(jsRuntime), _platformContext(platformContext),
      _jsCallInvoker(jsCallInvoker),
      _viewApi(std::make_shared<RNSkJsiViewApi>(platformContext)) {

  // Register main runtime
  RNJsi::BaseRuntimeAwareCache::setMainJsRuntime(_jsRuntime);
  rnwgpu::BaseRuntimeAwareCache::setMainJsRuntime(_jsRuntime);

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

  // Create and expose navigator.gpu
  auto gpu = std::make_shared<rnwgpu::GPU>(*_jsRuntime);
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
}
} // namespace RNSkia
