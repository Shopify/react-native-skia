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
class JsiDomNodeProps: public std::enable_shared_from_this<JsiDomNodeProps> {
public:
  JsiDomNodeProps(jsi::Runtime& runtime, jsi::Object&& props): _props(std::move(props)) {}
  
  ~JsiDomNodeProps() {
    for(auto& unsubscribe: _unsubscriptions) {
      unsubscribe();
    }
  }
  
  void setProp(jsi::Runtime &runtime,
               const std::string& name,
               const jsi::Value& value) {
    _values.emplace(name, JsiValue(runtime).setCurrent(runtime, value));
  }
  
  void tryReadNumericProperty(jsi::Runtime &runtime, const std::string& name, bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::Number, isOptional);
  }
  
  void tryReadStringProperty(jsi::Runtime &runtime, const std::string& name, bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::String, isOptional);
  }
  
  void tryReadHostObjectProperty(jsi::Runtime &runtime, const std::string& name, bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::HostObject, isOptional);
  }
  
  void tryReadObjectProperty(jsi::Runtime &runtime, const std::string& name, bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::Object, isOptional);
  }
  
  bool hasValue(const std::string& name) {
    if(_values.count(name) == 0) {
      return false;
    }
    auto value = _values.at(name);
    if(value.isUndefinedOrNull()) {
      return false;
    }
    return true;
  }
  
  JsiValue& getValue(const std::string& name) {
    if(!hasValue(name)) {
      throw std::runtime_error("Could not find property " + name + ".");
    }
    return _values.at(name);
  }
  
  bool getIsDirty() { return _isDirty; }
  void markClean() { _isDirty = false; }
    
private:
  void readProperty(jsi::Runtime &runtime,
                    const std::string& name,
                    JsiValue::PropType type,
                    bool isOptional = true) {
    // get the prop value from the props object
    auto propValue = _props.getProperty(runtime, name.c_str());
    
    // Check optional value allowed?
    auto isUndefinedOrNull = propValue.isUndefined() || propValue.isNull();
    
    if(!isOptional && isUndefinedOrNull) {
      throw jsi::JSError(runtime, "Property " + name + " is not optional.");
    }
    
    // Check type
    auto value = (JsiValue(runtime).setCurrent(runtime, propValue));
    
    // We need to check if this is an animated value - they should be handled differently
    if(isAnimatedValue(value)) {
      // Add subscription to animated value
      auto unsubscribe = getAnimatedValue(value)->addListener(
        [weakSelf = weak_from_this(), value, name](jsi::Runtime& runtime) {
          auto self = weakSelf.lock();
          if(self) {
            self->_values.at(name).setCurrent(runtime, self->getAnimatedValue(value)->getCurrent(runtime));
            self->_isDirty = true;
          }
        }
      );
      
      _unsubscriptions.push_back(unsubscribe);
      
      // Add initial resolved value to props
      _values.emplace(name, JsiValue(runtime).setCurrent(runtime, getAnimatedValue(value)->getCurrent(runtime)));
    } else {
      // Regular value, just ensure that the type is correct:
      if(value.getType() != type && !(isOptional && isUndefinedOrNull)) {
        throw jsi::JSError(runtime, "Expected \"" + JsiValue::getTypeAsString(type) +
                           "\", got \"" + JsiValue::getTypeAsString(value.getType()) +
                           "\" for property \"" + name + "\".");
      }
      
      // Add value to props
      _values.emplace(name, value);
    }
  }
  
  bool isAnimatedValue(const JsiValue& value) {
    return value.getType() == JsiValue::PropType::HostObject &&
      std::dynamic_pointer_cast<RNSkReadonlyValue>(value.getAsHostObject()) != nullptr;
  }
  
  std::shared_ptr<RNSkReadonlyValue> getAnimatedValue(const JsiValue& value) {
    return std::dynamic_pointer_cast<RNSkReadonlyValue>(value.getAsHostObject());
  }
  
  bool isSelector(const JsiValue& value) {
    // FIXME: Implement support for selectors. This is rather simple, we just add
    // a listener on the selector's callback and then we'll do the javascript
    // resolving in the callback (which will always be on the Javascript thread)!
    return false;
  }
  
  std::unordered_map<std::string, JsiValue> _values;
  jsi::Object _props;
  std::vector<std::function<void()>> _unsubscriptions;
  std::atomic<bool> _isDirty = { true };
};

}
