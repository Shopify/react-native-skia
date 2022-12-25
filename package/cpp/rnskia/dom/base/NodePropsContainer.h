#pragma once

#include "BaseNodeProp.h"
#include "DrawingContext.h"
#include "JsiValue.h"

#include <map>
#include <memory>
#include <string>
#include <utility>
#include <vector>

namespace RNSkia {

/**
 This class manages marshalling from JS values over JSI to C++ values and is
 typically called when a new node is created or an existing node is updated from
 the reconciler.
 */
class NodePropsContainer {
public:
  /**
   Constructor. Pass the runtime and the JS object representing the properties,
   and a function that will be called when any property was changed from within
   this class as a result of a Skia value change.
   */
  explicit NodePropsContainer(PropId componentType,
                              PropertyDidUpdateCallback &propertyDidUpdate)
      : _type(componentType), _propertyDidUpdate(propertyDidUpdate) {}

  /**
   Returns true if there are any changes in the props container in the current
   being/end visit
   */
  bool isChanged() {
    for (auto &prop : _properties) {
      if (prop->isChanged()) {
        return true;
      }
    }
    return false;
  }

  /**
   Returns a list of mappings betwen property names and property objects
   */
  const std::map<PropId, std::vector<NodeProp *>> &getMappedProperties() {
    return _mappedProperties;
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
    auto read = [&](jsi::Runtime &runtime, PropId name, NodeProp *prop) {
      if (_mappedProperties.count(name) == 0) {
        std::vector<NodeProp *> tmp;
        _mappedProperties[name] = std::move(tmp);
      }
      _mappedProperties.at(name).push_back(prop);
      return props.getProperty(runtime, name);
    };

    for (auto &prop : _properties) {
      prop->readValue(runtime, read);
    }
  }

  /**
   Defines a property that will be updated with the container changes.
   */
  template <class _Tp, class... _Args,
            class = std::_EnableIf<!std::is_array<_Tp>::value>>
  _Tp *defineProperty(_Args &&...__args) {
    auto prop = std::make_shared<_Tp>(std::forward<_Args>(__args)...,
                                      _propertyDidUpdate);
    _properties.push_back(prop);
    return prop.get();
  }

private:
  std::vector<std::shared_ptr<BaseNodeProp>> _properties;
  std::map<PropId, std::vector<NodeProp *>> _mappedProperties;
  PropertyDidUpdateCallback _propertyDidUpdate;
  PropId _type;
};

} // namespace RNSkia
