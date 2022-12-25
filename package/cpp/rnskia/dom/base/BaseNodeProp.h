#pragma once

#include "DrawingContext.h"
#include "JsiValue.h"

#include <string>

namespace RNSkia {

class NodeProp;

using namespace RNJsi; // NOLINT

using ReadPropFunc =
    std::function<jsi::Value(jsi::Runtime &, PropId, NodeProp *prop)>;

class BaseNodeProp;

using PropertyDidUpdateCallback = const std::function<void(BaseNodeProp *prop)>;

/**
 Base class for Dom Node Properties
 */
class BaseNodeProp : public std::enable_shared_from_this<BaseNodeProp> {
public:
  /**
   Default ctor
   */
  explicit BaseNodeProp(PropertyDidUpdateCallback &propertyDidUpdate)
      : _propertyDidUpdate(propertyDidUpdate) {}

  /**
   Base destructor
   */
  virtual ~BaseNodeProp() {}

  /**
   Use to check if the value represented by this property has a usable
   (non-null/undefined) value or not.
   */
  virtual bool isSet() = 0;

  /**
   True if the property has changed since we last visited it
   */
  virtual bool isChanged() = 0;

  /**
   Updates any pending values that has happened from other threads, sets flags
   for changed.
   */
  virtual void updatePendingChanges() = 0;

  /*
   Marks property flags for changed as resolved
   */
  virtual void markAsResolved() = 0;

  /**
   Override to read the value represented by this property from the Javascript
   property object
   */
  virtual void readValue(jsi::Runtime &runtime, const ReadPropFunc &read) = 0;

  /**
   Returns the name (or names) in a property
   */
  virtual std::string getName() = 0;

  /**
   Sets the property as required
   */
  void require() { _isRequired = true; }

  /**
   Returns true for required props
   */
  bool isRequired() { return _isRequired; }

protected:
  /*
   Notifies that the property did change
   */
  void callPropertyDidUpdate() {
    if (_propertyDidUpdate != nullptr) {
      _propertyDidUpdate(this);
    } else {
      auto name = getName();
      throw std::runtime_error("Missing propertyDidUpdate for prop " +
                               getName() + ".");
    }
  }

  const PropertyDidUpdateCallback _propertyDidUpdate;

private:
  bool _isRequired = false;
};

} // namespace RNSkia
