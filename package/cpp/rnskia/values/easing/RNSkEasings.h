#pragma once

#include <math.h>
#include <memory>
#include <string>
#include <vector>

#include "RNSkBaseEasing.h"
#include "RNSkBezier.h"

namespace RNSkia {

enum RNSkEasingType {
  Step0 = 0,
  Step1 = 1,
  Linear = 2,
  Ease = 3,
  Quad = 4,
  Cubic = 5,
  Poly = 6,
  Sin = 7,
  Circle = 8,
  Exp = 9,
  Elastic = 10,
  Back = 11,
  Bounce = 12,

  Out = 20,
  InOut = 21,
  Bezier = 22,

  None = 10000,
};

struct RNSkEasingConfig {
  RNSkEasingType type;
  JsiValue parameters;
  RNSkEasingConfig *child;
};

/**
 Implements a Spring based easing that precalculates and caches solver functions
 for different spring configurations. The input for the spring is a numeric
 value between 0 and 1.
 */
class RNSkEasings : public RNSkBaseEasing {
public:
  /**
   Constructs a regular time based easing from configuration
   */
  explicit RNSkEasings(std::shared_ptr<RNSkPlatformContext> platformContext,
                       const JsiValue &config)
      : RNSkBaseEasing(platformContext) {

    _solver = getSolverFromConfig(config);
  }

protected:
  double easing(double t) override { return _solver(t); }

private:
  /**
   Returns a solver from the provided easing configuration. The configuration is
   of shape:
   {
     type: RNSkEasingType,
     parameters?: Object
     child?: RNSkEasingConfig,
   }
   */
  std::function<double(double)> getSolverFromConfig(const JsiValue &config) {
    // Get type of easing
    auto type = static_cast<RNSkEasingType>(
        config.getValue(JsiPropId::get("type")).getAsNumber());

    switch (type) {
    case RNSkEasingType::Step0:
      return std::bind(&RNSkEasings::step0, this, std::placeholders::_1);

    case RNSkEasingType::Step1:
      return std::bind(&RNSkEasings::step1, this, std::placeholders::_1);

    case RNSkEasingType::Linear:
      return std::bind(&RNSkEasings::linear, this, std::placeholders::_1);

    case RNSkEasingType::Ease:
      return std::bind(&RNSkEasings::ease, this, std::placeholders::_1);

    case RNSkEasingType::Quad:
      return std::bind(&RNSkEasings::quad, this, std::placeholders::_1);

    case RNSkEasingType::Cubic:
      return std::bind(&RNSkEasings::cubic, this, std::placeholders::_1);

    case RNSkEasingType::Poly:
      return std::bind(&RNSkEasings::poly, this, std::placeholders::_1);

    case RNSkEasingType::Sin:
      return std::bind(&RNSkEasings::sin, this, std::placeholders::_1);

    case RNSkEasingType::Circle:
      return std::bind(&RNSkEasings::circle, this, std::placeholders::_1);

    case RNSkEasingType::Exp:
      return std::bind(&RNSkEasings::exp, this, std::placeholders::_1);

    case RNSkEasingType::Elastic: {
      _bounciness = getParameterAsNumber("bounciness", config) * M_PI;
      return std::bind(&RNSkEasings::elastic, this, std::placeholders::_1);
    }

    case RNSkEasingType::Back:
      _s = getParameterAsNumber("s", config);
      return std::bind(&RNSkEasings::back, this, std::placeholders::_1);

    case RNSkEasingType::Bounce:
      return std::bind(&RNSkEasings::bounce, this, std::placeholders::_1);

    case RNSkEasingType::Out:
      readChildFromConfig(config);
      return std::bind(&RNSkEasings::out, this, std::placeholders::_1);

    case RNSkEasingType::InOut:
      readChildFromConfig(config);
      return std::bind(&RNSkEasings::inOut, this, std::placeholders::_1);

    case RNSkEasingType::Bezier: {
      auto bezier = getParameterAsArray("bezier", config);
      return RNSkBezier::bezier(bezier[0], bezier[1], bezier[2], bezier[3]);
    }

    case RNSkEasingType::None:
      return std::bind(&RNSkEasings::linear, this, std::placeholders::_1);
    }
  }

