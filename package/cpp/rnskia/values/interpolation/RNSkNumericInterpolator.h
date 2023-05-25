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
      : RNSkBaseInterpolator(platformContext, config) {}

  /**
   Constructor from jsi values
   */
  RNSkNumericInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                          jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolator(platformContext, runtime, maybeConfig) {}

protected:
  /**
   Interpolator function
   */
  void interpolateRange(double current, size_t index, double inputMin,
                        double inputMax, JsiValue &output) override {
    output.setNumber(interpolate(current, inputMin, inputMax, _outputs[index],
                                 _outputs[index + 1]));
  };

  void readFromConfig(const RNSkInterpolatorConfig &config) override {
    _outputs.resize(config.outputs.size());
    for (size_t i = 0; i < config.outputs.size(); ++i) {
      _outputs[i] = config.outputs[i].getAsNumber();
    }
  }

private:
  std::vector<double> _outputs;
};
} // namespace RNSkia
