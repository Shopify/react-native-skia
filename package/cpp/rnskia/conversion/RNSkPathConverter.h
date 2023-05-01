#pragma once

#include <memory>

#include "JsiSkPath.h"

namespace RNSkia {

/**
 Implements a converter class that converts to numeric values
 */
class RNSkPathConverter {
public:
  /**
   Converter
   */
  static std::shared_ptr<JsiSkPath> convert(const JsiValue &input) {
    auto obj = input.getAsHostObject();
    auto jsiPath = std::dynamic_pointer_cast<JsiSkPath>(obj);
    if (jsiPath == nullptr) {
      throw std::runtime_error("Could not convert object to a valid SkPath.");
    }
    return jsiPath;
  }

  /**
   Returns true if this interpolator can interpolate this value type
   */
  static bool isConvertable(const JsiValue &value) {
    return value.getType() == PropType::HostObject &&
           std::dynamic_pointer_cast<JsiSkPath>(value.getAsHostObject()) !=
               nullptr;
  }
};
} // namespace RNSkia
