#pragma once

#include "DrawingContext.h"
#include "JsiValue.h"

namespace RNSkia {

class NodeProp;

using ReadPropFunc = std::function<jsi::Value(jsi::Runtime&, PropId, NodeProp* prop)>;

/**
 Base class for Dom Node Properties
 */
class BaseNodeProp {
public:
  virtual ~BaseNodeProp() {}
  
  /**
   Use to check if the value represented by this property has a usable (non-null/undefined) value or not.
   */
  virtual bool isSet() = 0;
  
  /**
   True if the property has changed since we last visited it
   */
  virtual bool isChanged() = 0;
  
  /**
   Starts the process of updating and reading props
   */
  virtual void beginVisit(DrawingContext *context) = 0;
  
  /*
   Ends the visit cycle
   */
  virtual void endVisit() = 0;
  
  /**
   Override to read the value represented by this property from the Javascript property object
   */
  virtual void readValueFromJs (jsi::Runtime &runtime, const ReadPropFunc& read) = 0;
  
  /**
   Returns the name (or names) in a property
   */
  virtual std::string getName() = 0;
  
  /**
   Sets the property as required
   */
  void require() {
    _isRequired = true;
  }
  
  /**
   Sets the property as optional
   */
  void optional() {
    _isRequired = false;
  }
  
  /**
   Returns true for required props
   */
  bool isRequired() {
    return _isRequired;
  }
  
private:
  bool _isRequired = false;
};

}
