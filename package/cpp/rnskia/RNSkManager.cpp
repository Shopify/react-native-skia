#include "RNSkManager.h"

#include <RNSkLog.h>

#include <JsiSkApi.h>
#include <RNSkJsiViewApi.h>

namespace RNSkia {
using namespace facebook;

void RNSkManager::registerSkiaDrawView(size_t nativeId, RNSkDrawView *view) {
  _viewApi->registerSkiaDrawView(nativeId, view);
}

void RNSkManager::unregisterSkiaDrawView(size_t nativeId) {
  _viewApi->unregisterSkiaDrawView(nativeId);
}

void RNSkManager::installBindings() {
  // Create the Skia API object and install it on the global object in the
  // provided runtime
  auto skiaApi = std::make_shared<JsiSkApi>(*_jsRuntime, _platformContext);
  _jsRuntime->global().setProperty(
      *_jsRuntime, "SkiaApi",
      jsi::Object::createFromHostObject(*_jsRuntime, std::move(skiaApi)));

  _jsRuntime->global().setProperty(
      *_jsRuntime, "SkiaViewApi",
      jsi::Object::createFromHostObject(*_jsRuntime, _viewApi));
}
} // namespace RNSkia
