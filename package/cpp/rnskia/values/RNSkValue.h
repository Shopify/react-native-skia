#pragma once

#include <algorithm>
#include <functional>
#include <iostream>
#include <memory>
#include <mutex>
#include <unordered_map>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiValue.h"
#include "RNSkPlatformContext.h"

#include "RNSkColorConverter.h"
#include "RNSkColorInterpolator.h"
#include "RNSkNumericConverter.h"

namespace RNSkia {

using namespace RNJsi; // NOLINT

class RNSkMutableValue;

/**
 Implements a non-mutable value class
 */
class RNSkValue : public JsiSkHostObject,
                  public std::enable_shared_from_this<RNSkValue> {
public:
  /**
   Constructor
   */
  RNSkValue(std::shared_ptr<RNSkPlatformContext> platformContext,
            JsiValue &initialValue)
      : JsiSkHostObject(platformContext) {
    setCurrent(initialValue);
  }

  /**
   Constructor
   */
  explicit RNSkValue(std::shared_ptr<RNSkPlatformContext> platformContext)
      : JsiSkHostObject(platformContext) {
    auto jsiValue = JsiValue(0.0);
    setCurrent(jsiValue);
  }

  /**
   Returns the inner value
   */
  virtual JsiValue &getCurrent() {
    return _current;
  }

  /**
   Adds listener value as a weak dependency that listents to changes in this
   value.
   */
  std::function<void()> addListener(std::function<void(RNSkValue *)> listener) {
    // Add listener
    auto currentListenerId = _listenerId++;
    {
      std::lock_guard<std::mutex> lock(_listenerMutex);
      _listeners.emplace(currentListenerId, listener);
    }

    // Return method for unsubscribing to the value
    return [weakSelf = weak_from_this(), currentListenerId]() {
      auto self = weakSelf.lock();
      if (self) {
        auto selfAsThis = std::static_pointer_cast<RNSkValue>(self);
        std::lock_guard<std::mutex> lock(selfAsThis->_listenerMutex);
        selfAsThis->_listeners.erase(currentListenerId);

        if (selfAsThis->_listeners.size() == 0) {
          selfAsThis->onListenersBecameEmpty();
        }
      }
    };
  }

  JSI_PROPERTY_GET(__typename__) {
    return jsi::String::createFromUtf8(runtime, "RNSkValue");
  }

  JSI_PROPERTY_GET(current) {
    std::lock_guard<std::mutex> lock(_valueMutex);
    return getCurrent().getAsJsiValue(runtime);
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(RNSkValue, __typename__),
                              JSI_EXPORT_PROP_GET(RNSkValue, current))

  JSI_HOST_FUNCTION(addListener) {
    if (!arguments[0].isObject() ||
        !arguments[0].asObject(runtime).isFunction(runtime)) {
      throw jsi::JSError(runtime, "Expected function as first parameter.");
      return jsi::Value::undefined();
    }
    auto callback = std::make_shared<jsi::Function>(
        arguments[0].asObject(runtime).asFunction(runtime));

    auto unsubscribe =
        addListener([weakSelf = weak_from_this(),
                     callback = std::move(callback), &runtime](RNSkValue *) {
          auto self = weakSelf.lock();
          if (self) {
            self->getContext()->runOnJavascriptThread(
                [&weakSelf, callback = std::move(callback), &runtime]() {
                  auto self = weakSelf.lock();
                  if (self) {
                    callback->call(runtime, self->get_current(runtime));
                  }
                });
          }
        });

    return jsi::Function::createFromHostFunction(
        runtime, jsi::PropNameID::forUtf8(runtime, "unsubscribe"), 0,
        JSI_HOST_FUNCTION_LAMBDA {
          unsubscribe();
          return jsi::Value::undefined();
        });
  }

  JSI_HOST_FUNCTION(__invalidate) {
    invalidate();
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkValue, __invalidate),
                       JSI_EXPORT_FUNC(RNSkValue, addListener))

protected:
  /**
     Override to implement invalidation logic for the value. In the base class
     this function clears all subscribers.
   */
  virtual void invalidate() { _listeners.clear(); }

  /**
   Notifies all listeners that this value has changed.
   */
  void notifyListeners() {
    if (getContext()->isOnJavascriptThread()) {
      // Invoked from javascript - ensure we run on main thread
      getContext()->runOnMainThread([weakSelf = weak_from_this()]() {
        auto self = weakSelf.lock();
        if (self) {
          self->internalNotifyListeners();
        }
      });
    } else {
      std::lock_guard<std::mutex> lock(_listenerMutex);
      for (auto &listener : _listeners) {
        listener.second(this);
      }
    }
  }

  /**
   Override to implement logic that will run when the listeners vector becomes
   empty due to the last one being removed.
   */
  virtual void onListenersBecameEmpty() {}

  /**
   Sets the current numeric inner value for this value
  */
  void setCurrent(const JsiValue &newValue) {
    {
      // Happy path for numbers - they're a bit more easy to set.
      if (newValue.getType() == PropType::Number) {
        setCurrent(newValue.getAsNumber());
      } else {
        _current.setCurrent(newValue);
      }
    }
    notifyListeners();
  }

