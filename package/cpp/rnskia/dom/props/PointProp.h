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
static SkPoint EmptyPoint = SkPoint::Make(-1, -1);

class PointProp:
public DerivedProp<SkPoint> {
public:
  PointProp(PropId name): DerivedProp<SkPoint>() {
    _pointProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    auto point = processProperty(_pointProp);
    if (EmptyPoint != point) {
      setDerivedValue(std::move(point));
    } else {
      setDerivedValue(nullptr);
    }
  }
  
  static SkPoint processValue(std::shared_ptr<JsiValue> value) {
    if (value->getType() == PropType::HostObject) {
      // Try reading as point
      auto ptr = std::dynamic_pointer_cast<JsiSkPoint>(value->getAsHostObject());
      if (ptr != nullptr) {
        return SkPoint::Make(ptr->getObject()->x(), ptr->getObject()->y());
      } else {
        // Try reading as rect
        auto ptr = std::dynamic_pointer_cast<JsiSkRect>(value->getAsHostObject());
        if (ptr != nullptr) {
          return SkPoint::Make(ptr->getObject()->x(), ptr->getObject()->y());
        }
      }
    } else if (value->getType() == PropType::Object) {
      auto x = value->getValue(PropNameX);
      auto y = value->getValue(PropNameY);
      if (x != nullptr && y != nullptr) {
        return SkPoint::Make(x->getAsNumber(), y->getAsNumber());
      }
    }
    return EmptyPoint;
  }
  
  static SkPoint processProperty(NodeProp* prop) {
    if (prop->isSet()) {
      // Check for JsiSkRect and JsiSkPoint
      return processValue(prop->value());
    }
    return EmptyPoint;
  }
  
private:
  NodeProp* _pointProp;
};

}
