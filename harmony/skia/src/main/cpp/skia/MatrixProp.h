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
      if (values.size() == 9) {
        for (size_t i = 0; i < values.size(); ++i) {
          auto a = values[i];
          m3->set(i, a.getAsNumber());
        }
      } else {
        SkM44 m4;
        for (size_t i = 0; i < values.size(); ++i) {
          auto obj = values[i];
          m4.setRC(i / 4, i % 4, obj.getAsNumber());
        }
        auto m = m4.asM33();
        m3->setAll(m.rc(0, 0), m.rc(0, 1), m.rc(0, 2), m.rc(1, 0), m.rc(1, 1),
                   m.rc(1, 2), m.rc(2, 0), m.rc(2, 1), m.rc(2, 2));
      }
      setDerivedValue(m3);
    }
  }

private:
  NodeProp *_matrixProp;
};

} // namespace RNSkia
