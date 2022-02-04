#pragma once

#include <JsiHostObject.h>
#include <RNSkDrawView.h>
#include <RNSkPlatformContext.h>
#include <RNSkValue.h>
#include <jsi/jsi.h>

namespace RNSkia {
using namespace facebook;

using CallbackInfo = struct CallbackInfo {
  CallbackInfo() {
    drawCallback = nullptr;
    view = nullptr;
    dependencyCount = 0;
  }
  std::shared_ptr<jsi::Function> drawCallback;
  RNSkDrawView *view;
  int dependencyCount;
};

class RNSkJsiViewApi : public JsiHostObject {
public:
  JSI_HOST_FUNCTION(setDrawCallback) {
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

    // We accept undefined to zero out the drawCallback
    if (!arguments[1].isUndefined()) {
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
      info->view->setNativeId(nativeId);
      info->view->setDrawCallback(info->drawCallback);
    }

    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(invalidateSkiaView) {
    if (count != 1) {
      _platformContext->raiseError(
          std::string("invalidateSkiaView: Expected 2 arguments, got " +
                      std::to_string(count) + "."));
      return jsi::Value::undefined();
    }

    if (!arguments[0].isNumber()) {
      _platformContext->raiseError(
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
  }
  
  JSI_HOST_FUNCTION(makeImageSnapshot) {
    
    // find skia draw view
    int nativeId = arguments[0].asNumber();
    sk_sp<SkImage> image;
    auto info = getEnsuredCallbackInfo(nativeId);
    if (info->view != nullptr) {
      if(count > 1 && !arguments[1].isUndefined() && arguments[1].isNull()) {
        auto rect = JsiSkRect::fromValue(runtime, arguments[1]);
        image = info->view->makeImageSnapshot(rect);
      } else {
        image = info->view->makeImageSnapshot(nullptr);
      }
      if(image == nullptr) {
        jsi::detail::throwJSError(runtime, "Could not create image from current surface.");
        return jsi::Value::undefined();
      }
      return jsi::Object::createFromHostObject(runtime, std::make_shared<JsiSkImage>(_platformContext, image));
    }
    jsi::detail::throwJSError(runtime, "No Skia View currently available.");
    return jsi::Value::undefined();
  }
  
  JSI_HOST_FUNCTION(setDrawMode) {
    if (count != 2) {
      _platformContext->raiseError(
          std::string("setDrawMode: Expected 2 arguments, got " +
                      std::to_string(count) + "."));
      return jsi::Value::undefined();
    }

    if (!arguments[0].isNumber()) {
      _platformContext->raiseError(
          "setDrawMode: First argument must be a number");
      return jsi::Value::undefined();
    }

    // find skia draw view
    int nativeId = arguments[0].asNumber();
    auto info = getEnsuredCallbackInfo(nativeId);
    if (info->view != nullptr) {
      auto nextMode = arguments[1].asString(runtime).utf8(runtime);
      if(nextMode.compare("continuous") == 0) {
        info->view->setDrawingMode(RNSkDrawingMode::Continuous);
      } else {
        info->view->setDrawingMode(RNSkDrawingMode::Default);
      }
    }
    return jsi::Value::undefined();
  }
  
  JSI_HOST_FUNCTION(registerValueInView) {
    // Check params
    if(!arguments[1].isObject() || !arguments[1].asObject(runtime).isHostObject(runtime)) {
      jsi::detail::throwJSError(runtime, "Expected value object as second parameter");
      return jsi::Value::undefined();
    }
    
    int nativeId = arguments[0].asNumber();
    
    // increase dependency count on the Skia View
    valueDependencyAdded(nativeId);
    
    // Add listener
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forUtf8(runtime, "unsubscribe"),
                                                 0,
                                                 JSI_HOST_FUNCTION_LAMBDA {
      // decrease dependency count on the Skia View
      valueDependencyRemoved(nativeId);
      return jsi::Value::undefined();
    });
  }
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkJsiViewApi, setDrawCallback),
                       JSI_EXPORT_FUNC(RNSkJsiViewApi, invalidateSkiaView),
                       JSI_EXPORT_FUNC(RNSkJsiViewApi, makeImageSnapshot),
                       JSI_EXPORT_FUNC(RNSkJsiViewApi, setDrawMode),
                       JSI_EXPORT_FUNC(RNSkJsiViewApi, registerValueInView))

  /**
   * Constructor
   * @param platformContext Platform context
   */
  RNSkJsiViewApi(std::shared_ptr<RNSkPlatformContext> platformContext)
      : JsiHostObject(), _platformContext(platformContext) {}

  /**
   * Destructor
   */
  ~RNSkJsiViewApi() { unregisterAll(); }

  /**
   Call to remove all draw view infos
   */
  void unregisterAll() {
    // Unregister all views
    auto tempList = std::map<size_t, CallbackInfo>(_callbackInfos);
    for (auto info : tempList) {
      unregisterSkiaDrawView(info.first);
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
      info->view->setNativeId(nativeId);
      info->view->setDrawCallback(info->drawCallback);
      info->view->setDependencyCount(info->dependencyCount);
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
    }
    info->view = nullptr;
    info->drawCallback = nullptr;
    _callbackInfos.erase(nativeId);
  }
  
  /**
   Sets a skia draw view for the given id. This function can be used
   to mark that an underlying SkiaView is not available (it could be
   removed due to ex. a transition). The view can be set to a nullptr
   or a valid view, effectively toggling the view's availability. If
   a valid view is set, the setDrawCallback method is called on the
   view (if a valid callback exists).
   */
  void setSkiaDrawView(size_t nativeId, RNSkDrawView *view) {
    if (_callbackInfos.count(nativeId) == 0) {
      return;
    }
    auto info = getEnsuredCallbackInfo(nativeId);
    info->view = view;
    if (view != nullptr && info->drawCallback != nullptr) {
      info->view->setNativeId(nativeId);
      info->view->setDrawCallback(info->drawCallback);
      info->view->setDependencyCount(info->dependencyCount);
    }
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
  
  /**
    Increases the dependency count for a view - puts the view in continous mode if the dependency count
    is more than zero.
   */
  void valueDependencyAdded(size_t nativeId) {
    auto info = getEnsuredCallbackInfo(nativeId);
    info->dependencyCount++;
    if(info->view != nullptr) {
      info->view->setDependencyCount(info->dependencyCount);
    }
  }
  
  /**
   Decreases the dependency count for a view - puts the view in default mode if the dependency count
   is zero or less.
   */
  void valueDependencyRemoved(size_t nativeId) {
    auto info = getEnsuredCallbackInfo(nativeId);
    info->dependencyCount--;
    if(info->view != nullptr) {
      info->view->setDependencyCount(info->dependencyCount);
    }
  }
  
  // List of callbacks
  std::map<size_t, CallbackInfo> _callbackInfos;
  
  // Platform context
  std::shared_ptr<RNSkPlatformContext> _platformContext;
};
} // namespace RNSkia
