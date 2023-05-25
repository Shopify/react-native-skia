#pragma once

#include <memory>
#include <utility>
#include <vector>

#include "RNSkBaseInterpolator.h"
#include "RNSkPathConverter.h"

namespace RNSkia {

/**
 Implements a base clock value class
 */
class RNSkPathInterpolator : public RNSkBaseInterpolator {
public:
  /**
   Constructor
   */
  RNSkPathInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                       RNSkInterpolatorConfig config)
      : RNSkBaseInterpolator(platformContext, config) {}

  /**
   Constructor from jsi values
   */
  RNSkPathInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                       jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolator(platformContext, runtime, maybeConfig) {}

protected:
  /**
   Interpolator function
   */
  void interpolateRange(double current, size_t index, double inputMin,
                        double inputMax, JsiValue &output) override {
    if (_jsiPath == nullptr) {
      _jsiPath = std::make_shared<JsiSkPath>(getPlatformContext(), SkPath());
    }

    auto weight = interpolate(current, inputMin, inputMax, 0, 1);

    auto success = _outputs[index]->getObject()->interpolate(
        *_outputs[index + 1]->getObject(), weight, _jsiPath->getObject().get());

    if (!success) {
      throw std::runtime_error("Could not interpolate the provided paths.");
    }

    output.setHostObject(_jsiPath);
  };

  void readFromConfig(const RNSkInterpolatorConfig &config) override {
    _outputs.resize(config.inputs.size());
    for (size_t i = 0; i < config.inputs.size(); i++) {
      _outputs[i] = RNSkPathConverter::convert(config.outputs[i]);
    }
  }

private:
  // Cache of converted JsiValue's for outputs
  std::vector<std::shared_ptr<JsiSkPath>> _outputs;
  std::shared_ptr<JsiSkPath> _jsiPath;
};
} // namespace RNSkia