  std::vector<double> getParameterAsArray(const std::string &name,
                                          const JsiValue &config) {
    auto parameters = config.getValue(JsiPropId::get("parameters"));
    if (parameters.getType() != PropType::Object) {
      throw std::invalid_argument(
          std::string("Expected easing parameters, got " +
                      parameters.getTypeAsString() + "."));
    }

    if (!parameters.hasValue(JsiPropId::get(name))) {
      throw std::invalid_argument(
          std::string("Missing easing parameter '" + name + "'."));
    }
    auto param = parameters.getValue(JsiPropId::get(name));
    if (param.getType() != PropType::Array) {
      throw std::invalid_argument(
          std::string("Expected array easing parameter for '" + name +
                      "', got " + param.getTypeAsString() + "."));
    }
    auto array = param.getAsArray();
    std::vector<double> result(array.size());
    for (size_t i = 0; i < array.size(); ++i) {
      result[i] = array[i].getAsNumber();
    }
    return result;
  }

  double getParameterAsNumber(const std::string &name, const JsiValue &config) {
    auto parameters = config.getValue(JsiPropId::get("parameters"));
    if (parameters.getType() != PropType::Object) {
      throw std::invalid_argument(
          std::string("Expected easing parameters, got " +
                      parameters.getTypeAsString() + "."));
    }

    if (!parameters.hasValue(JsiPropId::get(name))) {
      throw std::invalid_argument(
          std::string("Missing easing parameter '" + name + "'."));
    }
    auto param = parameters.getValue(JsiPropId::get(name));
    if (param.getType() != PropType::Number) {
      throw std::invalid_argument(
          std::string("Expected numeric easing parameter for '" + name +
                      "', got " + param.getTypeAsString() + "."));
    }
    return param.getAsNumber();
  }

  void readChildFromConfig(const JsiValue &config) {
    // Get child from config
    auto childConfig = config.getValue(JsiPropId::get("child"));
    if (childConfig.getType() != PropType::Object) {
      throw std::invalid_argument(
          std::string("Expected easing type as child, got " +
                      childConfig.getTypeAsString() + "."));
    }

    _child = std::make_unique<RNSkEasings>(getContext(), childConfig);
  }

  double step0(double t) { return t > 0.0 ? 1.0 : 0.0; }
  double step1(double t) { return t >= 1.0 ? 1.0 : 0.0; }
  double linear(double t) { return t; }
  double ease(double t) {
    return t; // TODO: Easing.bezier(0.42, 0, 1, 1)(t);
  }
  double quad(double t) { return t * t; }
  double cubic(double t) { return t * t * t; }
  double poly(double t) {
    return t; // TODO: (t: number): number => t ** n; // math.pow(t, n)
  }
  double sin(double t) { return 1.0 - std::cos((t * M_PI) / 2.0); }
  double circle(double t) { return 1.0 - std::sqrt(1.0 - t * t); }
  double exp(double t) { return std::pow(2.0, 10.0 * (t - 1)); }

  double bounce(double t) {
    if (t < 1.0 / 2.75) {
      return 7.5625 * t * t;
    }

    if (t < 2.0 / 2.75) {
      double t2_ = t - 1.5 / 2.75;
      return 7.5625 * t2_ * t2_ + 0.75;
    }

    if (t < 2.5 / 2.75) {
      double t2_ = t - 2.25 / 2.75;
      return 7.5625 * t2_ * t2_ + 0.9375;
    }

    double t2 = t - 2.625 / 2.75;
    return 7.5625 * t2 * t2 + 0.984375;
  }

  double out(double t) { return 1.0 - _child->easing(1.0 - t); }
  double inOut(double t) {
    // (t) => t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2
    return t < 0.5 ? _child->easing(t * 2.0) / 2.0
                   : 1.0 - _child->easing((1.0 - t) * 2) / 2;
  }

  double elastic(double t) {
    // (t): number => 1 - Math.cos((t * Math.PI) / 2) ** 3 * Math.cos(t * p);
    return std::pow(1.0 - std::cos((t * M_PI) / 2.0), 3.0) *
           std::cos(t * _bounciness);
  }

  double back(double t) {
    // (t): number => t * t * ((s + 1) * t - s);
    return t * t * ((_s + 1.0) * t - _s);
  }

  std::function<double(double)> _solver;
  std::unique_ptr<RNSkEasings> _child;

  double _bounciness = 1.0;
  double _s = 1.0;
};
} // namespace RNSkia
