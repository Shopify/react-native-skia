#pragma once

#include "NodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPoint.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameX = JsiPropId::get("x");
static PropId PropNameY = JsiPropId::get("y");

class PointProp:
public JsiDerivedProp<SkPoint> {
public:
  PointProp(PropId name): JsiDerivedProp<SkPoint>() {
    _prop = addChildProp(std::make_shared<JsiObjectProp>(name));
  }
  
  void updateDerivedValue(NodePropsContainer* props) override {
    if (_prop->hasValue() && props->getHasPropChanges(_prop->getName())) {
      // Check for JsiSkRect and JsiSkPoint
      if (_prop->getPropValue()->getType() == PropType::HostObject) {
        // Try reading as point
        auto pointPtr = std::dynamic_pointer_cast<JsiSkPoint>(_prop->getPropValue()->getAsHostObject());
        if (pointPtr != nullptr) {
          setDerivedValue(SkPoint::Make(pointPtr->getObject()->x(), pointPtr->getObject()->y()));
        } else {
          // Try reading as rect
          auto rectPtr = std::dynamic_pointer_cast<JsiSkRect>(_prop->getPropValue()->getAsHostObject());
          if (rectPtr == nullptr) {
            throw std::runtime_error("Could not read point from unknown host object type.");
          }
          setDerivedValue(SkPoint::Make(rectPtr->getObject()->x(), rectPtr->getObject()->y()));
        }
      } else if (_prop->getPropValue()->getType() == PropType::Object) {
        setDerivedValue(SkPoint::Make(_x->getAsNumber(), _y->getAsNumber()));
      }
    }    
  }
  
  void setProps(jsi::Runtime &runtime, NodePropsContainer* props) override {
    JsiDerivedProp::setProps(runtime, props);
    
    if (_prop->hasValue()) {
      if (_prop->getPropValue()->getType() == PropType::Object) {
        // Save props for fast access
        _x = _prop->getPropValue()->getValue(PropNameX);
        _y = _prop->getPropValue()->getValue(PropNameY);
      }
    }
  }
  
private:
  std::shared_ptr<JsiObjectProp> _prop;
  std::shared_ptr<JsiValue> _x;
  std::shared_ptr<JsiValue> _y;
};

}
