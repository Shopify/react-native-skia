#pragma once

#include <JsiHostObject.h>
#include <RNSkDrawView.h>
#include <RNSkPlatformContext.h>
#include <jsi/jsi.h>

namespace RNSkia {
using namespace facebook;

using CallbackInfo = struct CallbackInfo {
  CallbackInfo() {
    drawCallback = nullptr;
    touchCallback = nullptr;
    view = nullptr;
  }
  std::shared_ptr<jsi::Function> drawCallback;
  std::shared_ptr<jsi::Function> touchCallback;
  RNSkDrawView *view;
};

class RNSkJsiViewApi : public JsiHostObject {
public:
  /**
   * Constructor
   * @param platformContext Platform context
   */
  RNSkJsiViewApi(RNSkPlatformContext *platformContext) : JsiHostObject() {

    installFunction(
        "setDrawCallback", JSI_FUNC_SIGNATURE {
          if (count != 2) {
            platformContext->raiseError(
                std::string("setDrawCallback: Expected 2 arguments, got " +
                            std::to_string(count) + "."));
            return jsi::Value::undefined();
          }

          if (!arguments[0].isNumber()) {
            platformContext->raiseError(
                "setDrawCallback: First argument must be a number");
            return jsi::Value::undefined();
          }

          // We accept undefined to zero out the drawCallback
          if (!arguments[1].isUndefined()) {
            if (!arguments[1].isObject()) {
              platformContext->raiseError(
                  "setDrawCallback: Second argument must be a function");
              return jsi::Value::undefined();
            }
            if (!arguments[1].asObject(runtime).isFunction(runtime)) {
              platformContext->raiseError(
                  "setDrawCallback: Second argument must be a function");
              return jsi::Value::undefined();
            }
          }

          // find skia draw view
          int nativeId = arguments[0].asNumber();

          // and function to install as the draw drawCallback
          auto info = getEnsuredCallbackInfo(nativeId);
          if (arguments[1].isUndefined()) {
            info->drawCallback = nullptr;
          } else {
            info->drawCallback = std::make_shared<jsi::Function>(
                arguments[1].asObject(runtime).asFunction(runtime));
          }

          // Update view if set
          if (info->view != nullptr && info->drawCallback != nullptr) {
            info->view->setDrawCallback(info->drawCallback);
          }

          return jsi::Value::undefined();
        });

    installFunction(
        "setTouchCallback", JSI_FUNC_SIGNATURE {
          if (count != 2) {
            platformContext->raiseError(
                std::string("setTouchCallback: Expected 2 arguments, got " +
                            std::to_string(count) + "."));
            return jsi::Value::undefined();
          }

          if (!arguments[0].isNumber()) {
            platformContext->raiseError(
                "setTouchCallback: First argument must be a number");
            return jsi::Value::undefined();
          }

          // We accept undefined to zero out the drawCallback
          if (!arguments[1].isUndefined()) {
            if (!arguments[1].isObject()) {
              platformContext->raiseError(
                  "setTouchCallback: Second argument must be a function");
              return jsi::Value::undefined();
            }
            if (!arguments[1].asObject(runtime).isFunction(runtime)) {
              platformContext->raiseError(
                  "setTouchCallback: Second argument must be a function");
              return jsi::Value::undefined();
            }
          }

          // find skia draw view
          int nativeId = arguments[0].asNumber();

          // and function to install as the draw drawCallback
          auto info = getEnsuredCallbackInfo(nativeId);
          if (arguments[1].isUndefined()) {
            info->touchCallback = nullptr;
          } else {
            info->touchCallback = std::make_shared<jsi::Function>(
                arguments[1].asObject(runtime).asFunction(runtime));
          }

          // Update view if set
          if (info->view != nullptr && info->touchCallback != nullptr) {
            info->view->setTouchCallback(info->touchCallback);
          }

          return jsi::Value::undefined();
        });

    installFunction(
        "invalidateSkiaView", JSI_FUNC_SIGNATURE {
          if (count != 1) {
            platformContext->raiseError(
                std::string("invalidateSkiaView: Expected 2 arguments, got " +
                            std::to_string(count) + "."));
            return jsi::Value::undefined();
          }

          if (!arguments[0].isNumber()) {
            platformContext->raiseError(
                "invalidateSkiaView: First argument must be a number");
            return jsi::Value::undefined();
          }

          // find skia draw view
          int nativeId = arguments[0].asNumber();

          auto info = getEnsuredCallbackInfo(nativeId);
          if (info->view != nullptr) {
            info->view->requestRedraw();
          }
          return jsi::Value::undefined();
        });
  }

  /**
   * Destructor
   */
  ~RNSkJsiViewApi() {
    for (auto info : _callbackInfos) {
      if (info.second.view != nullptr) {
        info.second.view->setDrawCallback(nullptr);
      }
      info.second.view = nullptr;
      info.second.drawCallback = nullptr;
    }
    _callbackInfos.clear();
  }

  /**
   * Registers a skia view
   * @param nativeId Id of view to register
   * @param view View to register
   */
  void registerSkiaDrawView(size_t nativeId, RNSkDrawView *view) {
    auto info = getEnsuredCallbackInfo(nativeId);
    info->view = view;
    if (info->drawCallback != nullptr) {
      info->view->setDrawCallback(info->drawCallback);
      info->view->setTouchCallback(info->touchCallback);
    }
  }

  /**
   * Unregisters a Skia draw view
   * @param nativeId View id
   */
  void unregisterSkiaDrawView(size_t nativeId) {
    if (_callbackInfos.count(nativeId) == 0) {
      return;
    }
    auto info = getEnsuredCallbackInfo(nativeId);
    if (info->view != nullptr) {
      info->view->setDrawCallback(nullptr);
      info->view->setTouchCallback(nullptr);
    }
    info->view = nullptr;
    info->drawCallback = nullptr;
    info->touchCallback = nullptr;
    _callbackInfos.erase(nativeId);
  }

private:
  /**
   * Creates or returns the callback info object for the given view
   * @param nativeId View id
   * @return The callback info object for the requested view
   */
  CallbackInfo *getEnsuredCallbackInfo(size_t nativeId) {
    if (_callbackInfos.count(nativeId) == 0) {
      CallbackInfo info;
      _callbackInfos.emplace(nativeId, info);
    }
    return &_callbackInfos.at(nativeId);
  }

  // List of callbacks
  std::map<size_t, CallbackInfo> _callbackInfos;
};
} // namespace RNSkia