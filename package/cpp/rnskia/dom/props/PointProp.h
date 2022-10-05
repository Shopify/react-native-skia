#pragma once

#include "DerivedNodeProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPoint.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameX = JsiPropId::get("x");
static PropId PropNameY = JsiPropId::get("y");

class PointProp:
public DerivedProp<SkPoint> {
public:
  PointProp(PropId name): DerivedProp<SkPoint>() {
    _pointProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_pointProp->hasValue()) {
      // Check for JsiSkRect and JsiSkPoint
      if (_pointProp->getValue()->getType() == PropType::HostObject) {
        // Try reading as point
        auto ptr = std::dynamic_pointer_cast<JsiSkPoint>(_pointProp->getValue()->getAsHostObject());
        if (ptr != nullptr) {
          setDerivedValue(SkPoint::Make(ptr->getObject()->x(), ptr->getObject()->y()));
        } else {
          // Try reading as rect
          auto ptr = std::dynamic_pointer_cast<JsiSkRect>(_pointProp->getValue()->getAsHostObject());
          if (ptr != nullptr) {
            setDerivedValue(SkPoint::Make(ptr->getObject()->x(), ptr->getObject()->y()));
          }
        }
      } else if (_pointProp->getValue()->getType() == PropType::Object) {
        if (_x != nullptr && _y != nullptr) {
          setDerivedValue(SkPoint::Make(_x->getAsNumber(), _y->getAsNumber()));
        }
      }
    } else {
      setDerivedValue(nullptr);
    }
  }
  
  void onValueRead() override {
    DerivedProp::onValueRead();
    
    if (_pointProp->hasValue()) {
      if (_pointProp->getValue()->getType() == PropType::Object) {
        // Save props for fast access
        _x = _pointProp->getValue()->getValue(PropNameX);
        _y = _pointProp->getValue()->getValue(PropNameY);
      }
    }
  }
  
private:
  std::shared_ptr<NodeProp> _pointProp;
  std::shared_ptr<JsiValue> _x;
  std::shared_ptr<JsiValue> _y;
};

}
