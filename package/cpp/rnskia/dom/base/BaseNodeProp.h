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
  virtual bool hasValue() = 0;
  
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
   Called when value was read
   */
  virtual void onValueRead() {}
  
};

}
