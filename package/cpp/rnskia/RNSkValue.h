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
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkReadonlyValue, addListener))

protected:
  /**
    Notifies listeners about changes
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
  
  void removeListener(long listenerId) {
    std::lock_guard<std::mutex> lock(_mutex);
    _listeners.erase(listenerId);
  }
    
  /**
      Updates the underlying value and notifies all listeners about the change
   */
  void update(jsi::Runtime &runtime, const jsi::Value &value) {
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

/**
  Creates a readonly value that depends on one or more other values. The derived value has a callback
  function that is used to calculate the new value when any of the dependencies change.
 */
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
        continue;
      }
      auto value = dep.asObject(runtime).asHostObject<RNSkReadonlyValue>(runtime);
      if(value == nullptr) {
        continue;
      }
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
    
    auto nextValue = _callback->call(
    runtime, static_cast<const jsi::Value*>(dependencyValues.data()), _deps.size());

    update(runtime, nextValue);
  }

  std::shared_ptr<jsi::Function> _callback;
  std::vector<std::shared_ptr<RNSkReadonlyValue>> _deps;
  std::vector<std::function<void()>> _unsubscribers;
};

/**
 Implements a readonly Value that is updated every time the screen is redrawn. Its value will be the
 number of milliseconds since the animation value was started.
 */
class RNSkAnimationValue : public RNSkReadonlyValue
{
enum RNSkAnimationValueState {
    NotStarted = 0,
    Running = 1,
    Stopped = 2
};
  
public:
  RNSkAnimationValue(std::shared_ptr<RNSkPlatformContext> platformContext, size_t identifier,
                     jsi::Runtime& runtime, const jsi::Value *arguments, size_t count)
      : RNSkReadonlyValue(platformContext),
        _runtime(runtime),
        _identifier(identifier),
        _deleting(std::make_shared<std::timed_mutex>()) {
    update(_runtime, static_cast<double>(0));
    
    // Should we start immediately?
    auto startRunning = count > 0 ? arguments[0].getBool() : true;
    if(startRunning) {
      startAnimation();
    }
  }
  
  ~RNSkAnimationValue() {
    _state = RNSkAnimationValueState::Stopped;
    getPlatformContext()->endDrawLoop(_identifier);
    _deleting->lock();
  }
  
  JSI_HOST_FUNCTION(start) {
    startAnimation();
    return jsi::Value::undefined();
  }
  
  JSI_HOST_FUNCTION(stop) {
    stopAnimation();
    return jsi::Value::undefined();
  }
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkReadonlyValue, addListener),
                       JSI_EXPORT_FUNC(RNSkAnimationValue, start),
                       JSI_EXPORT_FUNC(RNSkAnimationValue, stop))
  
private:
  void startAnimation() {
    if(_state == RNSkAnimationValueState::Running) {
      return;
    }
    _state = RNSkAnimationValueState::Running;
    _start = std::chrono::high_resolution_clock::now();
    auto dispatch = std::bind(&RNSkAnimationValue::notifyUpdate, this);
    getPlatformContext()->beginDrawLoop(_identifier, dispatch);
  }
  
  void stopAnimation() {
    if(_state == RNSkAnimationValueState::Running) {
      _state = RNSkAnimationValueState::Stopped;
      getPlatformContext()->endDrawLoop(_identifier);
    }
  }
  
  void notifyUpdate() {
    if(_state != RNSkAnimationValueState::Running) {
      return;
    }
    auto deleting = _deleting;
    
    // Avoid moving on if we are being called after the dtor was started
    if(_deleting->try_lock()) {
      _deleting->unlock();

      std::mutex mu;
      std::condition_variable cond;
      
      std::unique_lock<std::mutex> lock(mu);
      
      // Ensure we call any updates from the draw loop on the javascript thread
      getPlatformContext()->runOnJavascriptThread(
        [this, &cond, &mu, deleting](){
          
        std::lock_guard<std::mutex> lock(mu);
        
        // Avoid calling update if the dtor was started
        if(deleting->try_lock()) {
          auto now = std::chrono::high_resolution_clock::now();
          auto deltaFromStart = duration_cast<milliseconds>(now - _start).count();
          update(_runtime, static_cast<double>(deltaFromStart));
          deleting->unlock();
        }
        
        cond.notify_one();
      });
    
      cond.wait_for(lock, milliseconds(500));
    };
  }

  jsi::Runtime &_runtime;
  size_t _identifier;
  std::chrono::time_point<steady_clock> _start;
  std::atomic<RNSkAnimationValueState> _state;
  std::shared_ptr<std::timed_mutex> _deleting;
};

