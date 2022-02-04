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

protected:
  /**
    Notifies listeners about changes
   */
  void notifyListeners(jsi::Runtime &runtime) {
    std::lock_guard<std::mutex> lock(_mutex);
    for(auto listener: _listeners) {
      listener.second(runtime);
    }
  }
  
  void removeListener(long listenerId) {
    std::lock_guard<std::mutex> lock(_mutex);
    _listeners.erase(listenerId);
  }
  
  /**
      Updates the underlying value
   */
  void setValue(jsi::Runtime &runtime, const jsi::Value &value) {
    if(_valueHolder == nullptr) {
      _valueHolder = std::make_shared<jsi::Object>(runtime);
    }
    _valueHolder->setProperty(runtime, "value", value);
    notifyListeners(runtime);
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

class RNSkValue : public RNSkReadonlyValue
{
public:
  RNSkValue(std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkReadonlyValue(platformContext) {}
    
  JSI_PROPERTY_SET(value) {
    setValue(runtime, value);
  }
  
  JSI_EXPORT_PROPERTY_SETTERS(JSI_EXPORT_PROP_SET(RNSkValue, value))
};

class RNSkDerivedValue : public RNSkReadonlyValue
{
public:
  RNSkDerivedValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                   jsi::Runtime &runtime,
                   const jsi::Value *arguments,
                   size_t count
                   )
      : RNSkReadonlyValue(platformContext) {
    // Verify input
    if(!arguments[0].isObject() ||
       !arguments[0].asObject(runtime).isFunction(runtime)) {
      jsi::detail::throwJSError(runtime, "Expected callback function as first parameter");
    }
        
    if(!arguments[1].isObject() ||
       !arguments[1].asObject(runtime).isArray(runtime)) {
      jsi::detail::throwJSError(runtime, "Expected array of dependencies as second parameter");
    }
        
    // Ensure that all dependencies are Values
    auto deps = arguments[1].asObject(runtime).asArray(runtime);
    for(size_t i=0; i<deps.size(runtime); ++i) {
      auto dep = deps.getValueAtIndex(runtime, i);
      if(!dep.isObject() ||
         !dep.asObject(runtime).isHostObject(runtime)) {
        jsi::detail::throwJSError(runtime, "Expected array of dependencies as second parameter. Each dependency must be a readonly value type");
      }
      auto value = dep.asObject(runtime).asHostObject<RNSkReadonlyValue>(runtime);
      _deps.push_back(value);
    }
    
    // Get callback for calculating result
    _callback = std::make_shared<jsi::Function>(arguments[0].asObject(runtime).asFunction(runtime));

    // register change handler on dependencies
    for(const auto &dep: _deps) {
      auto dispatcher = std::bind(&RNSkDerivedValue::dependencyUpdated, this, std::placeholders::_1);
      _unsubscribers.push_back(dep->addListener(dispatcher));
    }
        
    // Set initial value
    dependencyUpdated(runtime);
  }
  
  ~RNSkDerivedValue() {
    // Unregister listeners
    for(const auto &unsubscribe: _unsubscribers) {
      unsubscribe();
    }
  }
  
private:
  void dependencyUpdated(jsi::Runtime &runtime) {
    // Calculate new value
    std::vector<jsi::Value> dependencyValues;
    dependencyValues.resize(_deps.size());
    for(size_t i=0; i<_deps.size(); ++i) {
      dependencyValues[i] = (_deps[i]->get_value(runtime));
    }
    
    auto nextValue = _callback->call(runtime,
                                     static_cast<const jsi::Value*>(dependencyValues.data()),
                                     _deps.size());

    setValue(runtime, nextValue);
  }

  std::shared_ptr<jsi::Function> _callback;
  std::vector<std::shared_ptr<RNSkReadonlyValue>> _deps;
  std::vector<std::function<void()>> _unsubscribers;
};

class RNSkAnimationValue : public RNSkReadonlyValue
{
enum AnimationValueState {
    Stopped = 0,
    Running = 1,
};
  
public:
  RNSkAnimationValue(std::shared_ptr<RNSkPlatformContext> platformContext, jsi::Runtime& runtime, size_t identifier, bool startRunning)
      : RNSkReadonlyValue(platformContext), _runtime(runtime), _identifier(identifier) {
    _start = std::chrono::high_resolution_clock::now();
    setValue(_runtime, static_cast<double>(0));
    if(startRunning) {
      startAnimation();
    }
  }
  
  ~RNSkAnimationValue() {
    getPlatformContext()->endDrawLoop(_identifier);
  }
  
  JSI_HOST_FUNCTION(start) {
    startAnimation();
    return jsi::Value::undefined();
  }
  
  JSI_HOST_FUNCTION(stop) {
    stopAnimation();
    return jsi::Value::undefined();
  }
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkAnimationValue, start),
                       JSI_EXPORT_FUNC(RNSkAnimationValue, stop))
  
private:
  void startAnimation() {
    if(_state != AnimationValueState::Stopped) {
      return;
    }
    _state = AnimationValueState::Running;
    auto dispatcher = std::bind(&RNSkAnimationValue::notifyUpdate, this);
    getPlatformContext()->beginDrawLoop(_identifier, dispatcher);
  }
  
  void stopAnimation() {
    if(_state != AnimationValueState::Running) {
      return;
    }
    _state = AnimationValueState::Stopped;
    getPlatformContext()->endDrawLoop(_identifier);
  }
  
  void notifyUpdate() {
    if(_state != AnimationValueState::Running) {
      return;
    }
    
    // Ensure we call any updates from the draw loop on the javascript thread
    getPlatformContext()->runOnJavascriptThread([this](){
      auto now = std::chrono::high_resolution_clock::now();
      auto deltaFromStart = duration_cast<milliseconds>(now - _start).count();
      setValue(_runtime, static_cast<double>(deltaFromStart));
    });
  }

  jsi::Runtime &_runtime;
  size_t _identifier;
  std::chrono::time_point<steady_clock> _start;
  std::atomic<AnimationValueState> _state;
};

}
