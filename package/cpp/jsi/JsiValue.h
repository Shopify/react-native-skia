#pragma once

#include <jsi/jsi.h>

#include <unordered_map>

namespace RNJsi {

using namespace facebook;

/**
 This is a class that deep copies the values from JS to C++. It does not convert back
 to JS values. This is used when reading values from JS that will never be sent back to
 the JS side but just handled in the C++ world.
 */
class JsiValue {
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
  
  JsiValue(jsi::Runtime& runtime): _type(PropType::Undefined) {}
  
  virtual JsiValue& setCurrent(jsi::Runtime &runtime, const jsi::Value &value)
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
    
    return *this;
  }
  
  PropType getType() const { return _type; }
  
  bool isUndefinedOrNull() const {
    return isUndefined() || isNull();
  }
  
  virtual bool isUndefined() const {
    return _type == PropType::Undefined;
  }
  
  virtual bool isNull() const {
    return _type == PropType::Null;
  }
  
  virtual bool getAsBool() const {
    assert(_type == PropType::Bool);
    return _boolValue;
  }
  
  virtual double getAsNumber() const {
    assert(_type == PropType::Number);
    return _numberValue;
  }
  
  virtual const std::string& getAsString() const {
    assert(_type == PropType::String);
    return _stringValue;
  }
  
  virtual const std::vector<JsiValue>& getAsArray() const {
    assert(_type == PropType::Array);
    return _array;
  }
  
  virtual const JsiValue& getValue(const std::string& name) const {
    assert(_type == PropType::Object);
    assert(hasValue(name));
    return _props.at(name);
  }
  
  virtual bool hasValue(const std::string& name) const {
    assert(_type == PropType::Object);
    return _props.count(name) > 0;
  }
  
  virtual const std::shared_ptr<jsi::HostObject> getAsHostObject() const {
    assert(_type == PropType::HostObject);
    return _hostObject;
  }
  
  virtual const jsi::HostFunctionType getAsHostFunction() const {
    assert(_type == PropType::HostFunction);
    return _hostFunction;
  }
  
  virtual bool equals(jsi::Runtime &runtime, const jsi::Value& other) const {
    return equals(JsiValue(runtime).setCurrent(runtime, other));
  }
  
  virtual bool equals(const JsiValue& other) const {
    if (other.getType() != getType()) {
      return false;
    }
    
    switch(_type) {
      case PropType::Null:
      case PropType::Undefined:
        return true;
      case PropType::Number: return _numberValue == other.getAsNumber();
      case PropType::Bool: return _boolValue == other.getAsBool();
      case PropType::String: return _stringValue == other.getAsString();
      case PropType::Object:
      case PropType::Array:
      case PropType::HostObject:
      case PropType::HostFunction:
        return compareObjects(other);
    }
  }
  
  virtual jsi::Value getAsJsiValue(jsi::Runtime& runtime) {
    switch(_type) {
      case PropType::Undefined: return jsi::Value::undefined();
      case PropType::Null: return jsi::Value::null();
      case PropType::Number: return _numberValue;
      case PropType::Bool: return _boolValue;
      case PropType::String: return jsi::String::createFromUtf8(runtime, _stringValue);
      case PropType::Object: return getObject(runtime);
      case PropType::Array: return getArray(runtime);
      case PropType::HostObject: return getHostObject(runtime);
      case PropType::HostFunction: return getHostFunction(runtime);
    }
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
  
protected:
  const std::unordered_map<std::string, JsiValue>& getProps() const {
    return _props;
  }
 
private:
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
          _props.emplace(key, JsiValue(runtime).setCurrent(runtime, obj.getProperty(runtime, key.c_str())));
        } catch(jsi::JSError e) {
          throw jsi::JSError(runtime, "Could not set property for key " + key + ":\n" + e.getMessage(), e.getStack());
        }
      }
    }
  }
  
  jsi::Object getObject(jsi::Runtime &runtime) {
    assert(_type == PropType::Object);
    auto obj = jsi::Object(runtime);
    for(auto& p: _props) {
      obj.setProperty(runtime, p.first.c_str(), p.second.getAsJsiValue(runtime));
    }
    return obj;
  }
  
  bool compareObjects(const JsiValue& other) const {
    if(_type == PropType::Object) {
      if (_props.size() != other.getProps().size()) {
        return false;
      }
      for(auto& p: _props) {
        auto t = p.second.equals(other.getValue(p.first));
        if(!t) {
          return false;
        }
      }
      return true;
      
    } else if (_type == PropType::HostObject) {
      return getAsHostObject() == other.getAsHostObject();
    } else if (_type == PropType::HostFunction) {
      return false;
    } else if (_type == PropType::Array) {
      auto otherArr = other.getAsArray();
      if (_array.size() != otherArr.size()) {
        return false;
      }
      for(size_t i=0; i<_array.size(); ++i) {
        if (!_array[i].equals(otherArr[i])) {
          return false;
        }
      }
      return true;
    }
    throw std::runtime_error("Wrong type in equals call. Should not happen. File a bug.");
    return false;
  }
  
  void setFunction(jsi::Runtime& runtime, const jsi::Object& obj) {
    if (obj.asFunction(runtime).isHostFunction(runtime)) {
      _type = PropType::HostFunction;
      _hostFunction = obj.asFunction(runtime).getHostFunction(runtime);
    } else {
      throw jsi::JSError(runtime, "Regular JavaScript functions cannot be used as properties.");
    }
  }
  
  jsi::Object getHostFunction(jsi::Runtime &runtime) {
    assert(_type == PropType::HostFunction);
    return jsi::Function::createFromHostFunction(runtime, jsi::PropNameID::forUtf8(runtime, "fn"), 0, _hostFunction);
  }
  
  void setArray(jsi::Runtime& runtime, const jsi::Object& obj) {
    _type = PropType::Array;
    auto arr = obj.asArray(runtime);
    size_t size = arr.size(runtime);
    _array.reserve(size);
    for(size_t i=0; i<size; ++i) {
      _array[i] = JsiValue(runtime).setCurrent(runtime, arr.getValueAtIndex(runtime, i));
    }
  }
  
  jsi::Array getArray(jsi::Runtime &runtime) {
    assert(_type == PropType::Array);
    jsi::Array arr = jsi::Array(runtime, _array.size());
    for(size_t i=0; i<_array.size(); ++i) {
      arr.setValueAtIndex(runtime, i, _array[i].getAsJsiValue(runtime));
    }
    return arr;
  }
  
  void setHostObject(jsi::Runtime& runtime, const jsi::Object& obj) {
    _type = PropType::HostObject;
    _hostObject = obj.asHostObject(runtime);
  }
  
  jsi::Object getHostObject(jsi::Runtime &runtime) {
    assert(_type == PropType::HostObject);
    return jsi::Object::createFromHostObject(runtime, _hostObject);
  }
  
  PropType _type = PropType::Undefined;
  bool _boolValue;
  double _numberValue;
  std::string _stringValue;
  std::shared_ptr<jsi::HostObject> _hostObject;
  jsi::HostFunctionType _hostFunction;
  std::unordered_map<std::string, JsiValue> _props;
  std::vector<JsiValue> _array;
};

}
