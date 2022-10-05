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
   Starts the process of updating and reading props
   */
  void beginVisit(JsiDrawingContext *context) override {
    auto changed = false;
    for (auto &prop: _properties) {
      prop->beginVisit(context);
      if (prop->isChanged()) {
        changed = true;
      }
    }
    
    // We only need to update the derived value when any of the derived properties have changed.
    if (changed) {
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
    
    _isChanged = false;
  }
  
  /**
   Returns the changed state of the prop
   */
  bool isChanged() override { return _isChanged; }
  
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
  
protected:
  void setIsChanged(bool isChanged) {
    _isChanged = isChanged;
  }
  
private:
  std::vector<std::shared_ptr<BaseNodeProp>> _properties;
  std::atomic<bool> _isChanged = { false };
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
    setIsChanged(_derivedValue != value);
    _derivedValue = value;
  }
  
  /**
   Set derived value from sub classes
   */
  void setDerivedValue(const T&& value) {
    setIsChanged(true);
    _derivedValue = std::make_shared<T>(std::move(value));
  }
    
private:
  std::shared_ptr<T> _derivedValue;
};

}
