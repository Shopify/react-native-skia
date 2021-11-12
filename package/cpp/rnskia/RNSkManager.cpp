#include "RNSkManager.h"

#include <RNSkLog.h>

#include <JsiSkApi.h>

namespace RNSkia {
using namespace facebook;

void RNSkManager::registerSkiaDrawView(size_t nativeId, RNSkDrawView *view) {
  // Now we can set draw callback
  auto drawCallbackInfo = getEnsuredCallbackInfo(nativeId);
  drawCallbackInfo->view = view;

  if (drawCallbackInfo->callback != nullptr) {
    _jsCallInvoker->invokeAsync([=]() {
      // We already have a draw callback - update the view
      view->setDrawCallback(drawCallbackInfo->callback);
    });
  }
}

void RNSkManager::unregisterSkiaDrawView(size_t nativeId) {
  if (_drawCallbacks.count(nativeId) == 0) {
    return;
  }
  auto drawCallbackInfo = _drawCallbacks.at(nativeId);
  if (drawCallbackInfo->view != nullptr) {
    drawCallbackInfo->view->setDrawCallback(nullptr);    
  }

  checkAndClearEmptyCallbackInfo(nativeId);
}

void RNSkManager::installBindings() {
  installSetDrawCallback();
  installUnsetDrawCallback();
  installInvalidateSkiaView();

  // Install the API objects in the main JS Runtime
  installApis(*_jsRuntime, _platformContext);
}

void RNSkManager::installApis(jsi::Runtime &runtime,
                              RNSkPlatformContext *context) {
  // Create the Skia API object and install it on the global object in the
  // provided runtime
  auto skiaApi = std::make_shared<JsiSkApi>(runtime, context);
  runtime.global().setProperty(
      runtime, "SkiaApi",
      jsi::Object::createFromHostObject(runtime, std::move(skiaApi)));
}

std::shared_ptr<RNSkCallbackInfo>
RNSkManager::getEnsuredCallbackInfo(size_t nativeId) {
  if (_drawCallbacks.count(nativeId) == 0) {
    auto info = std::make_shared<RNSkCallbackInfo>();
    _drawCallbacks.emplace(nativeId, info);
  }
  return _drawCallbacks.at(nativeId);
}

void RNSkManager::checkAndClearEmptyCallbackInfo(size_t nativeId) {
  if (_drawCallbacks.count(nativeId) > 0) {
    auto drawCallbackInfo = _drawCallbacks.at(nativeId);
    if (drawCallbackInfo->callback == nullptr &&
        drawCallbackInfo->view == nullptr) {
      _drawCallbacks.erase(nativeId);
    }
  }
}

void RNSkManager::installSetDrawCallback() {
  auto setDrawCallback =
      [this](jsi::Runtime &runtime, const jsi::Value &thisValue,
             const jsi::Value *arguments, size_t count) -> jsi::Value {
    if (count != 2) {
      _platformContext->raiseError(
          std::string("setDrawCallback: Expected 2 arguments, got " +
                      std::to_string(count) + "."));
      return jsi::Value::undefined();
    }
    if (!arguments[0].isNumber()) {
      _platformContext->raiseError(
          "setDrawCallback: First argument must be a number");
      return jsi::Value::undefined();
    }
    if (!arguments[1].isObject()) {
      _platformContext->raiseError(
          "setDrawCallback: Second argument must be a function");
      return jsi::Value::undefined();
    }
    if (!arguments[1].asObject(runtime).isFunction(runtime)) {
      _platformContext->raiseError(
          "setDrawCallback: Second argument must be a function");
      return jsi::Value::undefined();
    }

    // find skia draw view
    int nativeId = arguments[0].asNumber();

    // and function to install as the draw callback
    auto drawCallback = std::make_shared<jsi::Function>(
        arguments[1].asObject(runtime).asFunction(runtime));

    auto drawCallbackInfo = getEnsuredCallbackInfo(nativeId);
    drawCallbackInfo->callback = drawCallback;
    if (drawCallbackInfo->view != nullptr) {
      drawCallbackInfo->view->setDrawCallback(drawCallback);
    }

    return jsi::Value::undefined();
  };

  auto &weakJsRuntime = *_jsRuntime;
  weakJsRuntime.global().setProperty(
      weakJsRuntime, "setDrawCallback",
      jsi::Function::createFromHostFunction(
          weakJsRuntime,
          jsi::PropNameID::forAscii(weakJsRuntime, "setDrawCallback"),
          2, // nativeId, setDrawCallback
          setDrawCallback));
}

void RNSkManager::installUnsetDrawCallback() {
  auto unsetDrawCallback =
      [this](jsi::Runtime &runtime, const jsi::Value &thisValue,
             const jsi::Value *arguments, size_t count) -> jsi::Value {
    if (!arguments[0].isNumber()) {
      _platformContext->raiseError(
          "setDrawCallback: First argument ('nativeId') must be a number!");
      return jsi::Value::undefined();
    }

    // find view
    int nativeId = arguments[0].asNumber();

    auto drawCallbackInfo = getEnsuredCallbackInfo(nativeId);

    if (drawCallbackInfo->view != nullptr) {
      drawCallbackInfo->view->setDrawCallback(nullptr);
    }

    // Unset the draw callback
    drawCallbackInfo->callback = nullptr;

    // Check if we should remove the callback info
    checkAndClearEmptyCallbackInfo(nativeId);

    return jsi::Value::undefined();
  };

  auto &weakJsRuntime = *_jsRuntime;
  weakJsRuntime.global().setProperty(
      weakJsRuntime, "unsetDrawCallback",
      jsi::Function::createFromHostFunction(
          weakJsRuntime,
          jsi::PropNameID::forAscii(weakJsRuntime, "unsetDrawCallback"),
          1, // nativeId
          unsetDrawCallback));
}

void RNSkManager::installInvalidateSkiaView() {
  auto invalidateSkiaView =
      [this](jsi::Runtime &rt, const jsi::Value &thisValue,
             const jsi::Value *arguments, size_t count) -> jsi::Value {
    if (!arguments[0].isNumber()) {
      _platformContext->raiseError(
          "invalidateSkiaView: First argument ('nativeId') must be a number.");
      return jsi::Value::undefined();
    }
    // find view
    int nativeId = arguments[0].asNumber();
    auto drawCallbackInfo = getEnsuredCallbackInfo(nativeId);
    if (drawCallbackInfo->view != nullptr) {
      drawCallbackInfo->view->requestRedraw();
    }
    return jsi::Value::undefined();
  };

  auto &weakJsRuntime = *_jsRuntime;
  weakJsRuntime.global().setProperty(
      weakJsRuntime, "invalidateSkiaView",
      jsi::Function::createFromHostFunction(
          weakJsRuntime,
          jsi::PropNameID::forAscii(weakJsRuntime, "invalidateSkiaView"),
          1, // nativeId
          invalidateSkiaView));
}
} // namespace RNSkia
