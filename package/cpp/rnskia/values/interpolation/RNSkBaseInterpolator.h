#pragma once

#include <memory>
#include <vector>

#include "JsiValue.h"
#include "RNSkPlatformContext.h"

namespace RNSkia {

/*
 The API looks like this:

 interpolate([0, 1], [start, end]);
 interpolate([0, 0.5, 1], [start, start*0.5, end]);

 We can also add clamping information like this:
 TODO

 */
struct RNSkInterpolatorConfig {
  std::vector<double> inputs;
  std::vector<JsiValue> outputs;
};

/**
 Implements a base interpolator class
 */
class RNSkBaseInterpolator {
public:
  /**
   Constructor
   */
  RNSkBaseInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                       RNSkInterpolatorConfig config)
      : _config(config), _platformContext(platformContext) {}

  ~RNSkBaseInterpolator() { printf("RNSkBaseInterpolator DTOR\n"); }

  /**
   Computes the interpolated value from the inputs, outputs and the current
   passed in to the function
   */
  JsiValue &interpolate(double current) {
    size_t index = getIndexOfNearestValue(current);

    auto inputMin = _config.inputs[index];
    auto inputMax = _config.inputs[index + 1];

    interpolateRange(current, index, inputMin, inputMax, _value);
    return _value;
  }

protected:
  /**
   Performs the compute on a correcly (based on config) clamping
   */
  virtual void interpolateRange(double current, size_t index, double inputMin,
                                double inputMax, JsiValue &output) = 0;

  /**
   Interpolates the values start / end on the scale of value
   */
  double interpolate(double value, double inputMin, double inputMax,
                     double outputMin, double outputMax) {
    return outputMin +
           (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin);
  }

  /**
   Returns the config for the interpolator
   */
  const RNSkInterpolatorConfig &getConfig() { return _config; }

  /**
   Returns the platform conrtext
   */
  std::shared_ptr<RNSkPlatformContext> getPlatformContext() {
    return _platformContext;
  }

private:
  /**
   Returns the index in the input/output we're at given the input value
   */
  size_t getIndexOfNearestValue(double value) {
    size_t index;
    for (index = 1; index < _config.inputs.size() - 1; index++) {
      if (_config.inputs[index] >= value) {
        break;
      }
    }
    return index - 1;
  }

  JsiValue _value;
  RNSkInterpolatorConfig _config;
  std::shared_ptr<RNSkPlatformContext> _platformContext;
};
} // namespace RNSkia
