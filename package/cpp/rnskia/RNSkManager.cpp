#include "RNSkManager.h"

#include <mutex>

#include <JsiSkApi.h>
#include <RNSkJsiViewApi.h>

namespace RNSkia {
using namespace facebook;

RNSkManager::RNSkManager(
    jsi::Runtime *jsRuntime,
    std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker,
    std::shared_ptr<RNSkPlatformContext> platformContext)
    : _jsRuntime(jsRuntime), _jsCallInvoker(jsCallInvoker),
      _platformContext(platformContext),
      _viewApi(std::make_shared<RNSkJsiViewApi>(platformContext)) {

  // Install bindings
  installBindings();
}

RNSkManager::~RNSkManager() {
  // We need to unregister all views when we get here
  _viewApi->unregisterAll();
  // Free up any references
  _viewApi = nullptr;
  _jsRuntime = nullptr;
  _platformContext = nullptr;
  _jsCallInvoker = nullptr;
}

void RNSkManager::registerSkiaDrawView(size_t nativeId, RNSkDrawView *view) {
  if (_viewApi != nullptr)
    _viewApi->registerSkiaDrawView(nativeId, view);
}

void RNSkManager::unregisterSkiaDrawView(size_t nativeId) {
  if (_viewApi != nullptr)
    _viewApi->unregisterSkiaDrawView(nativeId);
}

void RNSkManager::installBindings() {
  // Create the Skia API object and install it on the global object in the
  // provided runtime.
  //
  // This must be done on the Javascript thread to avoid threading issues
  // when accessing the javascript objects from a thread not being the JS
  // thread. On Android this is actually necessary, since we need to set up the
  // API before the javascript starts to execute!
#ifndef ANDROID
  std::mutex mu;
  std::condition_variable cond;

  bool isInstalled = false;
  std::unique_lock<std::mutex> lock(mu);

  _platformContext->runOnJavascriptThread([&]() {
    std::lock_guard<std::mutex> lock(mu);
#endif

    auto skiaApi = std::make_shared<JsiSkApi>(*_jsRuntime, _platformContext);
    _jsRuntime->global().setProperty(
        *_jsRuntime, "SkiaApi",
        jsi::Object::createFromHostObject(*_jsRuntime, std::move(skiaApi)));

    _jsRuntime->global().setProperty(
        *_jsRuntime, "SkiaViewApi",
        jsi::Object::createFromHostObject(*_jsRuntime, _viewApi));

#ifndef ANDROID
    isInstalled = true;
    cond.notify_one();
  });

  cond.wait(lock, [&]() { return isInstalled; });
#endif
}
} // namespace RNSkia
