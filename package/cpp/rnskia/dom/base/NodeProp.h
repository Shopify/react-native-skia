#pragma once

#include "BaseNodeProp.h"
#include "JsiValue.h"

#include <chrono>

namespace RNSkia {

/**
 Simple class for reading a property by name from the Dom Node properties object.
 */
class NodeProp: public BaseNodeProp, public std::enable_shared_from_this<NodeProp> {
public:
  /**
   Constructs a new optional dom node properrty
   */
  NodeProp(PropId name): _name(name), BaseNodeProp() {}

  /**
   Reads JS value and swaps out with a new value
   */
  virtual void readValueFromJs (jsi::Runtime &runtime, const ReadPropFunc& read) override {
    // Always use the next field since this method is called on the JS thread and
    // we don't want to rip out the underlying value object.
    _valueA = std::make_shared<JsiValue>(runtime, read(runtime, _name, this));
    _valueB = std::make_shared<JsiValue>(runtime);
    _timestampA = std::chrono::duration_cast<std::chrono::milliseconds>
      (std::chrono::system_clock::now().time_since_epoch()).count();
    _timestampB = 0;
    _isChanged = true;
  }
  
  /**
   Property value has changed - let's save this as a change to be commited later
   */
  void updateValue(jsi::Runtime &runtime, const jsi::Value& value) {
    if (_timestampA > _timestampB) {
      _valueB->setCurrent(runtime, value);
      _timestampB = std::chrono::duration_cast<std::chrono::milliseconds>
        (std::chrono::system_clock::now().time_since_epoch()).count();
    } else {
      _valueA->setCurrent(runtime, value);
      _timestampA = std::chrono::duration_cast<std::chrono::milliseconds>
        (std::chrono::system_clock::now().time_since_epoch()).count();
    }
    _isChanged = true;
  }
  
  /**
   Returns true if the property is set and is not undefined or null
   */
  bool isSet() override {
    return getCurrentValue() != nullptr && !getCurrentValue()->isUndefinedOrNull();
  }
  
  /**
   True if the property has changed since we last visited it
   */
  bool isChanged() override {
    return _isChanged;
  }
  
  /**
   Starts the process of updating and reading props
   */
  void updatePendingValues() override {
    // We don't need to do anything here - since
    // pending changes is taken care of by the timestamp
    // and double buffered values.
  }
  
  /*
   Ends the visit cycle
   */
  void markAsResolved() override {
    _isChanged = false;
  }
  
  /**
   Return value if set
   */
  virtual std::shared_ptr<JsiValue> value() {
    assert(isSet());
    return getCurrentValue() == _valueA.get() ? _valueA : _valueB;
  }
  
  /**
   Returns the name of the property
   */
  std::string getName() override { return std::string(_name); }
  
private:
  
  JsiValue* getCurrentValue() {
    if (_timestampA > _timestampB) {
      return _valueA.get();
    } else {
      return _valueB.get();
    }
  }
  
  PropId _name;
  std::atomic<bool> _isChanged = { false };
  
  std::shared_ptr<JsiValue> _valueA;
  std::atomic<uint64_t> _timestampA;
  
  std::shared_ptr<JsiValue> _valueB;
  std::atomic<uint64_t> _timestampB;
  
};

}
