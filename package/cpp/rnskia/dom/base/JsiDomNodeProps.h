#pragma once

#include "JsiValue.h"

#include <vector>

namespace RNSkia {

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
   Sets a property from the JS side. This will read the property and convert it to a native value that
   can be read outside of the JS context.
   */
  void setProp(jsi::Runtime &runtime,
               const std::string &name,
               const jsi::Value &value) {
    if (_values.count(name) > 0) {
      _values.at(name)->setCurrent(runtime, value);
    } else {
      auto p = std::make_shared<JsiValue>(runtime);
      p->setCurrent(runtime, value);
      _values.emplace(name, p);
    }
    requestPropChange(name);
  }
  
  /**
   Tries to read a property as a numeric value. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read
   @param isOptional If the property can be null or undefined (not set) (default is optional)
   */
  void tryReadNumericProperty(jsi::Runtime &runtime,
                              const std::string &name,
                              bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::Number, isOptional);
  }
  
  /**
   Tries to read a property as a string value. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read
   @param isOptional If the property can be null or undefined (not set) (default is optional)
   */
  void tryReadStringProperty(jsi::Runtime &runtime,
                             const std::string &name,
                             bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::String, isOptional);
  }
  
  /**
   Tries to read a property as a host object. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read
   @param isOptional If the property can be null or undefined (not set) (default is optional)
   */
  void tryReadHostObjectProperty(jsi::Runtime &runtime,
                                 const std::string &name,
                                 bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::HostObject, isOptional);
  }
  
  /**
   Tries to read a property as an object value. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read
   @param isOptional If the property can be null or undefined (not set) (default is optional)
   */
  void tryReadObjectProperty(jsi::Runtime &runtime, const std::string &name,
                             bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::Object, isOptional);
  }
  
  /**
   Tries to read a property as an array. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   @param runtime JS Runtime
   @param name Name of property to read
   @param isOptional If the property can be null or undefined (not set) (default is optional)
   */
  void tryReadArrayProperty(jsi::Runtime &runtime, const std::string &name,
                            bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::Array, isOptional);
  }
  
  /**
   Returns true if there is a value for the given property name. This can be used to test if a property
   is undefined or null from the JS context. Can be called outside the JS Context
   */
  bool hasValue(const std::string &name) {
    if (_values.count(name) == 0) {
      return false;
    }
    auto value = _values.at(name);
    if (value->isUndefinedOrNull()) {
      return false;
    }
    return true;
  }
  
  /**
   Returns a property value as a native value that can be read outside the JS Context. The property
   needs to be set - use the hasValue function to test before calling this function.
   */
  std::shared_ptr<JsiValue> getValue(const std::string &name) {
    if (!hasValue(name)) {
      throw std::runtime_error("Could not find property " + name + ".");
    }
    return _values.at(name);
  }
  
  
  /**
   Returns true if there are any property changes in the node.
   */
  bool getHasPropChanges() {
    return _propChanges > 0;
  }
  
  /**
   Returns true if a specific property has changed. This function will also clear the flag
   if it exists for the property we asked for.
   */
  bool readPropChangesAndClearFlag(const std::string& name) {
    auto c = _changedPropNames.count(name) > 0;
    if (c) {
      _changedPropNames.erase(name);
    }
    return c;
  }
  
  /**
   Resets the property change counter
   */
  void resetPropChangeCounter() {
    _propChanges = 0;
  }
  
