#pragma once

#include <memory>

#include "JsiSkMatrix.h"

namespace RNSkia {

/**
 Implements a converter class that converts to numeric values
 */
class RNSkMatrixConverter {
public:
  /**
   Converter
   */
  static std::shared_ptr<JsiSkMatrix> convert(const JsiValue &input) {
    auto obj = input.getAsHostObject();
    auto jsiMatrix = std::dynamic_pointer_cast<JsiSkMatrix>(obj);
    if (jsiMatrix == nullptr) {
      throw std::runtime_error("Could not convert object to a valid SkMatrix.");
    }
    return jsiMatrix;
  }

  /**
   Returns true if this interpolator can interpolate this value type
   */
  static bool isConvertable(const JsiValue &value) {
    return value.getType() == PropType::HostObject &&
           std::dynamic_pointer_cast<JsiSkMatrix>(value.getAsHostObject()) !=
               nullptr;
  }
};
} // namespace RNSkia
