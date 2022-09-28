#pragma once

#include "JsiDomNodeProp.h"
#include "JsiSkMatrix.h"

namespace RNSkia {

static PropId PropNameMatrix = JsiPropId::get("matrix");

class MatrixProp:
public JsiDerivedDomNodeProp<std::shared_ptr<SkMatrix>> {
public:
  MatrixProp(PropId name): JsiDerivedDomNodeProp<std::shared_ptr<SkMatrix>>() {
    _prop = addChildProp(std::make_shared<JsiObjectDomNodeProp>(name));
  }
  
  void updateDerivedValue(JsiDomNodeProps* props) override {
    if (_prop->hasValue() && props->getHasPropChanges(_prop->getName())) {
      // Try reading as SkMatrix
      auto matrix = std::dynamic_pointer_cast<JsiSkMatrix>(_prop->getPropValue()->getAsHostObject());
      if (matrix != nullptr) {
        setDerivedValue(matrix->getObject());
      }
    }
  }
  
private:
  std::shared_ptr<JsiObjectDomNodeProp> _prop;
};

}
