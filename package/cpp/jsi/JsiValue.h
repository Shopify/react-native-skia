#pragma once

#include <jsi/jsi.h>
#include <unordered_map>

namespace RNJsi {

using namespace facebook;

static std::string empty = "";

enum struct PropType {
  Undefined = 1,
  Null = 2,
  Bool = 4,
  Number = 8,
  String = 16,
  Object = 32,
  HostObject = 64,
  HostFunction = 128,
  Array = 256
};

using PropId = const char*;

class JsiPropId {
public:
  static const char* get(const std::string& name) {
    return _get(name);
  };
  
  static const char* get(const std::string&& name) {
    return _get(std::move(name));
  };
private:
  static const char* _get(const std::string& name) {
    if (_impls().count(name) == 0) {
      // Alloc string
      char* impl = new char[name.size() + 1];
      strncpy(impl, name.c_str(), name.size() + 1);
      _impls().emplace(name, impl);
    }
    return _impls().at(name);
  }
  
  static std::unordered_map<std::string, PropId>& _impls() {
    static std::unordered_map<std::string, PropId> impls;
    return impls;
  };
};

/**
 This is a class that deep copies the values from JS to C++. It does not convert back
 to JS values. This is used when reading values from JS that will never be sent back to
 the JS side but just handled in the C++ world.
 */
class JsiValue {
public:
  JsiValue(jsi::Runtime& runtime): _type(PropType::Undefined) {}
  JsiValue(jsi::Runtime& runtime, const jsi::Value& value): JsiValue(runtime) {
    setCurrent(runtime, value);
  }
  
  void setCurrent(jsi::Runtime &runtime, const jsi::Value &value)
  {
    _stringValue = empty;
    _hostObject = nullptr;
    _hostFunction = nullptr;
    _props.clear();
    _array.clear();
    _keysCache.clear();
    
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
      setObject(runtime, value);
    } else {
      throw std::runtime_error("Could not store jsi::Value of provided type");
    }    
  }
  
  PropType getType() { return _type; }
  
  bool isUndefinedOrNull() const {
    return isUndefined() || isNull();
  }
  
  bool isUndefined() const {
    return _type == PropType::Undefined;
  }
  
  bool isNull() const {
    return _type == PropType::Null;
  }
  
  bool getAsBool() const {
    if (_type != PropType::Bool) {
      throw std::runtime_error("Expected type bool, got " + getTypeAsString(_type));
    }
    return _boolValue;
  }
  
  double getAsNumber() const {
    if (_type != PropType::Number) {
      throw std::runtime_error("Expected type number, got " + getTypeAsString(_type));
    }
    return _numberValue;
  }
  
  const std::string& getAsString() const {
    if (_type != PropType::String) {
      throw std::runtime_error("Expected type string, got " + getTypeAsString(_type));
    }
    return _stringValue;
  }
  
  const std::vector<std::shared_ptr<JsiValue>>& getAsArray() {
    if (_type != PropType::Array) {
      throw std::runtime_error("Expected type array, got " + getTypeAsString(_type));
    }
    return _array;
  }
  
  std::shared_ptr<JsiValue> getValue(PropId name) {
    if (_type != PropType::Object) {
      throw std::runtime_error("Expected type object, got " + getTypeAsString(_type));
    }
    return _props.at(name);
  }
  
  bool hasValue(PropId name) {
    if (_type != PropType::Object) {
      throw std::runtime_error("Expected type object, got " + getTypeAsString(_type));
    }
    return _props.count(name) > 0;
  }
  
  std::vector<PropId> getKeys() {
    if (_type != PropType::Object) {
      throw std::runtime_error("Expected type object, got " + getTypeAsString(_type));
    }
    return _keysCache;
  }
  
  std::shared_ptr<jsi::HostObject> getAsHostObject() {
    if (_type != PropType::HostObject) {
      throw std::runtime_error("Expected type host object, got " + getTypeAsString(_type));
    }
    return _hostObject;
  }
  
  template <typename T>
  std::shared_ptr<T> getAs() {
    if (_type != PropType::HostObject) {
      throw std::runtime_error("Expected type host object, got " + getTypeAsString(_type));
    }
    return std::dynamic_pointer_cast<T>(_hostObject);
  }
  
  const jsi::HostFunctionType getAsHostFunction() {
    if (_type != PropType::HostFunction) {
      throw std::runtime_error("Expected type host function, got " + getTypeAsString(_type));
    }
    return _hostFunction;
  }
  
  const jsi::HostFunctionType getAsFunction() {
    return getAsHostFunction();
  }
  
  std::string asString() {
    switch(_type) {
      case PropType::Null:
        return "(null)";
      case PropType::Undefined:
        return "(undefined)";
      case PropType::Number: return std::to_string(_numberValue);
      case PropType::Bool: return std::to_string(_boolValue);
      case PropType::String: return _stringValue;
      case PropType::Object: return "[Object]";
      case PropType::Array: return "[Array]";
      case PropType::HostObject: return "[HostObject]";
      case PropType::HostFunction: return "[HostFunction]";
    }
  }
  
  bool equals(jsi::Runtime &runtime, const jsi::Value& other) {
    auto p = std::make_shared<JsiValue>(runtime, other);
    return equals(p);
  }
  
