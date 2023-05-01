#pragma once

#include <memory>
#include <vector>

#include "RNSkBaseInterpolator.h"

namespace RNSkia {

/**
 Implements a base clock value class
 */
class RNSkNumericInterpolator : public RNSkBaseInterpolator {
public:
  /**
   Constructor
   */
  RNSkNumericInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                          RNSkInterpolatorConfig config)
      : RNSkBaseInterpolator(platformContext, config) {
    _outputs.resize(config.outputs.size());
    for (size_t i = 0; i < config.outputs.size(); ++i) {
      _outputs[i] = config.outputs[i].getAsNumber();
    }
  }

protected:
  /**
   Interpolator function
   */
  void interpolateRange(double current, size_t index, double inputMin,
                        double inputMax, JsiValue &output) override {
    output.setNumber(interpolate(current, inputMin, inputMax, _outputs[index],
                                 _outputs[index + 1]));
  };

private:
  std::vector<double> _outputs;
};
} // namespace RNSkia