/**
 Implements a Value that can be both read and written to. It inherits from the ReadonlyValue with
 functionailty for subscribing to changes.
 */
class RNSkValue : public RNSkReadonlyValue
{
public:
  RNSkValue(std::shared_ptr<RNSkPlatformContext> platformContext,
            jsi::Runtime& runtime, const jsi::Value *arguments, size_t count)
      : RNSkReadonlyValue(platformContext) {
        if(count == 1) {
          update(runtime, arguments[0]);
        }
      }
  
  ~RNSkValue() {
    clearDependency();
  }
    
  JSI_PROPERTY_SET(value) {
    update(runtime, value);
  }
  
  JSI_EXPORT_PROPERTY_SETTERS(JSI_EXPORT_PROP_SET(RNSkValue, value))
  
  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(RNSkReadonlyValue, __typename__),
                              JSI_EXPORT_PROP_GET(RNSkReadonlyValue, value))
  
  /**
   * Adds a value as a dependency to this value. Only one value can be set as a dependency,
   * and when added as a dependency subscription and unsubscription will be handled automatically.
   * The function takes two parameter, the first one is the value to add a dependency to - and the
   * second one is an option function for transforming the value (like in the derived value).
   */
  JSI_HOST_FUNCTION(setDriver) {
    // Remove previous dependency (if set)
    clearDependency();
    
    // Check for clearing
    if(arguments[0].isUndefined() || arguments[0].isNull()) {
      return jsi::Value::undefined();
    }

    // Verify input - first parameter should be the value we are depending on
    if(!arguments[0].isObject()) {
      jsi::detail::throwJSError(runtime, "Expected dependency value as first parameter");
      return jsi::Value::undefined();
    }

    // Get the dependant value
    auto value = arguments[0].asObject(runtime).asHostObject<RNSkReadonlyValue>(runtime);
    if(value == nullptr) {
      jsi::detail::throwJSError(runtime, "Expected dependency value as first parameter");
      return jsi::Value::undefined();
    }

    // Second parameter is optional and is a calculation function
    if(count > 1) {
      if (!arguments[1].isObject() ||
          !arguments[1].asObject(runtime).isFunction(runtime)) {
        jsi::detail::throwJSError(runtime, "Expected callback function as first parameter");
        return jsi::Value::undefined();
      }
      _dependencyUpdater = std::make_shared<jsi::Function>(arguments[1].asObject(runtime).asFunction(runtime));
    }
    
    // Subscribe
    _dependencyUnsubcriptor = value->addListener([this](jsi::Runtime& runtime) {
      updateValueFromDependecy(runtime);
    });

    // Save dependency
    _dependency = value;
    
    return jsi::Value::undefined();
  }
  
  JSI_HOST_FUNCTION(getDriver) {
    if(_dependency == nullptr) {
      return jsi::Value::undefined();
    }
    
    return jsi::Object::createFromHostObject(runtime, _dependency);
  }
  
  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkValue, addListener),
                       JSI_EXPORT_FUNC(RNSkValue, setDriver),
                       JSI_EXPORT_FUNC(RNSkValue, getDriver))
  
private:
  
  void updateValueFromDependecy(jsi::Runtime& runtime) {
    if(_dependency == nullptr) {
      return;
    }
    auto dependencyValue = _dependency->get_value(runtime);
    if(_dependencyUpdater != nullptr) {
      // Set this value's value to the dependant value's value - through the
      // callback that calculates a new value
      auto nextValue = _dependencyUpdater->call(runtime, dependencyValue);
      update(runtime, nextValue);
    } else {
      update(runtime, dependencyValue);
    }
  }
  
  void clearDependency() {
    if(_dependency != nullptr || _dependencyUnsubcriptor != nullptr) {
      // Remove subscription
      _dependencyUnsubcriptor();
      _dependencyUnsubcriptor = nullptr;
      _dependencyUpdater = nullptr;
      _dependency = nullptr;
    }
  }
  
  std::shared_ptr<jsi::Function> _dependencyUpdater;
  std::shared_ptr<RNSkReadonlyValue> _dependency;
  std::function<void()> _dependencyUnsubcriptor;
};

}
