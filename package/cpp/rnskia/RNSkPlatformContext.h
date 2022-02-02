#pragma once

#include <functional>
#include <map>
#include <mutex>

#include <RNSkLog.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkStream.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

#include <ReactCommon/CallInvoker.h>

namespace RNSkia {

using namespace facebook;

class RNSkPlatformContext {
public:
  /**
   * Constructor
   */
  RNSkPlatformContext(
      jsi::Runtime *runtime, std::shared_ptr<react::CallInvoker> callInvoker,
      const std::function<void(const std::function<void(void)> &)>
          dispatchOnRenderThread,
      float pixelDensity)
      : _pixelDensity(pixelDensity), _jsRuntime(runtime),
        _callInvoker(callInvoker),
        _dispatchOnRenderThread(dispatchOnRenderThread) {}

  /**
   * Destructor
   */
  ~RNSkPlatformContext() {
    invalidate();
  }
  
  void invalidate() {
    if(!_isValid) {
      return;
    }
    std::lock_guard<std::mutex> lock(_drawCallbacksLock);
    stopDrawLoop();
    _isValid = false;
  }

  /**
   * Schedules the function to be run on the javascript thread async
   * @param func Function to run
   */
  void runOnJavascriptThread(std::function<void()> func) {
    if(!_isValid) { return; }
    _callInvoker->invokeAsync(std::move(func));
  }

  /**
   Runs the function on the render thread
   */
  void runOnRenderThread(std::function<void()> func) {
    if(!_isValid) { return; }
    _dispatchOnRenderThread(std::move(func));
  }

  /**
   Returns the javascript runtime
   */
  jsi::Runtime *getJsRuntime() { return _jsRuntime; }

  /**
   * Returns an SkStream wrapping the require uri provided.
   * @param sourceUri Uri for the resource to load as a string
   * @op Operation to execute when the stream has successfuly been loaded.
   */
  virtual void performStreamOperation(
      const std::string &sourceUri,
      const std::function<void(std::unique_ptr<SkStreamAsset>)> &op) = 0;

  /**
   * Raises an exception on the platform. This function does not necessarily
   * throw an exception and stop execution, so it is important to stop execution
   * by returning after calling the function
   * @param err Error to raise
   */
  virtual void raiseError(const std::exception &err) = 0;

  /**
   * Raises an exception on the platform. This function does not necessarily
   * throw an exception and stop execution, so it is important to stop execution
   * by returning after calling the function
   * @param message Message to show
   */
  void raiseError(const std::string &message) {
    return raiseError(std::runtime_error(message));
  }

  /**
   * @return Current scale factor for pixels
   */
  float getPixelDensity() { return _pixelDensity; };

  /**
   * Starts (if not started) a loop that will call back on display sync
   * @param callback Callback to call on sync
   * @returns Identifier of the draw loop entry
   */
  size_t beginDrawLoop(size_t nativeId, std::function<void(void)> callback) {
    if(!_isValid) { return 0; }
    std::lock_guard<std::mutex> lock(_drawCallbacksLock);
    _drawCallbacks.emplace(nativeId, std::move(callback));
    if (_drawCallbacks.size() == 1) {
      // Start
      startDrawLoop();
    }
    return nativeId;
  }

  /**
   * Ends (if running) the drawing loop that was started with beginDrawLoop.
   * This method must be called symmetrically with the beginDrawLoop method.
   * @param nativeId Identifier of view to end
   */
  void endDrawLoop(size_t nativeId) {
    if(!_isValid) { return; }
    std::lock_guard<std::mutex> lock(_drawCallbacksLock);
    if (_drawCallbacks.count(nativeId) > 0) {
      _drawCallbacks.erase(nativeId);
    }
    if (_drawCallbacks.size() == 0) {
      stopDrawLoop();
    }
  }

  /**
   * Notifies all drawing callbacks
   */
  void notifyDrawLoop() {
    if(!_isValid) { return; }
    std::lock_guard<std::mutex> lock(_drawCallbacksLock);
    for (auto it = _drawCallbacks.begin(); it != _drawCallbacks.end(); it++) {
      it->second();
    }
  }

  virtual void startDrawLoop() = 0;
  virtual void stopDrawLoop() = 0;

private:
  float _pixelDensity;

  jsi::Runtime *_jsRuntime;
  std::shared_ptr<react::CallInvoker> _callInvoker;

  std::function<void(const std::function<void(void)> &)>
      _dispatchOnRenderThread;

  std::map<size_t, std::function<void(void)>> _drawCallbacks;
  std::mutex _drawCallbacksLock;
  std::atomic<bool> _isValid = {true};
};
} // namespace RNSkia
