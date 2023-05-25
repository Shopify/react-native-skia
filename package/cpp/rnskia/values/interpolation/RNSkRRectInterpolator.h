#pragma once

#include <memory>
#include <vector>

#include "RNSkBaseInterpolator.h"
#include "RNSkRRectConverter.h"

namespace RNSkia {

/**
 Implements a base clock value class
 */
class RNSkRRectInterpolator : public RNSkBaseInterpolator {
public:
  /**
   Constructor
   */
  RNSkRRectInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                        RNSkInterpolatorConfig config)
      : RNSkBaseInterpolator(platformContext, config) {}

  /**
   Constructor from jsi values
   */
  RNSkRRectInterpolator(std::shared_ptr<RNSkPlatformContext> platformContext,
                        jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolator(platformContext, runtime, maybeConfig) {}

protected:
  /**
   Interpolator function
   */
  void interpolateRange(double current, size_t index, double inputMin,
                        double inputMax, JsiValue &output) override {

    if (_jsiRRrect == nullptr) {
      _jsiRRrect =
          std::make_shared<JsiSkRRect>(getPlatformContext(), SkRRect());
    }

    auto x =
        interpolate(current, inputMin, inputMax, _outputs[index]->rect().x(),
                    _outputs[index + 1]->rect().x());
    auto y =
        interpolate(current, inputMin, inputMax, _outputs[index]->rect().y(),
                    _outputs[index + 1]->rect().y());
    auto w = interpolate(current, inputMin, inputMax, _outputs[index]->width(),
                         _outputs[index + 1]->width());
    auto h = interpolate(current, inputMin, inputMax, _outputs[index]->height(),
                         _outputs[index + 1]->height());
    auto rx = interpolate(current, inputMin, inputMax,
                          _outputs[index]->getSimpleRadii().x(),
                          _outputs[index + 1]->getSimpleRadii().x());
    auto ry = interpolate(current, inputMin, inputMax,
                          _outputs[index]->getSimpleRadii().y(),
                          _outputs[index + 1]->getSimpleRadii().y());

    _jsiRRrect->getObject()->setRectXY(SkRect::MakeXYWH(x, y, w, h), rx, ry);

    output.setHostObject(_jsiRRrect);
  };

  void readFromConfig(const RNSkInterpolatorConfig &config) override {
    _outputs.resize(config.outputs.size());
    for (size_t i = 0; i < config.outputs.size(); ++i) {
      _outputs[i] = RNSkRRectConverter::convert(config.outputs[i]);
    }
  }

private:
  std::vector<std::shared_ptr<SkRRect>> _outputs;
  std::shared_ptr<JsiSkRRect> _jsiRRrect;
};
} // namespace RNSkia
