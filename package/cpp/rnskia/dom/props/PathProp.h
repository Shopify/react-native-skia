#pragma once

#include "NodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPath.h>

#pragma clang diagnostic pop

namespace RNSkia {

class PathProp:
public JsiDerivedProp<std::shared_ptr<SkPath>> {
public:
  PathProp(PropId name): JsiDerivedProp<std::shared_ptr<SkPath>>() {
    _objectProp = addChildProp(std::make_shared<NodeProp>(name, PropType::HostObject));
    _stringProp = addChildProp(std::make_shared<NodeProp>(name, PropType::String));
  }
  
  void updateDerivedValue(NodePropsContainer* props) override {
    if (props->getHasPropChanges(_objectProp->getName())) {
      if (_objectProp->hasValue()) {
        // Check for JsiSkPath
        if (_objectProp->getPropValue()->getType() == PropType::HostObject) {
          // Try reading as Path
          auto ptr = std::dynamic_pointer_cast<JsiSkPath>(_objectProp->getPropValue()->getAsHostObject());
          if (ptr != nullptr) {
            setDerivedValue(ptr->getObject());
          }
        }
      } else if (_stringProp->hasValue()) {
        // Read as string
        auto pathString = _stringProp->getPropValue()->getAsString();
        SkPath result;
        
        if (SkParsePath::FromSVGString(pathString.c_str(), &result)) {
          setDerivedValue(std::make_shared<SkPath>(result));
        } else {
          throw std::runtime_error("Could not parse path from string.");
        }
      }
    }
  }
  
private:
  std::shared_ptr<NodeProp> _objectProp;
  std::shared_ptr<NodeProp> _stringProp;
};

}
