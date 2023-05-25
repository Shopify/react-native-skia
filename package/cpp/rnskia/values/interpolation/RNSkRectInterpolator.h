#pragma once

#include <memory>
#include <vector>

#include "JsiSkRect.h"
#include "RNSkBaseInterpolator.h"
#include "RNSkRectConverter.h"

namespace RNSkia {

/**
 Implements a base clock value class
 */
class RNSkRectInterpolator : public RNSkBaseInterpolator {
public:
  /**
   Constructor
   */
  RNSkRectInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                       RNSkInterpolatorConfig config)
      : RNSkBaseInterpolator(platformContext, config) {}

  /**
   Constructor from jsi values
   */
  RNSkRectInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                       jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolator(platformContext, runtime, maybeConfig) {}

protected:
  /**
   Interpolator function
   */
  void interpolateRange(double current, size_t index, double inputMin,
                        double inputMax, JsiValue &output) override {

    if (_jsiRect == nullptr) {
      _jsiRect = std::make_shared<JsiSkRect>(getPlatformContext(), SkRect());
    }

    auto x = interpolate(current, inputMin, inputMax, _outputs[index]->x(),
                         _outputs[index + 1]->x());
    auto y = interpolate(current, inputMin, inputMax, _outputs[index]->y(),
                         _outputs[index + 1]->y());
    auto w = interpolate(current, inputMin, inputMax, _outputs[index]->width(),
                         _outputs[index + 1]->width());
    auto h = interpolate(current, inputMin, inputMax, _outputs[index]->height(),
                         _outputs[index + 1]->height());

    _jsiRect->getObject()->setXYWH(x, y, w, h);
    output.setHostObject(_jsiRect);
  };

  void readFromConfig(const RNSkInterpolatorConfig &config) override {
    _outputs.resize(config.outputs.size());
    for (size_t i = 0; i < config.outputs.size(); ++i) {
      _outputs[i] = RNSkRectConverter::convert(config.outputs[i]);
    }
  }

private:
  std::vector<std::shared_ptr<SkRect>> _outputs;
  std::shared_ptr<JsiSkRect> _jsiRect;
};
} // namespace RNSkia
