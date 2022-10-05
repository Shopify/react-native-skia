#pragma once

#include "NodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPath.h>

#pragma clang diagnostic pop

namespace RNSkia {

class PathProp:
public DerivedProp<SkPath> {
public:
  PathProp(PropId name): DerivedProp<SkPath>() {
    _pathProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (!_pathProp->hasValue()) {
      setDerivedValue(nullptr);
    } else {
      if (_pathProp->getValue()->getType() == PropType::HostObject) {
        // Try reading as Path
        auto ptr = std::dynamic_pointer_cast<JsiSkPath>(_pathProp->getValue()->getAsHostObject());
        if (ptr != nullptr) {
          setDerivedValue(ptr->getObject());
        }
      } else if (_pathProp->getValue()->getType() == PropType::String) {
        // Read as string
        auto pathString = _pathProp->getValue()->getAsString();
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
  std::shared_ptr<NodeProp> _pathProp;
};

}
