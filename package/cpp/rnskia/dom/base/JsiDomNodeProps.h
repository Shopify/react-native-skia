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
    unsubscribe();
  }
  
  void unsubscribe() {
    for(auto& unsubscribe: _unsubscriptions) {
      unsubscribe();
    }
    _unsubscriptions.clear();
  }
  
  void setProp(jsi::Runtime &runtime,
               const std::string& name,
               const jsi::Value& value) {
    auto p = std::make_shared<JsiValue>(runtime);
    _values.emplace(name, p);
    p->setCurrent(runtime, value);
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
  
  void tryReadArrayProperty(jsi::Runtime &runtime, const std::string& name, bool isOptional = true) {
    readProperty(runtime, name, JsiValue::PropType::Array, isOptional);
  }
  
  bool hasValue(const std::string& name) {
    if(_values.count(name) == 0) {
      return false;
    }
    auto value = _values.at(name);
    if(value->isUndefinedOrNull()) {
      return false;
    }
    return true;
  }
  
  std::shared_ptr<JsiValue> getValue(const std::string& name) {
    if(!hasValue(name)) {
      throw std::runtime_error("Could not find property " + name + ".");
    }
    return _values.at(name);
  }
  
  bool getIsDirty() { return _isDirty; }
  void markClean() { _isDirty = false; }
  
  SkRect processRect(std::shared_ptr<JsiValue> prop) {
    if(prop->getType() == JsiValue::PropType::HostObject) {
      return *std::dynamic_pointer_cast<JsiSkRect>(prop->getAsHostObject())->getObject();
    } else {
      if(prop->hasValue("x") && prop->hasValue("y") &&
         prop->hasValue("width") && prop->hasValue("height")) {
        return SkRect::MakeXYWH(prop->getValue("x")->getAsNumber(),
                                prop->getValue("y")->getAsNumber(),
                                prop->getValue("width")->getAsNumber(),
                                prop->getValue("height")->getAsNumber());
      }
      throw std::runtime_error("Missing one or more rect properties, expected x, y, width and height.");
    }
  }
  
  SkRect processRect() {
    if(hasValue("x") && hasValue("y") &&
       hasValue("width") && hasValue("height")) {
      return SkRect::MakeXYWH(getValue("x")->getAsNumber(),
                              getValue("y")->getAsNumber(),
                              getValue("width")->getAsNumber(),
                              getValue("height")->getAsNumber());
    }
    throw std::runtime_error("Missing one or more rect properties, expected x, y, width and height.");
  }
  
  SkPoint processPoint(std::shared_ptr<JsiValue> prop) {
    if(prop->getType() == JsiValue::PropType::HostObject) {
      
      auto ptr = std::dynamic_pointer_cast<JsiSkPoint>(prop->getAsHostObject());
      if (ptr == nullptr) {
        // It is allowed to pass a rect as well
        auto rect = std::dynamic_pointer_cast<JsiSkRect>(prop->getAsHostObject());
        if (rect != nullptr) {
          return SkPoint::Make(rect->getObject()->x(), rect->getObject()->y());
        } else {
          throw std::runtime_error("Expected point or rect, got unknown type.");
        }
      }
      return *ptr->getObject();
      
    } else {
      if(prop->hasValue("x") && prop->hasValue("y")) {
        return SkPoint::Make(prop->getValue("x")->getAsNumber(), prop->getValue("y")->getAsNumber());
      }
      throw std::runtime_error("Missing one or more point properties, expected x and y.");
    }
  }
  
  SkPoint processPoint() {
    if(hasValue("x") && hasValue("y")) {
      return SkPoint::Make(getValue("x")->getAsNumber(), getValue("y")->getAsNumber());
    }
    throw std::runtime_error("Missing one or more point properties, expected x and y.");
  }
    
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
    auto prop = std::make_shared<JsiValue>(runtime);
    prop->setCurrent(runtime, propValue);
    
    // We need to check if this is an animated value - they should be handled differently
    if(isAnimatedValue(prop)) {
      // Add initial resolved value to props
      prop = std::make_shared<JsiValue>(runtime);
      prop->setCurrent(runtime, getAnimatedValue(prop)->getCurrent(runtime));
      _values.emplace(name, prop);
      
      // Add subscription to animated value
      auto unsubscribe = getAnimatedValue(prop)->addListener(
        [weakSelf = weak_from_this(), prop, name](jsi::Runtime& runtime) {
          auto self = weakSelf.lock();
          if(self) {
            self->_values.at(name)->setCurrent(runtime, self->getAnimatedValue(prop)->getCurrent(runtime));
            self->_isDirty = true;
          }
        }
      );
      
      _unsubscriptions.push_back(unsubscribe);
            
    } else if (isSelector(prop)) {
      auto value = std::dynamic_pointer_cast<RNSkReadonlyValue>(prop->getValue("value")->getAsHostObject());
      auto selector = prop->getValue("selector")->getAsFunction();
      
      // Add initial resolved value to props
      jsi::Value current = value->getCurrent(runtime);
      auto result = selector(runtime, jsi::Value::null(), &current, 1);
      auto initial = std::make_shared<JsiValue>(runtime);
      initial->setCurrent(runtime, result);
      _values.emplace(name, initial);
      
      // Add subscription to animated value in selector
      auto unsubscribe = value->addListener(
        [weakSelf = weak_from_this(), prop, name, selector = std::move(selector), value = std::move(value)](jsi::Runtime& runtime) {
          auto self = weakSelf.lock();
          if(self) {
            jsi::Value current = value->getCurrent(runtime);
            auto result = selector(runtime, jsi::Value::null(), &current, 1);
            self->_values.at(name)->setCurrent(runtime, result);
            self->_isDirty = true;
          }
        }
      );
      
      _unsubscriptions.push_back(unsubscribe);
      
    } else {
      // Regular value, just ensure that the type is correct:
      if(prop->getType() != type && !(isOptional && isUndefinedOrNull)) {
        throw jsi::JSError(runtime, "Expected \"" + JsiValue::getTypeAsString(type) +
                           "\", got \"" + JsiValue::getTypeAsString(prop->getType()) +
                           "\" for property \"" + name + "\".");
      }
      
      // Add value to props
      _values.emplace(name, prop);
    }
  }
  
  bool isAnimatedValue(std::shared_ptr<JsiValue> value) {
    return value->getType() == JsiValue::PropType::HostObject &&
      std::dynamic_pointer_cast<RNSkReadonlyValue>(value->getAsHostObject()) != nullptr;
  }
  
  std::shared_ptr<RNSkReadonlyValue> getAnimatedValue(std::shared_ptr<JsiValue> value) {
    return std::dynamic_pointer_cast<RNSkReadonlyValue>(value->getAsHostObject());
  }
  
  bool isSelector(std::shared_ptr<JsiValue> value) {
    // Handling selectors is rather easy, we just add
    // a listener on the selector's callback and then we'll do the javascript
    // resolving in the callback (which will always be on the Javascript thread)!
    if(value->getType() == JsiValue::PropType::Object) {
      if(value->hasValue("selector") && value->hasValue("value")) {
        return true;
      }
    }
    return false;
  }
  
  std::unordered_map<std::string, std::shared_ptr<JsiValue>> _values;
  jsi::Object _props;
  std::vector<std::function<void()>> _unsubscriptions;
  std::atomic<bool> _isDirty = { true };
};

}
