#pragma once

#include <memory>
#include <string>
#include <vector>

#include "JsiValue.h"
#include "RNSkPlatformContext.h"

namespace RNSkia {

static const char *EXTRAPOLATE_IDENTITY = "identity";
static const char *EXTRAPOLATE_CLAMP = "clamp";
static const char *EXTRAPOLATE_EXTEND = "extend";

/*
 The API looks like this:

 interpolate([0, 1], [start, end]);
 interpolate([0, 0.5, 1], [start, start*0.5, end]);

 We can also add clamping information like this:
 interpolate([0, 0.5, 1], [start, start*0.5, end], "clamp");

 */
struct RNSkInterpolatorConfig {
  std::vector<double> inputs;
  std::vector<JsiValue> outputs;
  std::string extrapolateLeft;
  std::string extrapolateRight;
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

  /**
   Constructor from jsi values
   */
  RNSkBaseInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                       jsi::Runtime &runtime, const jsi::Value &maybeConfig) {
    // Read parameters from Javascript
    if (!maybeConfig.isObject()) {
      throw std::runtime_error("Expected a config object as the first "
                               "parameter for an interpolator value.");
    }

    auto configObject = maybeConfig.asObject(runtime);

    // Create configuration
    std::vector<double> inputs;
    std::vector<JsiValue> outputs;

    auto inputsArray =
        configObject.getPropertyAsObject(runtime, "inputs").asArray(runtime);
    auto outputsArray =
        configObject.getPropertyAsObject(runtime, "outputs").asArray(runtime);

    // Resize and set numbers from input
    inputs.resize(inputsArray.size(runtime));
    for (size_t i = 0; i < inputs.size(); ++i) {
      inputs[i] = inputsArray.getValueAtIndex(runtime, i).asNumber();
    }

    // Reserve on outputs since we're constructing JsiValues here
    outputs.reserve(outputsArray.size(runtime));
    for (size_t i = 0; i < inputs.size(); ++i) {
      outputs.emplace_back(runtime, outputsArray.getValueAtIndex(runtime, i));
    }

    // Clamping
    auto extrapolateLeftProp =
        configObject.getProperty(runtime, "extrapolateLeft");
    std::string extrapolateLeft = "extend";
    if (extrapolateLeftProp.isString()) {
      extrapolateLeft = extrapolateLeftProp.asString(runtime).utf8(runtime);
    }

    auto extrapolateRightProp =
        configObject.getProperty(runtime, "extrapolateRight");
    std::string extrapolateRight = "extend";
    if (extrapolateRightProp.isString()) {
      extrapolateRight = extrapolateRightProp.asString(runtime).utf8(runtime);
    }

    // Create config
    _config = {inputs, outputs, extrapolateLeft, extrapolateRight};
  }

  virtual ~RNSkBaseInterpolator() { printf("RNSkBaseInterpolator DTOR\n"); }

  /**
   Computes the interpolated value from the inputs, outputs and the current
   passed in to the function
   */
  JsiValue &interpolate(double current) {
    if (!_isInitialized) {
      _isInitialized = true;
      readFromConfig(_config);
    }

    size_t index = getIndexOfNearestValue(current);

    auto inputMin = _config.inputs[index];
    auto inputMax = _config.inputs[index + 1];

    if (current < inputMin) {
      if (_config.extrapolateLeft == EXTRAPOLATE_IDENTITY) {
        _value.setCurrent(current);
        return _value;
      } else if (_config.extrapolateLeft == EXTRAPOLATE_CLAMP) {
        current = inputMin;
      } else if (_config.extrapolateLeft == EXTRAPOLATE_EXTEND) {
        // noop
      }
    }

    if (current > inputMax) {
      if (_config.extrapolateRight == EXTRAPOLATE_IDENTITY) {
        _value.setCurrent(current);
        return _value;
      } else if (_config.extrapolateRight == EXTRAPOLATE_CLAMP) {
        current = inputMax;
      } else if (_config.extrapolateRight == EXTRAPOLATE_EXTEND) {
        // noop
      }
    }

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

  /**
   Reads data from configuration
   */
  virtual void readFromConfig(const RNSkInterpolatorConfig &config) = 0;

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
  bool _isInitialized = false;
};
} // namespace RNSkia
