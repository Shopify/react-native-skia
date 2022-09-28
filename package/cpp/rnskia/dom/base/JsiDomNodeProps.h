#pragma once

#include "JsiValue.h"
#include "RNSkReadonlyValue.h"

#include <vector>
#include <map>
#include <set>

namespace RNSkia {

static PropId PropNameSelector = JsiPropId::get("selector");
static PropId PropNameValue = JsiPropId::get("value");

/**
 This class manages marshalling from JS values over JSI to C++ values and is typically called when a new node is
 created or an existing node is updated from the reconciler. This class will then convert all pure JS values to C++ values
 so that they can be read from any thread, and it will also subscribe to any animated values to recieve updated values
 that will be usd in the next render frame.
 */
class JsiDomNodeProps :
public std::enable_shared_from_this<JsiDomNodeProps> {
public:
  /**
   Constructor. Pass the runtime and the JS object representing the properties, and a function that will be
   called when any property was changed from within this class as a result of a Skia value change.
   */
  JsiDomNodeProps(jsi::Runtime &runtime, jsi::Object &&props) : _props(std::move(props)) {}
  
  /**
   Destructor
   */
  ~JsiDomNodeProps() {
    unsubscribe();
  }
  
  /**
   Unsubcribes to all Skia value change listeners.
   */
  void unsubscribe() {
    for (auto &unsubscribe: _unsubscriptions) {
      unsubscribe();
    }
    _unsubscriptions.clear();
  }
  
  /**
   Tries to read a property as a numeric value. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read
   */
  std::shared_ptr<JsiValue> tryReadNumericProperty(jsi::Runtime &runtime,
                                                   PropId name) {
    return tryReadProperty(runtime, name, PropType::Number);
  }
  
  /**
   Tries to read a property as a string value. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read
   */
  std::shared_ptr<JsiValue> tryReadStringProperty(jsi::Runtime &runtime,
                                                  PropId name) {
    return tryReadProperty(runtime, name, PropType::String);
  }
  
  /**
   Tries to read a property as a host object. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read
   */
  std::shared_ptr<JsiValue> tryReadHostObjectProperty(jsi::Runtime &runtime,
                                                      PropId name) {
    return tryReadProperty(runtime, name, PropType::HostObject);
  }
  
  /**
   Tries to read a property as an object value. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read
   */
  std::shared_ptr<JsiValue> tryReadObjectProperty(jsi::Runtime &runtime,
                                                  PropId name) {
    return tryReadProperty(runtime, name, PropType::Object);
  }
  
  /**
   Tries to read a property as an array. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read   
   */
  std::shared_ptr<JsiValue> tryReadArrayProperty(jsi::Runtime &runtime,
                                                 PropId name) {
    return tryReadProperty(runtime, name, PropType::Array);
  }
    
  /**
   Tries to read a property as given type. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   
   If the property is a regular value it will be converted.
   If the property is a Skia value a listener will be installed listening for changes to the property
   If the property is a Skia Selector a listener will be installed on the value of the selector listening for changes to the property
   
   @param runtime JS Runtime
   @param name Name of property to read
   @param type Property type
   */
  std::shared_ptr<JsiValue> tryReadProperty(jsi::Runtime &runtime,
                                            PropId name,
                                            PropType type) {
    // get the prop value from the props object
    auto propValue = _props.getProperty(runtime, name);
    
    // Check undefined or null
    auto isUndefinedOrNull = propValue.isUndefined() || propValue.isNull();
    
    // Check type
    auto prop = std::make_shared<JsiValue>(runtime, propValue);
    
    // We need to check if this is an animated value - they should be handled differently
    if (isAnimatedValue(prop)) {
      // Add initial resolved value to props
      auto animatedValue = getAnimatedValue(prop);
      setProp(runtime, name, animatedValue->getCurrent(runtime));
      
      // Add subscription to animated value
      auto unsubscribe = animatedValue->addListener([weakSelf = weak_from_this(),
                                                     animatedValue,
                                                     name] (jsi::Runtime &runtime) {
      auto self = weakSelf.lock();
        if (self) {
          self->setProp(runtime, name, animatedValue->getCurrent(runtime));
        }
      });
      
      _unsubscriptions.push_back(unsubscribe);
      
    } else if (isSelector(prop)) {
      auto value = std::dynamic_pointer_cast<RNSkReadonlyValue>(prop->getValue(PropNameValue)->getAsHostObject());
      auto selector = prop->getValue(PropNameSelector)->getAsFunction();
      
      // Add initial resolved value to props
      jsi::Value current = value->getCurrent(runtime);
      setProp(runtime, name, selector(runtime, jsi::Value::null(), &current, 1));
      
      // Add subscription to animated value in selector
      auto unsubscribe = value->addListener([weakSelf = weak_from_this(), prop, name, selector = std::move(
        selector), value = std::move(value)](jsi::Runtime &runtime) {
         auto self = weakSelf.lock();
         if (self) {
           jsi::Value current = value->getCurrent(runtime);
           self->setProp(runtime, name, selector(runtime, jsi::Value::null(), &current, 1));
         }
      });
      
      _unsubscriptions.push_back(unsubscribe);
      
    } else {
      // Regular value, just ensure that the type is correct:
      if (prop->getType() != type && !isUndefinedOrNull) {
        throw jsi::JSError(runtime, "Expected \"" + JsiValue::getTypeAsString(type) +
                           "\", got \"" +
                           JsiValue::getTypeAsString(prop->getType()) +
                           "\" for property \"" + name + "\".");
      }
      
      // Set prop
      setProp(runtime, name, propValue);
    }
    
    return _values.at(name);
  }
  
  /**
   Returns true if the given value is a HostObject and it inherits from RNSkReadonlyValue.
   */
  bool isAnimatedValue(std::shared_ptr<JsiValue> value) {
    return value->getType() == PropType::HostObject &&
    std::dynamic_pointer_cast<RNSkReadonlyValue>(value->getAsHostObject()) != nullptr;
  }
  
  /**
   Returns the RNSkReadonlyValue pointer for a value that is an Animated value
   */
  std::shared_ptr<RNSkReadonlyValue> getAnimatedValue(std::shared_ptr<JsiValue> value) {
    return std::dynamic_pointer_cast<RNSkReadonlyValue>(value->getAsHostObject());
  }
  
  /**
   Returns true if the value is a selector. A Selector is a JS object that has two properties, the selector and the the value.
   The selector is a function that is used to transform the value - which is an animated skia value.
   */
  bool isSelector(std::shared_ptr<JsiValue> value) {
    // Handling selectors is rather easy, we just add
    // a listener on the selector's callback and then we'll do the javascript
    // resolving in the callback (which will always be on the Javascript thread)!
    if (value->getType() == PropType::Object) {
      if (value->hasValue(PropNameSelector) && value->hasValue(PropNameValue)) {
        return true;
      }
    }
    return false;
  }
  
  /**
   Props are always regular objects - so we can easily return Object has our type.
   */
  PropType getType() {
    return PropType::Object;
  }
  
  /**
   Returns true if there is a value for the given property name. This can be used to test if a property
   is undefined or null from the JS context. Can be called outside the JS Context
   */
  bool hasValue(PropId name) {
    std::lock_guard<std::mutex> lock(_lock);
    return (_propsWithValues.find(name) != _propsWithValues.end());
  }
  
  /**
   Returns a property value as a native value that can be read outside the JS Context. The property
   needs to be set using one the readProperty methods and have a non-null value.
   Test with the hasValue function to test before calling this function.
   */
  std::shared_ptr<JsiValue> getValue(PropId name) {
    std::lock_guard<std::mutex> lock(_lock);
    return _values.at(name);
  }
  
  /**
   Simple getKeys implementation
   */
  std::vector<PropId> getKeys() {
    std::lock_guard<std::mutex> lock(_lock);
    return _propNames;
  }
  
  /**
   Returns true if there are any property changes in the node.
   */
  bool getHasPropChanges() {
    std::lock_guard<std::mutex> lock(_lock);
    return _propChanges > 0;
  }
  
  /**
   Returns true if a specific property has changed. This function will also clear the flag
   if it exists for the property we asked for.
   */
  bool getHasPropChanges(PropId name) {
    std::lock_guard<std::mutex> lock(_lock);
    return _changedPropNames.count(name) > 0;
  }
  
  /**
   Resets the property change counter
   */
  void resetPropChanges() {
    std::lock_guard<std::mutex> lock(_lock);
    _propChanges = 0;
    _changedPropNames.clear();
  }
  
private:
  /**
   Sets a property from the JS side. This will read the property and convert it to a native value that
   can be read outside of the JS context.
   @param runtime Javascript runtime
   @param name Property name (stable id)
   @param value Javascript value to set
   */
  void setProp(jsi::Runtime &runtime, PropId name, const jsi::Value &value) {
    
    if (hasValue(name)) {
      // Prop has already been set, let's just update it.
      auto prop = getValue(name);
      
      std::lock_guard<std::mutex> lock(_lock);
      prop->setCurrent(runtime, value);
    
      if (!prop->isUndefinedOrNull()) {
        _propsWithValues.emplace(name);
      } else if (_propsWithValues.count(name) > 0) {
        _propsWithValues.erase(name);
      }
      
    } else {
      // Prop was not previously set
      auto newProp = std::make_shared<JsiValue>(runtime, value);
      _values.emplace(name, newProp);
      
      if (!newProp->isUndefinedOrNull()) {
        _propsWithValues.emplace(name);
      }
      
      // Add to prop names so that we cache it
      _propNames.push_back(name);
    }
    // Call prop changed
    requestPropChange(name);
  }
    
  /**
   Increments the property change counter for the props object.
   */
  void requestPropChange(PropId name) {
    _propChanges++;
    _changedPropNames.emplace(name);
  }
  
  std::map<PropId, std::shared_ptr<JsiValue>> _values;
  jsi::Object _props;
  std::vector<std::function<void()>> _unsubscriptions;
  
  std::atomic<size_t> _propChanges = { 0 };
  
  std::set<PropId> _changedPropNames;
  std::set<PropId> _propsWithValues;
  std::vector<PropId> _propNames;
  
  std::mutex _lock;
};

}
