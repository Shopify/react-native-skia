#pragma once

#include "DerivedNodeProp.h"
#include "JsiSkMatrix.h"

#include <memory>

namespace RNSkia {

static PropId PropNameMatrix = JsiPropId::get("matrix");

class MatrixProp : public DerivedProp<SkMatrix> {
public:
  explicit MatrixProp(PropId name,
                      const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<SkMatrix>(onChange) {
    _matrixProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (_matrixProp->isSet() &&
        _matrixProp->value().getType() == PropType::HostObject) {
      // Try reading as SkMatrix
      auto matrix = _matrixProp->value().getAs<JsiSkMatrix>();
      if (matrix != nullptr) {
        setDerivedValue(matrix->getObject());
      }
    } else if (_matrixProp->isSet()) {
      auto values = _matrixProp->value().getAsArray();
      auto m3 = std::make_shared<SkMatrix>();
      for (size_t i = 0; i < values.size(); ++i) {
        auto a = values[i];
        m3->set(i, a.getAsNumber());
      }
      setDerivedValue(m3);
    }
  }

private:
  NodeProp *_matrixProp;
};

} // namespace RNSkia
