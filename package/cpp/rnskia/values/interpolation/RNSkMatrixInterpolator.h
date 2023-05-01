#pragma once

#include <memory>
#include <utility>
#include <vector>

#include "RNSkBaseInterpolator.h"
#include "RNSkMatrixConverter.h"

namespace RNSkia {

/**
 Implements a base clock value class
 */
class RNSkMatrixInterpolator : public RNSkBaseInterpolator {
public:
  /**
   Constructor
   */
  RNSkMatrixInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                         RNSkInterpolatorConfig config)
      : RNSkBaseInterpolator(platformContext, config) {
    _outputs.resize(config.inputs.size());
    for (size_t i = 0; i < config.inputs.size(); i++) {
      _outputs[i] = RNSkMatrixConverter::convert(config.outputs[i]);
    }
  }

protected:
  /**
   Interpolator function
   */
  void interpolateRange(double current, size_t index, double inputMin,
                        double inputMax, JsiValue &output) override {

    // Create or reset the cached JsiSkMatrix object
    if (_jsiMatrix == nullptr) {
      _jsiMatrix =
          std::make_shared<JsiSkMatrix>(getPlatformContext(), SkMatrix());
    } else {
      _jsiMatrix->getObject()->setIdentity();
    }

    auto start = _outputs[index]->getObject();
    auto end = _outputs[index + 1]->getObject();

    // Interpolate matrices
    for (int i = 0; i < 9; i++) {
      _jsiMatrix->getObject()->set(i, interpolate(current, inputMin, inputMax,
                                                  start->get(i), end->get(i)));
    }

    output.setHostObject(_jsiMatrix);
  };

private:
  // Cache of converted JsiValue's for outputs
  std::vector<std::shared_ptr<JsiSkMatrix>> _outputs;
  std::shared_ptr<JsiSkMatrix> _jsiMatrix;
};
} // namespace RNSkia
