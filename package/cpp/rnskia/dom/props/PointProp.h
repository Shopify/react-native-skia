#pragma once

#include "DerivedNodeProp.h"
#include "JsiSkPoint.h"

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
    if (_pointProp->isSet()) {
      // Check for JsiSkRect and JsiSkPoint
      if (_pointProp->value()->getType() == PropType::HostObject) {
        // Try reading as point
        auto ptr = std::dynamic_pointer_cast<JsiSkPoint>(_pointProp->value()->getAsHostObject());
        if (ptr != nullptr) {
          setDerivedValue(SkPoint::Make(ptr->getObject()->x(), ptr->getObject()->y()));
        } else {
          // Try reading as rect
          auto ptr = std::dynamic_pointer_cast<JsiSkRect>(_pointProp->value()->getAsHostObject());
          if (ptr != nullptr) {
            setDerivedValue(SkPoint::Make(ptr->getObject()->x(), ptr->getObject()->y()));
          }
        }
      } else if (_pointProp->value()->getType() == PropType::Object) {
        auto x = _pointProp->value()->getValue(PropNameX);
        auto y = _pointProp->value()->getValue(PropNameY);
        if (x != nullptr && y != nullptr) {
          setDerivedValue(SkPoint::Make(x->getAsNumber(), y->getAsNumber()));
        }
      }
    } else {
      setDerivedValue(nullptr);
    }
  }
  
private:
  NodeProp* _pointProp;
};

}
