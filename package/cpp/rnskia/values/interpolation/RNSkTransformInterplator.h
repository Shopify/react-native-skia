#pragma once

#include <memory>
#include <vector>

#include "JsiSkMatrix.h"

#include "RNSkBaseInterpolator.h"
#include "RNSkTransformConverter.h"

namespace RNSkia {

/**
 Implements an interpolator for transforms based on matrices
 */
class RNSkTransformInterpolator : public RNSkBaseInterpolator {
public:
  /**
   Constructor
   */
  RNSkTransformInterpolator(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      RNSkInterpolatorConfig config)
      : RNSkBaseInterpolator(platformContext, config) {
    _outputs.resize(config.outputs.size());
    for (size_t i = 0; i < config.outputs.size(); ++i) {
      _outputs[i] = std::move(config.outputs[i].getAsArray());
    }
  }

protected:
  /**
   Interpolator function
   */
  void interpolateRange(double current, size_t index, double inputMin,
                        double inputMax, JsiValue &output) override {

    auto start = _outputs[index];
    auto end = _outputs[index + 1];

    // Prepare the cached output if it has not been done yet
    if (output.getType() != PropType::Array) {

      // Set aside some space for the output value
      std::vector<JsiValue> values;
      values.resize(start.size());

      for (size_t i = 0; i < start.size(); ++i) {
        auto keys = start[i].getKeys();
        if (keys.size() == 0) {
          throw std::runtime_error(
              "Empty value in transform. Expected translateX, translateY, "
              "scale, "
              "scaleX, scaleY, skewX, skewY, rotate or rotateZ.");
        }

        auto key = keys.at(0);
        auto value = start[i].getValue(key);
        values[i].setValue(key, value);
      }
      output.setArray(values);
    }

    if (start.size() != end.size()) {
      throw std::runtime_error(
          "Could not interpolate transform properties, start/end transform "
          "values are not equal in size.");
    }

    auto outputArray = &output.getAsArray();

    for (size_t i = 0; i < start.size(); ++i) {
      auto curStart = start[i];
      auto curEnd = end[i];

      auto keys = curStart.getKeys();
      if (keys.size() == 0) {
        throw std::runtime_error(
            "Empty value in transform. Expected translateX, translateY, "
            "scale, "
            "scaleX, scaleY, skewX, skewY, rotate or rotateZ.");
      }

      // TODO: Ensure equality in keys between start / end

      auto key = keys.at(0);

      auto startValue = curStart.getValue(key).getAsNumber();
      auto endValue = curEnd.getValue(key).getAsNumber();
      double nextValue =
          interpolate(current, inputMin, inputMax, startValue, endValue);

      outputArray->at(i).setValue(key, nextValue);
    }
  };

private:
  std::vector<std::vector<JsiValue>> _outputs;
};
} // namespace RNSkia
