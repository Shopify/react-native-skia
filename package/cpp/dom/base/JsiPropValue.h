
#pragma once

namespace RNSkia {

class JsiPropValue {
public:
  enum PropType {
    Undefined,
    Null,
    Bool,
    Number,
    String,
    Object,
    HostObject,
    HostFunction,
    Array
  };
  
  JsiPropValue(jsi::Runtime& runtime, const jsi::Value& value) {
    setCurrent(runtime, value);
  }
  
  PropType getType() { return _type; }
    
  bool isUndefinedOrNull() {
    return isUndefined() || isNull();
  }
  
  bool isUndefined() {
    return _type == PropType::Undefined;
  }
  
  bool isNull() {
    return _type == PropType::Null;
  }
  
  bool getAsBool() {
    assert(_type == PropType::Bool);
    return _boolValue;
  }
  
  double getAsNumber() {
    assert(_type == PropType::Number);
    return _numberValue;
  }
  
  const std::string& getAsString() {
    assert(_type == PropType::String);
    return _stringValue;
  }
  
  const std::vector<JsiPropValue>& getAsArray() {
    assert(_type == PropType::Array);
    return _array;
  }
  
  JsiPropValue& getValue(const std::string& name) {
    assert(_type == PropType::Object);
    assert(hasValue(name));
    return _props.at(name);
  }
  
  bool hasValue(const std::string& name) {
    assert(_type == PropType::Object);
    return _props.count(name) > 0;
  }
  
  const std::shared_ptr<jsi::HostObject> getAsHostObject() {
    assert(_type == PropType::HostObject);
    return _hostObject;
  }
  
  const jsi::HostFunctionType getAsHostFunction() {
    assert(_type == PropType::HostFunction);
    return _hostFunction;
  }
  
  static std::string getTypeAsString(PropType type) {
    switch(type) {
      case PropType::Undefined: return "Undefined";
      case PropType::Null: return "Null";
      case PropType::Number: return "Number";
      case PropType::Bool: return "Boolean";
      case PropType::String: return "String";
      case PropType::Object: return "Object";
      case PropType::Array: return "Array";
      case PropType::HostObject: return "HostObject";
      case PropType::HostFunction: return "HostFunction";
    }
  }
  
private:
  void setCurrent(jsi::Runtime &runtime, const jsi::Value &value)
  {
    if (value.isNumber()) {
      _type = PropType::Number;
      _numberValue = value.asNumber();
    } else if (value.isBool()) {
      _type = PropType::Bool;
      _boolValue = value.getBool();
    } else if (value.isString()) {
      _type = PropType::String;
      _stringValue = value.asString(runtime).utf8(runtime);
    } else if (value.isUndefined()) {
      _type = PropType::Undefined;
    } else if (value.isNull()) {
      _type = PropType::Null;
    } else if (value.isObject()) {
      setObject(runtime, value.asObject(runtime));
    } else {
      throw std::runtime_error("Could not store jsi::Value of provided type");
    }
  }
  
  void setObject(jsi::Runtime& runtime, const jsi::Object& obj) {
    if (obj.isFunction(runtime)) {
      setFunction(runtime, obj);
    } else if (obj.isArray(runtime)) {
      setArray(runtime, obj);
    } else if (obj.isHostObject(runtime)) {
      setHostObject(runtime, obj);
    } else {
      _type = PropType::Object;
      // Read object keys
      auto keys = obj.getPropertyNames(runtime);
      size_t size = keys.size(runtime);
      _props.reserve(size);
      
      for(size_t i=0; i < size; ++i) {
        auto key = keys.getValueAtIndex(runtime, i).asString(runtime).utf8(runtime);
        try {
          _props.emplace(key, JsiPropValue(runtime, obj.getProperty(runtime, key.c_str())));
        } catch(jsi::JSError e) {
          throw jsi::JSError(runtime, "Could not set property for key " + key + ":\n" + e.getMessage(), e.getStack());
        }
      }
    }
  }
  
  void setFunction(jsi::Runtime& runtime, const jsi::Object& obj) {
    if (obj.asFunction(runtime).isHostFunction(runtime)) {
      _type = PropType::HostFunction;
      _hostFunction = obj.asFunction(runtime).getHostFunction(runtime);
    } else {
      throw jsi::JSError(runtime, "Regular JavaScript functions cannot be used as properties.");
    }
  }
  
  void setArray(jsi::Runtime& runtime, const jsi::Object& obj) {
    _type = PropType::Array;
    auto arr = obj.asArray(runtime);
    size_t size = arr.size(runtime);
    _array.reserve(size);
    for(size_t i=0; i<size; ++i) {
      _array[i] = JsiPropValue(runtime, arr.getValueAtIndex(runtime, i));      
    }
  }
  
  void setHostObject(jsi::Runtime& runtime, const jsi::Object& obj) {
    _type = PropType::HostObject;
    _hostObject = obj.asHostObject(runtime);
  }
  
  PropType _type;
  bool _boolValue;
  double _numberValue;
  std::string _stringValue;
  std::shared_ptr<jsi::HostObject> _hostObject;
  jsi::HostFunctionType _hostFunction;
  std::unordered_map<std::string, JsiPropValue> _props;
  std::vector<JsiPropValue> _array;
};

}
