#pragma once

#include "JsiPropValue.h"

namespace RNSkia {

class JsiDomNodeProps {
public:
  JsiDomNodeProps(jsi::Runtime& runtime, jsi::Object&& props): _props(std::move(props)) {}
  
  void setProp(jsi::Runtime &runtime,
               const std::string& name,
               const jsi::Value& value) {
    _values.emplace(name, JsiPropValue(runtime, value));
  }
  
  void tryReadNumericProperty(jsi::Runtime &runtime, const std::string& name, bool isOptional = true) {
    readProperty(runtime, name, JsiPropValue::PropType::Number, isOptional);
  }
  
  void tryReadStringProperty(jsi::Runtime &runtime, const std::string& name, bool isOptional = true) {
    readProperty(runtime, name, JsiPropValue::PropType::String, isOptional);
  }
  
  void tryReadHostObjectProperty(jsi::Runtime &runtime, const std::string& name, bool isOptional = true) {
    readProperty(runtime, name, JsiPropValue::PropType::HostObject, isOptional);
  }
  
  void tryReadObjectProperty(jsi::Runtime &runtime, const std::string& name, bool isOptional = true) {
    readProperty(runtime, name, JsiPropValue::PropType::Object, isOptional);
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
  
  JsiPropValue& getValue(const std::string& name) {
    if(!hasValue(name)) {
      throw std::runtime_error("Could not find property " + name + ".");
    }
    return _values.at(name);
  }
    
private:
  void readProperty(jsi::Runtime &runtime,
                    const std::string& name,
                    JsiPropValue::PropType type,
                    bool isOptional = true) {
    // get the prop value from the props object
    auto propValue = _props.getProperty(runtime, name.c_str());
    
    // Check optional value allowed?
    auto isUndefinedOrNull = propValue.isUndefined() || propValue.isNull();
    
    if(!isOptional && isUndefinedOrNull) {
      throw jsi::JSError(runtime, "Property " + name + " is not optional.");
    }
    
    // Check type
    auto value = JsiPropValue(runtime, propValue);
    if(value.getType() != type && !(isOptional && isUndefinedOrNull)) {
      throw jsi::JSError(runtime, "Expected type " + JsiPropValue::getTypeAsString(type) +
                         " for property " + name + ". Got " + JsiPropValue::getTypeAsString(value.getType()));
    }
    
    // Check that we have a valid type
    _values.emplace(name, value);
  }
  
  std::unordered_map<std::string, JsiPropValue> _values;
  jsi::Object _props;
};

}
