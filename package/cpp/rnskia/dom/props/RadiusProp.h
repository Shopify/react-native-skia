#pragma once

#include "NodeProp.h"
#include "PointProp.h"

#include <memory>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPoint.h>

#pragma clang diagnostic pop

namespace RNSkia {

class RadiusProp : public DerivedProp<SkPoint> {
public:
  explicit RadiusProp(PropId name) : DerivedProp<SkPoint>() {
    _pointProp = addProperty(std::make_shared<PointProp>(name));
    _radiusProp = addProperty(std::make_shared<NodeProp>(name));
  }

  void updateDerivedValue() override {
    if (_pointProp->isSet()) {
      setDerivedValue(_pointProp->getDerivedValue());
      return;
    }

    if (_radiusProp->isSet()) {
      setDerivedValue(SkPoint::Make(_radiusProp->value().getAsNumber(),
                                    _radiusProp->value().getAsNumber()));
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  PointProp *_pointProp;
  NodeProp *_radiusProp;
};

} // namespace RNSkia
