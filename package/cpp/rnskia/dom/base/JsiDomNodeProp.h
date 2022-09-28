#pragma once

#include "JsiValue.h"
#include "JsiDomNodeProps.h"

#include <initializer_list>

namespace RNSkia {

/**
 Base class for Dom Node Properties
 */
class JsiBaseDomNodeProp{
public:
  /**
   Called when any of the property values have changed by React updating properties. This is where we'll try to read property
   values and store the property objects.
   @param runtime Javascript Runtime
   @param props Properties object
   */
  virtual void setProps(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) = 0;
  
  /**
   Called when any of the property values have changed from the native side by Skia values being updated.
   @param props Properties object
   */
  virtual void updatePropValues(std::shared_ptr<JsiDomNodeProps> props) = 0;
  
  /**
   Use to check if the value represented by this property has a usable (non-null/undefined) value or not.
   */
  virtual bool hasValue() = 0;
};

/**
 Simple class for reading a property by name from the Dom Node properties object.
 */
class JsiDomNodeProp: public JsiBaseDomNodeProp {
public:
  /**
   Constructs a new optional dom node properrty
   */
  JsiDomNodeProp(PropId name, PropType type):
  _name(name), _type(type) {}
  
  /**
   Returns true if the property is set and is not undefined or null
   */
  bool hasValue() override {
    return _prop != nullptr && !_prop->isUndefinedOrNull();
  }
  
  /**
   Called when properties was read from the React props. This is where we read props and validate properties
   */
  virtual void setProps(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) override {
    _prop = props->tryReadProperty(runtime, _name, _type);
  }
  
  /**
   Called when properties changed from the native side (and also after the first initialization in setProps).
   */
  virtual void updatePropValues(std::shared_ptr<JsiDomNodeProps> props) override {}
  
  /**
   Return value if set
   */
  virtual std::shared_ptr<JsiValue> getPropValue() {
    assert(hasValue());
    return _prop;
  }
  
  /**
   Returns the name of the property
   */
  PropId getName() {
    return _name;
  }
  
protected:
  void setValue(std::shared_ptr<JsiValue> prop) {
    _prop = prop;
  }
private:
  PropId _name;
  PropType _type;
  std::shared_ptr<JsiValue> _prop;
};

/**
 Property class for reading either an object or a host object.
 */
class JsiObjectDomNodeProp : public JsiDomNodeProp {
public:
  JsiObjectDomNodeProp(PropId name):
  JsiDomNodeProp(name, PropType::Object) {}
  
  virtual void setProps(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) override {
    try {
      JsiDomNodeProp::setProps(runtime, props);
    } catch (...) {
      setValue(props->tryReadHostObjectProperty(runtime, getName()));
    }
  };
};

/**
 Class for composing multiple properties into a derived property value
 */
template <typename T>
class JsiDerivedDomNodeProp: public JsiBaseDomNodeProp {
public:
  JsiDerivedDomNodeProp() {}
  
  /**
   Override to calculate the derived value from child properties
   */
  virtual void updateDerivedValue(std::shared_ptr<JsiDomNodeProps> props) = 0;
  
  /**
  Returns the derived value
   */
  const T& getDerivedValue() { return _derivedValue; }
  
  void setProps(jsi::Runtime &runtime, std::shared_ptr<JsiDomNodeProps> props) override {
    for(auto &el: _childProps) {
      el->setProps(runtime, props);
    }
  }
  
  void updatePropValues(std::shared_ptr<JsiDomNodeProps> props) override {
    for(auto &el: _childProps) {
      el->updatePropValues(props);
    }
    
    if(props->getHasPropChanges()) {
      updateDerivedValue(props);
    }
  }
  
  /**
   Returns true if is optional and one of the child props has a value, or all props if optional is false.
   */
  bool hasValue() override {
    // Only one needs to be set
    for (auto &el: _childProps) {
      if (el->hasValue()) {
        return true;
      }
    }
    return false;
  };
  
  /**
   Adds a property to the derived property child props.
   */
  template <typename P = JsiBaseDomNodeProp>
  std::shared_ptr<P> addChildProp(std::shared_ptr<P> prop) {
    _childProps.push_back(prop);
    return prop;
  }
  
protected:
  
  void setDerivedValue(const T& value) {
    _derivedValue = value;
  }
  
private:
  T _derivedValue;
  std::vector<std::shared_ptr<JsiBaseDomNodeProp>> _childProps;
};

}
