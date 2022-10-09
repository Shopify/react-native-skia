#pragma once

#include "NodeProp.h"
#include "JsiValue.h"
#include "DrawingContext.h"

#include <map>
#include <utility>

namespace RNSkia {

/**
 This class manages marshalling from JS values over JSI to C++ values and is typically called when a new node is
 created or an existing node is updated from the reconciler.
 */
class NodePropsContainer {
public:
  /**
   Constructor. Pass the runtime and the JS object representing the properties, and a function that will be
   called when any property was changed from within this class as a result of a Skia value change.
   */
  NodePropsContainer() {}
  
  ~NodePropsContainer() {}
  
  /**
   Returns true if there are any changes in the props container in the current being/end visit
   */
  bool getHasPropChanges() {
    for (auto &prop: _properties) {
      if (prop->isChanged()) {
        return true;
      }
    }
    return false;
  }
  
  /**
   Returns a list of mappings betwen property names and property objects
   */
  const std::map<PropId, std::vector<NodeProp*>>& getMappedProperties() {
    return _mappedProperties;
  }
  
  /**
   Updates any props that has changes waiting, updates props that have derived values
   */
  void beginVisit(DrawingContext* context) {
    for (auto &prop: _properties) {
      prop->beginVisit(context);
    }
  }
  
  /**
   We're done, mark any changes as committed in all props
   */
  void endVisit() {
    for (auto &prop: _properties) {
      prop->endVisit();
    }
  }
  
  /**
   Clears all props and data from the container
   */
  void dispose() {
    _properties.clear();
    _mappedProperties.clear();
  }
  
  /**
   Called when the React / JS side sets properties on a node
   */
  void setProps(jsi::Runtime &runtime, jsi::Object &&props) {
    // Clear property mapping
    _mappedProperties.clear();
    
    // Use specialized reader function to be able to intercept calls that
    // reads specific named values from the js property object.
    auto read = [&](jsi::Runtime &runtime, PropId name, NodeProp* prop) {
      if (_mappedProperties.count(name) == 0) {
        std::vector<NodeProp*> tmp;
        _mappedProperties[name] = std::move(tmp);
      }
      _mappedProperties.at(name).push_back(prop);
      return props.getProperty(runtime, name);
    };
    
    for (auto &prop: _properties) {
      prop->readValueFromJs(runtime, read);
    }
  }
    
  /**
   Defines a property that will be updated with the container changes.
   */
  template <typename T = BaseNodeProp>
  T* defineProperty(std::shared_ptr<T> prop) {
    _properties.push_back(prop);
    return prop.get();
  }    
  
private:
  std::vector<std::shared_ptr<BaseNodeProp>> _properties;
  std::map<PropId, std::vector<NodeProp*>> _mappedProperties;
};

}
