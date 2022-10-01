#pragma once

#include "JsiProp.h"
#include "PointProp.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPoint.h>

#pragma clang diagnostic pop

namespace RNSkia {

static PropId PropNameCx = JsiPropId::get("cx");
static PropId PropNameCy = JsiPropId::get("cy");
static PropId PropNameC = JsiPropId::get("c");

class CircleProp:
public JsiDerivedProp<SkPoint> {
public:
  CircleProp(): JsiDerivedProp<SkPoint>() {
    _c = addChildProp(std::make_shared<PointProp>(PropNameC));
    _cx = addChildProp(std::make_shared<JsiProp>(PropNameCx, PropType::Number));
    _cy = addChildProp(std::make_shared<JsiProp>(PropNameCy, PropType::Number));
  }
  
  void updateDerivedValue(JsiDomNodeProps* props) override {
    if (_c->hasValue()) {
      setDerivedValue(_c->getDerivedValue());
    } else if (_cx->hasValue() && _cy->hasValue()) {
      setDerivedValue(SkPoint::Make(_cx->getPropValue()->getAsNumber(),
                                    _cy->getPropValue()->getAsNumber()));
    }
  }
  
private:
  std::shared_ptr<PointProp> _c;
  std::shared_ptr<JsiProp> _cx;
  std::shared_ptr<JsiProp> _cy;
};

}
