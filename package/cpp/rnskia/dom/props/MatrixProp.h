#pragma once

#include "NodeProp.h"
#include "JsiSkMatrix.h"

namespace RNSkia {

static PropId PropNameMatrix = JsiPropId::get("matrix");

class MatrixProp:
public JsiDerivedProp<std::shared_ptr<SkMatrix>> {
public:
  MatrixProp(PropId name): JsiDerivedProp<std::shared_ptr<SkMatrix>>() {
    _prop = addChildProp(std::make_shared<JsiObjectProp>(name));
  }
  
  void updateDerivedValue(NodePropsContainer* props) override {
    if (_prop->hasValue() && props->getHasPropChanges(_prop->getName())) {
      // Try reading as SkMatrix
      auto matrix = std::dynamic_pointer_cast<JsiSkMatrix>(_prop->getPropValue()->getAsHostObject());
      if (matrix != nullptr) {
        setDerivedValue(matrix->getObject());
      }
    }
  }
  
private:
  std::shared_ptr<JsiObjectProp> _prop;
};

}
