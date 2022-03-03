
#pragma once

#include <JsiHostObject.h>
#include <RNSkPlatformContext.h>
#include <RNSkMeasureTime.h>
#include <jsi/jsi.h>

#include <algorithm>
#include <functional>
#include <chrono>
#include <mutex>

namespace RNSkia
{
using namespace facebook;

/**
 Implements a readonly Value that is updated every time the screen is redrawn. Its value will be the
 number of milliseconds since the animation value was started.
 */
class RNSkReadonlyValue : public JsiHostObject
{
public:
  RNSkReadonlyValue(std::shared_ptr<RNSkPlatformContext> platformContext)
      : JsiHostObject(), _platformContext(platformContext) {}

  JSI_PROPERTY_GET(__typename__) {
    return jsi::String::createFromUtf8(runtime, "RNSkValue");
  }
  
  JSI_PROPERTY_GET(value) {
    if(_valueHolder == nullptr) {
      return jsi::Value::undefined();
    }
    return _valueHolder->getProperty(runtime, "value");
  }  
  
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(RNSkReadonlyValue, __typename__),
                              JSI_EXPORT_PROP_GET(RNSkReadonlyValue, value))
    
  
  JSI_HOST_FUNCTION(addListener) {
    if(!arguments[0].isObject() || !arguments[0].asObject(runtime).isFunction(runtime)) {
      jsi::detail::throwJSError(runtime, "Expected function as first parameter.");
      return jsi::Value::undefined();
    }
    auto callback = std::make_shared<jsi::Function>(arguments[0].asObject(runtime).asFunction(runtime));
    
    auto unsubscribe = addListener([this, callback = std::move(callback)](jsi::Runtime& runtime){
      callback->call(runtime, get_value(runtime));
    });
    
    return jsi::Function::createFromHostFunction(runtime,
                                                 jsi::PropNameID::forUtf8(runtime, "unsubscribe"),
                                                 0,
                                                 JSI_HOST_FUNCTION_LAMBDA {
      unsubscribe();
      return jsi::Value::undefined();
    });
  }
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkReadonlyValue, addListener))
    
  /**
  * Adds a callback that will be called whenever the value changes
  * @param cb Callback
  * @return unsubscribe function
  */
  const std::function<void()> addListener(const std::function<void(jsi::Runtime&)> cb) {
    std::lock_guard<std::mutex> lock(_mutex);
    auto listenerId = _listenerId++;
    _listeners.emplace(listenerId, cb);
    return [this, listenerId]() {
      removeListener(listenerId);
    };
  }
  
  /**
    Updates the underlying value and notifies all listeners about the change
   @param runtime Current JS Runtime
   @param value Next value
   */
  virtual void update(jsi::Runtime &runtime, const jsi::Value &value) {
    if(_valueHolder == nullptr) {
      _valueHolder = std::make_shared<jsi::Object>(runtime);
    }
    _valueHolder->setProperty(runtime, "value", value);
    notifyListeners(runtime);
  }
  
protected:
  /**
    Notifies listeners about changes
   @param runtime Current JS Runtime
   */
  void notifyListeners(jsi::Runtime &runtime) {
    std::map<long, std::function<void(jsi::Runtime&)>> tmp;
    {
      std::lock_guard<std::mutex> lock(_mutex);
      tmp.insert(_listeners.begin(), _listeners.end());
    }
    for(const auto &listener: tmp) {
      listener.second(runtime);
    }
  }
  
  /**
   Removes a subscription listeners
   @param listenerId identifier of listener to remove
   */
  void removeListener(long listenerId) {
    std::lock_guard<std::mutex> lock(_mutex);
    _listeners.erase(listenerId);
  }
    
  /**
   * @return Platform context
   */
  const std::shared_ptr<RNSkPlatformContext> getPlatformContext() {
    return _platformContext;
  }

private:
  std::shared_ptr<RNSkPlatformContext> _platformContext;
  std::shared_ptr<jsi::Object> _valueHolder;  
  long _listenerId = 0;
  std::map<long, std::function<void(jsi::Runtime&)>> _listeners;
  std::mutex _mutex;
};
}
