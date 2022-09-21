
#pragma once

#include "JsiValue.h"
#include "RNSkReadonlyValue.h"

namespace RNSkia {

using namespace RNJsi;

class JsiPropValue: public JsiValue {
public:
  JsiPropValue(jsi::Runtime& runtime): JsiValue(runtime) {}
  
  bool isUndefined() const override {
    if(isAnimatedValue()) {
      return getAnimatedValue()->getCurrent()->isUndefined();
    }
    return JsiValue::isUndefined();
  }
  
  bool isNull() const override {
    if(isAnimatedValue()) {
      return getAnimatedValue()->getCurrent()->isNull();
    }
    return JsiValue::isNull();
  }
  
  bool getAsBool() const override {
    if(isAnimatedValue()) {
      return getAnimatedValue()->getCurrent()->getAsBool();
    }
    return JsiValue::getAsBool();
  }
  
  double getAsNumber() const override {
    if(isAnimatedValue()) {
      return getAnimatedValue()->getCurrent()->getAsNumber();
    }
    return JsiValue::getAsNumber();
  }
  
  const std::string& getAsString() const override {
    if(isAnimatedValue()) {
      return getAnimatedValue()->getCurrent()->getAsString();
    }
    return JsiValue::getAsString();
  }
  
  const JsiValue& getValue(const std::string& name) const override {
    if(isAnimatedValue()) {
      throw std::runtime_error("Can't get value from object stored in Animated value yet...");
    }
    return JsiValue::getValue(name);
  }
  
  bool hasValue(const std::string& name) const override {
    if(isAnimatedValue()) {
      throw std::runtime_error("Can't call hasValue from object stored in Animated value yet...");
    }
    return JsiValue::hasValue(name);
  }
  
  const std::shared_ptr<jsi::HostObject> getAsHostObject() const override {
    if(isAnimatedValue()) {
      throw std::runtime_error("Can't call getAsHostObject from object stored in Animated value yet...");
    }
    return JsiValue::getAsHostObject();
  }
  
 const jsi::HostFunctionType getAsHostFunction() const override {
    if(isAnimatedValue()) {
      throw std::runtime_error("Can't call getAsHostFunction from object stored in Animated value yet...");
    }
    return JsiValue::getAsHostFunction();
  }
  
  bool isAnimatedValue() const {
    return _cachedAnimatedValue != nullptr;
  }
  
  
  JsiPropValue& setCurrent(jsi::Runtime &runtime, const jsi::Value &value) override {
    JsiValue::setCurrent(runtime, value);
    if(getType() == JsiValue::PropType::HostObject) {
      _cachedAnimatedValue = std::dynamic_pointer_cast<RNSkReadonlyValue>(getAsHostObject());
    }
    return *this;
  }
  
private:
  std::shared_ptr<RNSkReadonlyValue> getAnimatedValue() const {
    assert(isAnimatedValue());
    return _cachedAnimatedValue;
  }
  
  std::shared_ptr<RNSkReadonlyValue> _cachedAnimatedValue;
};

}
