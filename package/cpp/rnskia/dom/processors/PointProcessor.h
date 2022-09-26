
#pragma once

#include "JsiDomNode.h"

namespace RNSkia {

static PropId PropNameX = JsiPropId::get("x");
static PropId PropNameY = JsiPropId::get("y");

class PointProcessor {
public:
  /**
   Constructs a new point processor that will try to read a point from the provided property name
   */
  PointProcessor(): _propName(nullptr) {}
  
  /**
   Constructs a new point processor that will try to read a point from the provided property name
   */
  PointProcessor(const char* propName): _propName(propName) {}
  
  /**
   Processes properties representing a point from a given property. The property can be a JS wrapped
   SkPoint or a JS object representing a point.
   */
  void process(std::shared_ptr<JsiDomNodeProps> props) {
    if (!hasValue()) {
      return;
    }
    
    if (_hasProp) {
      auto prop = props->getValue(_propName);
      // We have the property and can move on
      if (prop->getType() == PropType::HostObject) {
        // This is a host object that can either be a JsiSkRect or JsiSkPoint class
        auto ptr = std::dynamic_pointer_cast<JsiSkPoint>(prop->getAsHostObject());
        if (ptr == nullptr) {
          // It is allowed to pass a rect as well
          auto rect = std::dynamic_pointer_cast<JsiSkRect>(prop->getAsHostObject());
          if (rect != nullptr) {
            _pointCache = SkPoint::Make(rect->getObject()->x(), rect->getObject()->y());
          } else {
            throw std::runtime_error("Expected point or rect, got unknown type.");
          }
        } else {
          _pointCache = *ptr->getObject();
        }
      } else {
        if (_hasX && _hasY) {
          _pointCache = SkPoint::Make(prop->getValue(PropNameX)->getAsNumber(),
                                      prop->getValue(PropNameY)->getAsNumber());
        } else {
          throw std::runtime_error("Missing one or more point properties, expected x and y.");
        }
      }
    } else {
      if (_hasX && _hasY) {
        _pointCache = SkPoint::Make(props->getValue(PropNameX)->getAsNumber(),
                                    props->getValue(PropNameY)->getAsNumber());
      } else {
        throw std::runtime_error("Missing one or more point properties, expected x and y.");
      }
    }
  }
  
  void onPropsSet(std::shared_ptr<JsiDomNodeProps> props) {
    // check if the property we are interested in exists
    if (props->hasValue(_propName)) {
      _hasProp = true;
      // Now we can check the property value and see if it has the necessary
      // properties
      auto prop = props->getValue(_propName);
      if (prop->getType() == PropType::Object) {
        _hasX = prop->hasValue(PropNameX);
        _hasY = prop->hasValue(PropNameY);
      } else if (prop->getType() == PropType::HostObject) {
        _hasX = true;
        _hasY = true;
      } else {
        _hasX = false;
        _hasY = false;
      }
    } else {
      _hasProp = false;
      _hasX = props->hasValue(PropNameX);
      _hasY = props->hasValue(PropNameY);
    }
  }
  
  const SkPoint& getPoint() {
    return _pointCache;
  }
  
  bool hasValue() {
    return _hasX && _hasY;
  }
  
private:
  SkPoint _pointCache;
  const char* _propName;
  bool _hasProp;
  bool _hasX;
  bool _hasY;
};

}
