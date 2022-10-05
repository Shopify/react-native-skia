#pragma once

#include "BaseNodeProp.h"
#include "JsiValue.h"

namespace RNSkia {

/**
 Class for composing multiple properties into a derived property value
 */
class BaseDerivedProp: public BaseNodeProp {
public:
  BaseDerivedProp(): BaseNodeProp() {}
  
  /**
   True if the property has changed since we last visited it
   */
  bool isChanged() override {
    // Only one needs to be set
    for (auto &prop: _properties) {
      if (prop->isChanged()) {
        return true;
      }
    }
    return false;
  }
  
  /**
   Starts the process of updating and reading props
   */
  void beginVisit(JsiDrawingContext *context) override {
    for (auto &prop: _properties) {
      prop->beginVisit(context);
    }
    
    if (isChanged()) {
      updateDerivedValue();
    }
  }
  
  /*
   Ends the visit cycle
   */
  void endVisit() override {
    for (auto &prop: _properties) {
      prop->endVisit();
    }
  }
  
  /**
   Delegate read value to child nodes
   */
  virtual void readValueFromJs (jsi::Runtime &runtime, const ReadPropFunc& read) override {
    for (auto &prop: _properties) {
      prop->readValueFromJs(runtime, read);
    }
    
    onValueRead();
  }
  
  /**
   Override to calculate the derived value from child properties
   */
  virtual void updateDerivedValue() = 0;
  
  /**
   Adds a property to the derived property child props.
   */
  template <typename P = BaseNodeProp>
  std::shared_ptr<P> addProperty(std::shared_ptr<P> prop) {
    _properties.push_back(prop);
    return prop;
  }
  
private:
  std::vector<std::shared_ptr<BaseNodeProp>> _properties;
};

/**
 Class for composing multiple properties into a derived property value
 */
template <typename T>
class DerivedProp: public BaseDerivedProp {
public:
  DerivedProp(): BaseDerivedProp() {}
  
  /**
  Returns the derived value
   */
  std::shared_ptr<T> getDerivedValue() { return _derivedValue; }
  
  /**
   Returns true if is optional and one of the child props has a value, or all props if optional is false.
   */
  bool hasValue() override {
    return _derivedValue != nullptr;
  };
  
protected:
  
  /**
   Set derived value from sub classes
   */
  void setDerivedValue(std::shared_ptr<T> value) {
    _derivedValue = value;
  }
  
  /**
   Set derived value from sub classes
   */
  void setDerivedValue(const T&& value) {
    _derivedValue = std::make_shared<T>(std::move(value));
  }
    
private:
  std::shared_ptr<T> _derivedValue;
};

}
