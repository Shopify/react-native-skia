#pragma once

#include "DerivedNodeProp.h"

#include <memory>
#include <string>

#include "RNSkTransformConverter.h"

namespace RNSkia {

class TransformProp : public DerivedProp<SkMatrix> {
public:
  explicit TransformProp(PropId name,
                         const std::function<void(BaseNodeProp *)> &onChange)
      : DerivedProp<SkMatrix>(onChange) {
    _transformProp = defineProperty<NodeProp>(name);
  }

  void updateDerivedValue() override {
    if (!_transformProp->isSet()) {
      setDerivedValue(nullptr);
    } else if (_transformProp->value().getType() != PropType::Array) {
      throw std::runtime_error(
          "Expected array for transform property, got " +
          JsiValue::getTypeAsString(_transformProp->value().getType()));
    } else {
      setDerivedValue(RNSkTransformConverter::convert(_transformProp->value()));
    }
  }

private:
  NodeProp *_transformProp;
};

} // namespace RNSkia
