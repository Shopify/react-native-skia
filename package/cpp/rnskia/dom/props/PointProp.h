#pragma once

#include "DerivedNodeProp.h"
#include "JsiSkPoint.h"

#include "RNSkPointConverter.h"
#include <memory>
#include <utility>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkPoint.h"

#pragma clang diagnostic pop

namespace RNSkia {

class PointProp : public DerivedProp<SkPoint> {
public:
  explicit PointProp(PropId name,
                     const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<SkPoint>(onChange) {
    _pointProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_pointProp->isSet()) {
      // Check for JsiSkRect and JsiSkPoint
      setDerivedValue(RNSkPointConverter::convert(_pointProp->value()));
    } else {
      setDerivedValue(nullptr);
    }
  }

private:
  NodeProp *_pointProp;
};

} // namespace RNSkia