private:
  /**
   Tries to read a property as given type. This will try to read the property, verify type and optionality and finally
   convert the JS value into a native value that can be read outside the JS Context.
   
   If the property is a regular value it will be converted.
   If the property is a Skia value a listener will be installed listening for changes to the property
   If the property is a Skia Selector a listener will be installed on the value of the selector listening for changes to the property
   
   @param runtime JS Runtime
   @param name Name of property to read
   @param isOptional If the property can be null or undefined (not set) (default is optional)
   */
  void readProperty(jsi::Runtime &runtime,
                    const std::string &name,
                    JsiValue::PropType type,
                    bool isOptional = true) {
    // get the prop value from the props object
    auto propValue = _props.getProperty(runtime, name.c_str());
    
    // Check optional value allowed?
    auto isUndefinedOrNull = propValue.isUndefined() || propValue.isNull();
    
    if (!isOptional && isUndefinedOrNull) {
      throw jsi::JSError(runtime, "Property " + name + " is not optional.");
    }
    
    // Check type
    auto prop = std::make_shared<JsiValue>(runtime);
    prop->setCurrent(runtime, propValue);
    
    // We need to check if this is an animated value - they should be handled differently
    if (isAnimatedValue(prop)) {
      // Add initial resolved value to props
      auto current = std::make_shared<JsiValue>(runtime);
      current->setCurrent(runtime, getAnimatedValue(prop)->getCurrent(runtime));
      
      // Save and mark as changed
      _values.emplace(name, current);
      requestPropChange(name);
      
      // Add subscription to animated value
      auto unsubscribe = getAnimatedValue(prop)->addListener([weakSelf = weak_from_this(),
                                                              prop,
                                                              name] (jsi::Runtime &runtime) {
      auto self = weakSelf.lock();
        if (self) {
          self->_values.at(name)->setCurrent(runtime, self->getAnimatedValue(prop)->getCurrent(runtime));
          self->requestPropChange(name);
        }
      });
      
      _unsubscriptions.push_back(unsubscribe);
      
    } else if (isSelector(prop)) {
      auto value = std::dynamic_pointer_cast<RNSkReadonlyValue>(prop->getValue("value")->getAsHostObject());
      auto selector = prop->getValue("selector")->getAsFunction();
      
      // Add initial resolved value to props
      jsi::Value current = value->getCurrent(runtime);
      auto result = selector(runtime, jsi::Value::null(), &current, 1);
      auto initial = std::make_shared<JsiValue>(runtime);
      initial->setCurrent(runtime, result);
      
      // Save and mark as changed
      _values.emplace(name, initial);
      requestPropChange(name);
      
      // Add subscription to animated value in selector
      auto unsubscribe = value->addListener([weakSelf = weak_from_this(), prop, name, selector = std::move(
        selector), value = std::move(value)](jsi::Runtime &runtime) {
         auto self = weakSelf.lock();
         if (self) {
           jsi::Value current = value->getCurrent(runtime);
           auto result = selector(runtime, jsi::Value::null(), &current, 1);
           self->_values.at(name)->setCurrent(runtime, result);
           self->requestPropChange(name);
         }
      });
      
      _unsubscriptions.push_back(unsubscribe);
      
    } else {
      // Regular value, just ensure that the type is correct:
      if (prop->getType() != type && !(isOptional && isUndefinedOrNull)) {
        throw jsi::JSError(runtime, "Expected \"" + JsiValue::getTypeAsString(type) +
                           "\", got \"" +
                           JsiValue::getTypeAsString(prop->getType()) +
                           "\" for property \"" + name + "\".");
      }
      
      // Add value to props
      _values.emplace(name, prop);
      requestPropChange(name);
    }
  }
  
  /**
   Returns true if the given value is a HostObject and it inherits from RNSkReadonlyValue.
   */
  bool isAnimatedValue(std::shared_ptr<JsiValue> value) {
    return value->getType() == JsiValue::PropType::HostObject &&
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
    if (value->getType() == JsiValue::PropType::Object) {
      if (value->hasValue("selector") && value->hasValue("value")) {
        return true;
      }
    }
    return false;
  }
  
  
  /**
   Increments the property change counter for the props object.
   */
  void requestPropChange(const std::string& name) {
    _propChanges++;
    _changedPropNames.emplace(name, 0);
  }
  
  std::unordered_map<std::string, std::shared_ptr<JsiValue>> _values;
  jsi::Object _props;
  std::vector<std::function<void()>> _unsubscriptions;
  
  std::atomic<size_t> _propChanges = { 0 };
  std::unordered_map<std::string, int> _changedPropNames;
};

}
