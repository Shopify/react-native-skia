#pragma once

#include "BaseNodeProp.h"
#include "JsiValue.h"

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
    _value = std::make_shared<JsiValue>(runtime, read(runtime, _name, this));
    _isChanged = true;
    // Reset to avoid async update of the underlying value
    _hasNextValue = false;
  }
  
  /**
   Property value has changed - let's save this as a change to be commited later
   */
  void updateValue(jsi::Runtime &runtime, const jsi::Value& value) {
    std::lock_guard<std::mutex> lock(_swapValuesMutex);
    if (_nextValue == nullptr) {
      _nextValue = std::make_shared<JsiValue>(runtime, value);
    } else {
      _nextValue->setCurrent(runtime, value);
    }
    // Set both flags - hasNextValue is only reset when we
    // swap and read next value, while _isChanged is reset
    // on every render / visit cycle.
    _hasNextValue = true;
    _isChanged = true;
  }
  
  /**
   Returns true if the property is set and is not undefined or null
   */
  bool isSet() override {
    return _value != nullptr && !_value->isUndefinedOrNull();
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
  void updatePendingValues(DrawingContext *context) override {
    std::lock_guard<std::mutex> lock(_swapValuesMutex);
    // Swap values - only when there are changes!
    if (_hasNextValue && _nextValue != nullptr) {
      auto tmp = _value;
      _value = _nextValue;
      _nextValue = tmp;
      _hasNextValue = false;
    }
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
    return _value;
  }
  
  /**
   Returns the name of the property
   */
  std::string getName() override { return std::string(_name); }
  
private:
  PropId _name;
  std::atomic<bool> _isChanged = { false };
  std::shared_ptr<JsiValue> _value;
  std::shared_ptr<JsiValue> _nextValue;
  std::mutex _swapValuesMutex;
  std::atomic<bool> _hasNextValue = { false };
};

}
