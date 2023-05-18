#pragma once

#include <memory>
#include <vector>

#include "RNSkValue.h"

#include "RNSkColorInterpolator.h"
#include "RNSkMatrixInterpolator.h"
#include "RNSkNumericInterpolator.h"
#include "RNSkPathInterpolator.h"
#include "RNSkPointInterpolator.h"
#include "RNSkRRectInterpolator.h"
#include "RNSkRectInterpolator.h"
#include "RNSkTransformInterplator.h"

namespace RNSkia {

/**
 Implements a value that interpolates from input values to output values. The
 input values will be a list of at least two numbers. The Interpolator value
 must be driven (have it's animation property set to) a value that updates with
 numbers like a clock value or timing value.
 */
class RNSkInterpolatorValue : public RNSkMutableValue {
public:
  /**
   Constructor
   */
  RNSkInterpolatorValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                        const RNSkInterpolatorConfig &config)
      : RNSkMutableValue(platformContext), _config(config) {
    // Create interpolator
    if (RNSkColorConverter::isConvertable(config.outputs[0])) {
      _interpolator =
          std::make_shared<RNSkColorInterpolator>(platformContext, config);
    } else if (RNSkPathConverter::isConvertable(config.outputs[0])) {
      _interpolator =
          std::make_shared<RNSkPathInterpolator>(platformContext, config);
    } else if (RNSkNumericConverter::isConvertable(config.outputs[0])) {
      _interpolator =
          std::make_shared<RNSkNumericInterpolator>(platformContext, config);
    } else if (RNSkTransformConverter::isConvertable(config.outputs[0])) {
      _interpolator =
          std::make_shared<RNSkTransformInterpolator>(platformContext, config);
    } else if (RNSkMatrixConverter::isConvertable(config.outputs[0])) {
      _interpolator =
          std::make_shared<RNSkMatrixInterpolator>(platformContext, config);
    } else if (RNSkRRectConverter::isConvertable(config.outputs[0])) {
      _interpolator =
          std::make_shared<RNSkRRectInterpolator>(platformContext, config);
    } else if (RNSkRectConverter::isConvertable(config.outputs[0])) {
      _interpolator =
          std::make_shared<RNSkRectInterpolator>(platformContext, config);
    } else if (RNSkPointConverter::isConvertable(config.outputs[0])) {
      _interpolator =
          std::make_shared<RNSkPointInterpolator>(platformContext, config);
    } else {
      throw std::runtime_error("Could not interpolate the value " +
                               config.outputs[0].description() + ".");
    }
  }

  JsiValue &getCurrent() override {
    return _interpolator->interpolate(RNSkValue::getCurrent().getAsNumber());
  }

private:
  RNSkInterpolatorConfig _config;
  std::shared_ptr<RNSkBaseInterpolator> _interpolator;
};
} // namespace RNSkia
