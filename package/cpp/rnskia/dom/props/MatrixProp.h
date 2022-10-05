#pragma once

#include "DerivedNodeProp.h"
#include "JsiSkMatrix.h"

namespace RNSkia {

static PropId PropNameMatrix = JsiPropId::get("matrix");

class MatrixProp:
public DerivedProp<SkMatrix> {
public:
  MatrixProp(PropId name): DerivedProp<SkMatrix>() {
    _matrixProp = addProperty(std::make_shared<NodeProp>(name));
  }
  
  void updateDerivedValue() override {
    if (_matrixProp->hasValue() &&
        _matrixProp->getValue()->getType() == PropType::HostObject) {
      // Try reading as SkMatrix
      auto matrix = std::dynamic_pointer_cast<JsiSkMatrix>(_matrixProp->getValue()->getAsHostObject());
      if (matrix != nullptr) {
        setDerivedValue(matrix->getObject());
      }
    }
  }
  
private:
  std::shared_ptr<NodeProp> _matrixProp;
};

}
