#pragma once

namespace RNSkia {

/**
 Implements a converter class that converts to numeric values
 */
class RNSkNumericConverter {
public:
  /**
   Converter
   */
  static double convert(const JsiValue &input) { return input.getAsNumber(); }

  /**
   Returns true if this interpolator can interpolate this value type
   */
  static bool isConvertable(const JsiValue &value) {
    return value.getType() == PropType::Number;
  }
};
} // namespace RNSkia
