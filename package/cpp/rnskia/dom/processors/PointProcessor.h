
#pragma once

#include "JsiDomNode.h"

namespace RNSkia {

static std::string PropNameX = "x";
static std::string PropNameY = "y";

class PointProcessor {
public:
  /**
   Processes properties representing a point from a given property. The property can be a JS wrapped
   SkPoint or a JS object representing a point.
   */
  static SkPoint processPoint(std::shared_ptr<JsiValue> prop) {
    if (prop->getType() == JsiValue::PropType::HostObject) {
      
      auto ptr = std::dynamic_pointer_cast<JsiSkPoint>(prop->getAsHostObject());
      if (ptr == nullptr) {
        // It is allowed to pass a rect as well
        auto rect = std::dynamic_pointer_cast<JsiSkRect>(prop->getAsHostObject());
        if (rect != nullptr) {
          return SkPoint::Make(rect->getObject()->x(), rect->getObject()->y());
        } else {
          throw std::runtime_error("Expected point or rect, got unknown type.");
        }
      }
      return *ptr->getObject();
      
    } else {
      if (prop->hasValue(PropNameX) && prop->hasValue(PropNameY)) {
        return SkPoint::Make(prop->getValue(PropNameX)->getAsNumber(),
                             prop->getValue(PropNameY)->getAsNumber());
      }
      throw std::runtime_error("Missing one or more point properties, expected x and y.");
    }
  }
  
  /**
   Processes a point from a properties object
   */
  static SkPoint processPoint(std::shared_ptr<JsiDomNodeProps> props) {
    if (props->hasValue(PropNameX) && props->hasValue(PropNameY)) {
      return SkPoint::Make(props->getValue(PropNameX)->getAsNumber(),
                           props->getValue(PropNameY)->getAsNumber());
    }
    throw std::runtime_error("Missing one or more point properties, expected x and y.");
  }
};

}
