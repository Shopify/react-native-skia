#pragma once

#include <memory>
#include <math.h>

#include "RNSkBaseEasing.h"

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
  Bounce = 12
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
                       RNSkEasingType type)
      : RNSkBaseEasing(platformContext), _type(type) {
    switch (type) {
    case RNSkEasingType::Step0:
      _solver = std::bind(&RNSkEasings::step0, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Step1:
      _solver = std::bind(&RNSkEasings::step1, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Linear:
      _solver = std::bind(&RNSkEasings::linear, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Ease:
      _solver = std::bind(&RNSkEasings::ease, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Quad:
      _solver = std::bind(&RNSkEasings::quad, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Cubic:
      _solver = std::bind(&RNSkEasings::cubic, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Poly:
      _solver = std::bind(&RNSkEasings::poly, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Sin:
      _solver = std::bind(&RNSkEasings::sin, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Circle:
      _solver = std::bind(&RNSkEasings::circle, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Exp:
      _solver = std::bind(&RNSkEasings::exp, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Elastic:
      _solver = std::bind(&RNSkEasings::elastic, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Back:
      _solver = std::bind(&RNSkEasings::back, this, std::placeholders::_1);
      break;
    case RNSkEasingType::Bounce:
      _solver = std::bind(&RNSkEasings::bounce, this, std::placeholders::_1);
      break;
    }
  }

protected:
  double easing(double t) override { return _solver(t); }

private:
  double step0(double t) { return t > 0.0 ? 1.0 : 0.0; }

  double step1(double t) { return t >= 1.0 ? 1.0 : 0.0; }

  double linear(double t) { return t; }

  double ease(double t) {
    return t; // TODO: Easing.bezier(0.42, 0, 1, 1)(t);
  }

  double quad(double t) { return t * t; }

  double cubic(double t) { return t * t * t; }

  double poly(double t) {
    return t; // TODO: (t: number): number => t ** n;
  }

  double sin(double t) { return 1.0 - std::cos((t * M_PI) / 2.0); }

  double circle(double t) { return 1.0 - std::sqrt(1.0 - t * t); }

  double exp(double t) { return std::pow(2.0, 10.0 * (t - 1)); }

  double elastic(double t) {
    return t;
    /* TODO:
     const p = bounciness * Math.PI;
    return (t): number =>
      1 - Math.cos((t * Math.PI) / 2) ** 3 * Math.cos(t * p);
     */
  }

  double back(double t) {
    return t; // TODO: (t): number => t * t * ((s + 1) * t - s);
  }

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

  std::function<double(double)> _solver;
  RNSkEasingType _type;
};
} // namespace RNSkia
