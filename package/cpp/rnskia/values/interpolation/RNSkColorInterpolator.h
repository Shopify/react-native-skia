#pragma once

#include <memory>
#include <utility>
#include <vector>

#include "RNSkBaseInterpolator.h"
#include "RNSkColorConverter.h"

namespace RNSkia {

/**
 Implements a base clock value class
 */
class RNSkColorInterpolator : public RNSkBaseInterpolator {
public:
  /**
   Constructor
   */
  RNSkColorInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                        RNSkInterpolatorConfig config)
      : RNSkBaseInterpolator(platformContext, config) {
    // Convert outputs from dynamic to SkColor and get the
    // color components as well so that we don't need to
    // do that on each interpolation
    _outputs.resize(config.inputs.size());
    for (size_t i = 0; i < config.inputs.size(); i++) {
      auto output = RNSkColorConverter::convert(config.outputs[i]);
      _outputs[i][0] = SkColorGetA(output);
      _outputs[i][1] = SkColorGetR(output);
      _outputs[i][2] = SkColorGetG(output);
      _outputs[i][3] = SkColorGetB(output);
    }
  }

protected:
  /**
   Interpolator function
   */
  void interpolateRange(double current, size_t index, double inputMin,
                        double inputMax, JsiValue &output) override {

    // Interpolate using cached configuration values
    auto min = _outputs[index];
    auto max = _outputs[index + 1];

    // Perform interpolation on each step
    uint8_t a = interpolate(current, inputMin, inputMax, min[0], max[0]);
    uint8_t r = interpolate(current, inputMin, inputMax, min[1], max[1]);
    uint8_t g = interpolate(current, inputMin, inputMax, min[2], max[2]);
    uint8_t b = interpolate(current, inputMin, inputMax, min[3], max[3]);

    // Update and return value
    output.setNumber(SkColorSetARGB(a, r, g, b));
  };

private:
  // Cache of converted JsiValue's for outputs
  std::vector<std::array<uint8_t, 4>> _outputs;
};
} // namespace RNSkia
