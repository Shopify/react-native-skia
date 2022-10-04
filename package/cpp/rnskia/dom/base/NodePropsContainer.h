#pragma once

#include "JsiValue.h"
#include "RNSkReadonlyValue.h"

#include <vector>
#include <map>
#include <set>

namespace RNSkia {

/**
 This class manages marshalling from JS values over JSI to C++ values and is typically called when a new node is
 created or an existing node is updated from the reconciler. This class will then convert all pure JS values to C++ values
 so that they can be read from any thread, and it will also subscribe to any animated values to recieve updated values
 that will be usd in the next render frame.
 */
class NodePropsContainer {
public:
  /**
   Constructor. Pass the runtime and the JS object representing the properties, and a function that will be
   called when any property was changed from within this class as a result of a Skia value change.
   */
  NodePropsContainer(jsi::Runtime &runtime, jsi::Object &&props) : _props(std::move(props)) {}
    
  /*
   Returns property names for active props (those used by the current node)
   */
  std::vector<const char*> getKeys() {
    return _propNames;
  }
  
  /**
   Will commit all waiting changes in the list of swappable prop values
   */
  void commitDeferredPropertyChanges() {
    std::lock_guard<std::mutex> lock(_lock);
    
    for (auto el: _transactions) {
      if (_changedPropNames.count(el.first) > 0) {
        auto propValueSource = el.second;
        auto propValueDest = getPropValue(el.first);
        
        // Swap inner values
        propValueDest->swap(propValueSource.get());
        
        if (!propValueDest->isUndefinedOrNull()) {
          _propsWithValues.emplace(el.first);
        } else if (_propsWithValues.count(el.first) > 0) {
          _propsWithValues.erase(el.first);
        }
      }
    }
  }
  
  /**
   Adds a property change operation to pending transactions that can be commited at a later stage
   */
  void addDeferredPropertyChange(jsi::Runtime &runtime, PropId name, const jsi::Value &value) {
    if (hasPropValue(name)) {
      std::lock_guard<std::mutex> lock(_lock);
      if (_transactions.count(name) == 0) {
        _transactions.emplace(name, std::make_shared<JsiValue>(runtime, value));
      } else {
        _transactions.at(name)->setCurrent(runtime, value);
      }
      requestPropChange(name);
    }
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
    auto jsPropValue = _props.getProperty(runtime, name);
    
    // Check undefined or null
    auto isUndefinedOrNull = jsPropValue.isUndefined() || jsPropValue.isNull();
    
    // Check type
    auto nativePropValue = std::make_shared<JsiValue>(runtime, jsPropValue);
    
    // Set prop
    initializePropValue(runtime, name, jsPropValue);
    
    // Return the property value
    return _values.at(name);
  }
    
  /**
   Props are always regular objects - so we can easily return Object has our type.
   */
  PropType getType() {
    return PropType::Object;
  }
    
  /**
   Returns true if there are any property changes in the node.
   */
  bool getHasPropChanges() {
    return _changedPropNames.size() > 0;
  }
  
  /**
   Returns true if a specific property has changed. This function will also clear the flag
   if it exists for the property we asked for.
   */
  bool getHasPropChanges(PropId name) {
    return _changedPropNames.count(name) > 0;
  }
  
  /**
   Resets the property change counter
   */
  void resetPropChanges() {
    _changedPropNames.clear();
  }
  
private:
  /**
   Returns true if there is a value for the given property name. This can be used to test if a property
   is undefined or null from the JS context. Can be called outside the JS Context
   */
  bool hasPropValue(PropId name) {
    return (_propsWithValues.find(name) != _propsWithValues.end());
  }
  
  /**
   Returns a property value as a native value that can be read outside the JS Context. The property
   needs to be set using one the readProperty methods and have a non-null value.
   Test with the hasValue function to test before calling this function.
   */
  std::shared_ptr<JsiValue> getPropValue(PropId name) {
    return _values.at(name);
  }
  
  /**
   Sets a property from the JS side. This will read the property and convert it to a native value that
   can be read outside of the JS context.
   @param runtime Javascript runtime
   @param name Property name (stable id)
   @param value Javascript value to set
   */
  void initializePropValue(jsi::Runtime &runtime, PropId name, const jsi::Value &value) {
    
    // Prop was not previously set
    auto newProp = std::make_shared<JsiValue>(runtime, value);
    _values.emplace(name, newProp);
    _propNames.push_back(name);
    
    if (!newProp->isUndefinedOrNull()) {
      _propsWithValues.emplace(name);
    }
  
    // Call prop changed
    requestPropChange(name);
  }
    
  /**
   Increments the property change counter for the props object.
   */
  void requestPropChange(PropId name) {
    _changedPropNames.emplace(name);
  }
  
  std::map<PropId, std::shared_ptr<JsiValue>> _values;
  jsi::Object _props;
  
  std::set<PropId> _changedPropNames;
  std::set<PropId> _propsWithValues;
  std::map<PropId, std::shared_ptr<JsiValue>> _transactions;
  std::vector<const char*> _propNames;
  
  std::mutex _lock;
};

}
