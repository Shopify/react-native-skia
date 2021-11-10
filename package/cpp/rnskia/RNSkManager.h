#pragma once

#include <jsi/jsi.h>
#include <map>
#include <memory>

#include "RNSkPlatformContext.h"
#include <JsiSkCanvas.h>
#include <RNSkDrawView.h>

namespace RNSkia {

using namespace facebook;

using RNSkCallbackInfo = struct {
  std::shared_ptr<jsi::Function> callback;
  RNSkDrawView *view;
};

class RNSkManager {
public:
  /**
    Initialializes a new instance of the RNSkManager
    @param jsRuntime The main JavaScript runtime
    @param jsCallInvoker The callinvoker
    @param platformContext Context used by wrappers to get platform
    functionality
  */
  RNSkManager(jsi::Runtime *jsRuntime,
              std::shared_ptr<facebook::react::CallInvoker> jsCallInvoker,
              RNSkPlatformContext *platformContext)
      : _jsRuntime(jsRuntime), _jsCallInvoker(jsCallInvoker),
        _platformContext(platformContext) {

    // Install bindings
    installBindings();
  }

  ~RNSkManager() {
    // Unregister all skia draw views
    for (auto drawCallbackInfo : _drawCallbacks) {
      if (drawCallbackInfo.second->view != nullptr) {
        drawCallbackInfo.second->view->setDrawCallback(nullptr);
        drawCallbackInfo.second->view = nullptr;
        drawCallbackInfo.second->callback = nullptr;
      }
    }
    _drawCallbacks.clear();
    _jsRuntime = nullptr;
    _platformContext = nullptr;
    RNSkLogger::logToConsole("RNSkManager destructor called");
  }

  /**
   * Registers a RNSkDrawView with the given native id
   * @param nativeId Native view id
   * @param view View to register
   */
  void registerSkiaDrawView(size_t nativeId, RNSkDrawView *view);

  /**
   * Unregisters the RNSkDrawView from the list of registered views
   * @param nativeId Native view Id
   */
  void unregisterSkiaDrawView(size_t nativeId);

  /**
   * @return Returns the platform context
   */
  RNSkPlatformContext *getPlatformContext() { return _platformContext; }

private:
  /**
   * Installs the javascript methods for registering/unregistering draw
   * callbacks for RNSkDrawViews. Called on installation of the parent native
   * module.
   */
  void installBindings();

  /**
   * Installs the setDrawCallback global js method in the main runtime
   */
  void installSetDrawCallback();

  /**
   * Installs the unsetDrawCallback global js method in the main runtime
   */
  void installUnsetDrawCallback();

  /**
   * Installs the invalidateSkiaView global js method in the main runtime
   */
  void installInvalidateSkiaView();

  /**
   * Installs constructors for Skia jsi wrappers in the given runtime
   */
  void installApis(jsi::Runtime &runtime, RNSkPlatformContext *context);

  /**
   Ensures and returns the callback info struct for a given native id
   */
  std::shared_ptr<RNSkCallbackInfo> getEnsuredCallbackInfo(size_t nativeId);

  /**
   Checks to see if the callbackinfo is empty and removes it if so.
   */
  void checkAndClearEmptyCallbackInfo(size_t nativeId);

  std::map<size_t, std::shared_ptr<RNSkCallbackInfo>> _drawCallbacks;
  jsi::Runtime *_jsRuntime;
  RNSkPlatformContext *_platformContext;
  std::shared_ptr<facebook::react::CallInvoker> _jsCallInvoker;
};

} // namespace RNSkia