  /**
   Sets the current numeric inner value for this value
  */
  void setCurrent(double newValue) {
    _current.setCurrent(newValue);
    notifyListeners();
  }

  /**
   Sets the current from a js value
  */
  void setCurrent(jsi::Runtime &runtime, const jsi::Value &value) {
    {
      std::lock_guard<std::mutex> lock(_valueMutex);
      _current.setCurrent(JsiValue(runtime, value));
    }
    notifyListeners();
  }

private:
  /**
   Notifies listeners - this method is not thread safe - use notifyListeners instead.
   */
  void internalNotifyListeners () {
    std::lock_guard<std::mutex> lock(_listenerMutex);
    for (auto &listener : _listeners) {
      listener.second(this);
    }
  }
                    
  JsiValue _current;

  // Identifier of listener
  size_t _listenerId = 1000;

  // Stores listeners
  std::unordered_map<size_t, std::function<void(RNSkValue *)>> _listeners;

  // Mutex for locking access to listeners
  std::mutex _listenerMutex;
                    
  // Mutex for ensuring thread safe access to the current value
  std::mutex _valueMutex;
};

/**
 Implements a mutable Skia Value class
 */
class RNSkMutableValue : public RNSkValue {
public:
  /**
   Constructs a new Mutable Skia Value from a given initial JsiValue.
   */
  RNSkMutableValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                   const JsiValue &initialValue)
      : RNSkValue(platformContext) {
    auto jsiValue = JsiValue(initialValue);
    setCurrent(jsiValue);
  }

  /**
   Constructs a new Mutable Skia Value with an empty start value
   */
  explicit RNSkMutableValue(
      std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkMutableValue(platformContext, std::move(JsiValue(0.0))) {}

  /**
   Constructs a new Mutable Skia Value from a given initial runtime and
   jsi::Value
   */
  RNSkMutableValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                   jsi::Runtime &runtime, const jsi::Value &value)
      : RNSkMutableValue(platformContext, JsiValue(runtime, value)) {}

  /**
   Sets the current numeric inner value for this value
  */
  void setCurrent(const JsiValue &newValue) { RNSkValue::setCurrent(newValue); }

  /**
   Sets the current numeric inner value for this value
  */
  void setCurrent(double newValue) { RNSkValue::setCurrent(newValue); }

  JSI_PROPERTY_SET(current) {
    setCurrent(JsiValue(runtime, value));
    // Unset any animations to stop them - since setting the current property should
    // automatically "take over" updating from a running animation
    setAnimation(nullptr);
  }

  JSI_PROPERTY_SET(animation) {
    // Let's accept removing the animation by setting it to empty
    if (value.isUndefined() || value.isNull()) {
      setAnimation(nullptr);
      return;
    }

    // Verify argument
    if (!value.isObject()) {
      throw jsi::JSError(
          runtime, "Expected animation value for the animation property.");
    }

    auto valueObj = value.asObject(runtime);
    if (!valueObj.isHostObject(runtime)) {
      throw jsi::JSError(
          runtime, "Expected animation object for the animation property.");
    }

    // Get the underlying animation object
    auto animation =
        std::dynamic_pointer_cast<RNSkValue>(valueObj.getHostObject(runtime));

    if (animation == nullptr) {
      throw jsi::JSError(runtime, "Expected Skia animation, got something else "
                                  "for the animation property.");
    }

    setAnimation(animation);
  }

  JSI_PROPERTY_GET(animation) { return getAnimation(runtime); }

  JSI_EXPORT_PROPERTY_SETTERS(JSI_EXPORT_PROP_SET(RNSkMutableValue, current),
                              JSI_EXPORT_PROP_SET(RNSkMutableValue, animation))

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(RNSkValue, __typename__),
                              JSI_EXPORT_PROP_GET(RNSkValue, current),
                              JSI_EXPORT_PROP_GET(RNSkMutableValue, animation))

protected:
  /**
   Sets the animation object - ie the driver of this value. We'll keep a
   reference to the value so that it will live as long as we're using it for
   input. When it is removed it will be stopped.
   */
  void setAnimation(std::shared_ptr<RNSkValue> animation) {
    // Do we already have an animation running? Unsubscribe
    if (_unsubscribe != nullptr) {
      (*_unsubscribe)();
      _unsubscribe = nullptr;
    }

    _animation = animation;
    if (_animation == nullptr) {
      return;
    }

    // Subscribe to the animation
    _unsubscribe =
        std::make_unique<std::function<void()>>(_animation->addListener(
            [weakSelf = weak_from_this()](RNSkValue *value) {
              auto self = weakSelf.lock();
              if (self) {
                // Animation did update - let's update our inner animation value
                auto selfAsThis =
                    std::static_pointer_cast<RNSkMutableValue>(self);
                selfAsThis->setCurrent(value->getCurrent());
              }
            }));
  }

private:
  /**
   Returns the current animation value if it is set.
   */
  jsi::Value getAnimation(jsi::Runtime &runtime) {
    if (_animation == nullptr) {
      return jsi::Value::undefined();
    }

    return jsi::Object::createFromHostObject(runtime, _animation);
  }

  std::unique_ptr<std::function<void()>> _unsubscribe;
  std::shared_ptr<RNSkValue> _animation;
};
} // namespace RNSkia