  bool equals(std::shared_ptr<JsiValue> other) {
    if (other->getType() != getType()) {
      return false;
    }
    
    switch(_type) {
      case PropType::Null:
      case PropType::Undefined:
        return true;
      case PropType::Number: return _numberValue == other->getAsNumber();
      case PropType::Bool: return _boolValue == other->getAsBool();
      case PropType::String: return _stringValue == other->getAsString();
      case PropType::Object:
      case PropType::Array:
      case PropType::HostObject:
      case PropType::HostFunction:
        return compareObjects(other);
    }
  }
  
  void swap(JsiValue* other) {
    _type = other->getType();
    _boolValue = other->boolValue();
    _numberValue = other->numberValue();
    _stringValue = other->stringValue();
    _props = other->props();
    _keysCache = other->keysCache();
    _array = other->array();
    _hostObject = other->hostObject();
    _hostFunction = other->hostFunction();
  }
  
  jsi::Value getAsJsiValue(jsi::Runtime& runtime) {
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
  const std::unordered_map<PropId, std::shared_ptr<JsiValue>>& getProps() const {
    return _props;
  }
  
  bool boolValue() { return _boolValue; }
  double numberValue() { return _numberValue; }
  std::string stringValue() { return _stringValue; }
  std::shared_ptr<jsi::HostObject> hostObject() { return _hostObject; }
  jsi::HostFunctionType hostFunction() { return _hostFunction; }
  std::vector<std::shared_ptr<JsiValue>> array() { return _array; };
  std::unordered_map<PropId, std::shared_ptr<JsiValue>> props() { return _props; };
  std::vector<PropId> keysCache() { return _keysCache; }
 
private:
  void setObject(jsi::Runtime& runtime, const jsi::Value& value) {
    auto obj = value.asObject(runtime);
    if (obj.isFunction(runtime)) {
      setFunction(runtime, value);
    } else if (obj.isArray(runtime)) {
      setArray(runtime, obj);
    } else if (obj.isHostObject(runtime)) {
      setHostObject(runtime, obj);
    } else {
      _type = PropType::Object;
      // Read object keys
      auto keys = obj.getPropertyNames(runtime);
      size_t size = keys.size(runtime);
      _keysCache.clear();
      _keysCache.reserve(size);
      _props.clear();
      _props.reserve(size);
      
      for(size_t i=0; i < size; ++i) {
        auto key = JsiPropId::get(keys.getValueAtIndex(runtime, i).asString(runtime).utf8(runtime));
        try {
          auto p = std::make_shared<JsiValue>(runtime, obj.getProperty(runtime, key));
          _props.emplace(key, p);
          _keysCache.push_back(key);
        } catch(jsi::JSError e) {
          throw jsi::JSError(runtime, "Could not set property for key " + std::string(key) + ":\n" + e.getMessage(), e.getStack());
        }
      }
    }
  }
  
  jsi::Object getObject(jsi::Runtime &runtime) {
    assert(_type == PropType::Object);
    auto obj = jsi::Object(runtime);
    for(auto& p: _props) {
      obj.setProperty(runtime, p.first, p.second->getAsJsiValue(runtime));
    }
    return obj;
  }
  
  bool compareObjects(std::shared_ptr<JsiValue> other) {
    if(_type == PropType::Object) {
      if (_props.size() != other->getProps().size()) {
        return false;
      }
      for(auto& p: _props) {
        auto t = p.second->equals(other->getValue(p.first));
        if(!t) {
          return false;
        }
      }
      return true;
      
    } else if (_type == PropType::HostObject) {
      return getAsHostObject() == other->getAsHostObject();
    } else if (_type == PropType::HostFunction) {
      return false;
    } else if (_type == PropType::Array) {
      auto otherArr = other->getAsArray();
      if (_array.size() != otherArr.size()) {
        return false;
      }
      for(size_t i=0; i<_array.size(); ++i) {
        if (!_array[i]->equals(otherArr[i])) {
          return false;
        }
      }
      return true;
    }
    throw std::runtime_error("Wrong type in equals call. Should not happen. File a bug.");
    return false;
  }
  
  void setFunction(jsi::Runtime& runtime, const jsi::Value& value) {
    auto func = value.asObject(runtime).asFunction(runtime);
    if (func.isHostFunction(runtime)) {
      _type = PropType::HostFunction;
      _hostFunction = func.getHostFunction(runtime);
    } else {
      _type = PropType::HostFunction;
      auto obj = std::make_shared<jsi::Object>(value.asObject(runtime));
      _hostFunction = [obj](jsi::Runtime & runtime,
                              const jsi::Value &thisValue,
                              const jsi::Value *arguments,
                              size_t count) -> jsi::Value {
        auto func = obj->asFunction(runtime);
        if(thisValue.isNull() || thisValue.isUndefined()) {
          return func.call(runtime, arguments, count);
        } else {
          return func.callWithThis(runtime, thisValue.asObject(runtime), arguments, count);
        }
      };
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
      auto p = std::make_shared<JsiValue>(runtime, arr.getValueAtIndex(runtime, i));
      _array.push_back(p);
    }
  }
  
  jsi::Array getArray(jsi::Runtime &runtime) {
    assert(_type == PropType::Array);
    jsi::Array arr = jsi::Array(runtime, _array.size());
    for(size_t i=0; i<_array.size(); ++i) {
      arr.setValueAtIndex(runtime, i, _array[i]->getAsJsiValue(runtime));
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
  std::string _stringValue = empty;
  std::shared_ptr<jsi::HostObject> _hostObject;
  jsi::HostFunctionType _hostFunction;
  std::vector<std::shared_ptr<JsiValue>> _array;
  std::unordered_map<PropId, std::shared_ptr<JsiValue>> _props;
  std::vector<PropId> _keysCache;
};

}
