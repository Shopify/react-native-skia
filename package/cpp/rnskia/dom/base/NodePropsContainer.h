#pragma once

#include "NodeProp.h"
#include "JsiValue.h"
#include "JsiDrawingContext.h"

#include <map>

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
  const std::map<PropId, std::vector<std::shared_ptr<NodeProp>>>& getMappedProperties() {
    return _mappedProperties;
  }
  
  /**
   Returns the list of properties registered / defined in the container
   */
  std::vector<std::shared_ptr<BaseNodeProp>>& getProperties() {
    return _properties;
  }
  
  /**
   Updates any props that has changes waiting, updates props that have derived values
   */
  void beginVisit(JsiDrawingContext* context) {
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
   Called when the React / JS side sets properties on a node
   */
  void setProps(jsi::Runtime &runtime, jsi::Object &&props) {
    _mappedProperties.clear();
    // Loop through all defined props by name and update the
    // underlying NodeProp object
    auto read = [&](jsi::Runtime &runtime, PropId name, std::shared_ptr<NodeProp> prop) {
      if (_mappedProperties.count(name) == 0) {
        std::vector<std::shared_ptr<NodeProp>> tmp;
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
  template <typename T = NodeProp>
  std::shared_ptr<T> defineProperty(std::shared_ptr<T> property) {
    _properties.push_back(property);
    return property;
  }    
  
private:
  std::vector<std::shared_ptr<BaseNodeProp>> _properties;
  std::map<PropId, std::vector<std::shared_ptr<NodeProp>>> _mappedProperties;
};

}
