#pragma once

#include <algorithm>
#include <chrono>
#include <memory>
#include <utility>
#include <vector>

#include "RNSkAnimationValue.h"
#include "RNSkBaseInterpolator.h"

namespace RNSkia {

const double VELOCITY_EPS = 1.0;
const double SLOPE_FACTOR = 0.1;

using RNSkDecayConfig = struct RNSkDecayConfig {
  double from;
  double deceleration;
  double velocityFactor;
  std::vector<double> clamp;
  double velocity;
};

/**
 Implements a base clock value class
 */
class RNSkDecayAnimatedValue : public RNSkAnimationValue {
public:
  struct RNSkDecayAnimationState {
    double lastTimestamp;
    double startTimestamp;
    double initialVelocity;
    double velocity;
    double current;
    bool finished;
  };

  /**
   Constructor
   */
  RNSkDecayAnimatedValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                         RNSkDecayConfig config)
      : RNSkAnimationValue(platformContext), _config(std::move(config)) {
    _state = {.current = config.from,
              .startTimestamp = 0.0,
              .initialVelocity = config.velocity,
              .velocity = config.velocity,
              .lastTimestamp = 0.0,
              .finished = false};
  }

  /**
   Constructor with animation finish callback
   */
  RNSkDecayAnimatedValue(std::function<void()> animationDidFinish,
                         std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkAnimationValue(animationDidFinish, platformContext) {}

  /**
   Constructor from jsi values
   */
  RNSkDecayAnimatedValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                         jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkAnimationValue(platformContext) {
    // Read parameters from Javascript
    if (!maybeConfig.isObject()) {
      throw std::runtime_error(
          "Expected a config object as the first parameter for a decay value.");
    }

    auto configObject = maybeConfig.asObject(runtime);

    auto from = configObject.getProperty(runtime, "from").asNumber();
    auto deceleration =
        configObject.getProperty(runtime, "deceleration").asNumber();
    auto velocityFactor =
        configObject.getProperty(runtime, "velocityFactor").asNumber();
    auto clamp = configObject.getProperty(runtime, "clamp")
                     .asObject(runtime)
                     .asArray(runtime);
    auto velocity = configObject.getProperty(runtime, "velocity").asNumber();

    // TODO: Read animation done callback

    // Create config
    std::vector<double> clampArray(clamp.size(runtime));
    for (auto i = 0; i < clampArray.size(); ++i) {
      clampArray[i] = clamp.getValueAtIndex(runtime, i).asNumber();
    }

    _config = {from, deceleration, velocityFactor, .clamp = clampArray,
               velocity};
  }

protected:
  /**
   Override to provide animation function that will be called when the dependant
   clock has been updated
   */
  double getNextAnimationValue(double ellapsedTimeMs) override {
    auto lastTimestamp = _state.lastTimestamp;
    auto startTimestamp = _state.startTimestamp;

    if (lastTimestamp == 0.0) {
      _state.startTimestamp = ellapsedTimeMs;
      _state.lastTimestamp = ellapsedTimeMs;
      return _state.current;
    }

    auto deltaTime = std::min(ellapsedTimeMs - lastTimestamp, 64.0);
    auto v = _state.velocity *
             std::exp(-(1 - _config.deceleration) *
                      (ellapsedTimeMs - startTimestamp) * SLOPE_FACTOR);

    // /1000 because time is in ms not in s
    _state.current =
        _state.current + (v * _config.velocityFactor * deltaTime) / 1000;
    _state.velocity = v;
    _state.lastTimestamp = ellapsedTimeMs;

    if (_config.clamp.size() > 0) {
      if (_state.initialVelocity < 0 && _state.current <= _config.clamp[0]) {
        _state.current = _config.clamp[0];
        _state.finished = true;
      } else if (_state.initialVelocity > 0 &&
                 _state.current >= _config.clamp[1]) {
        _state.current = _config.clamp[1];
        _state.finished = true;
      }
    }
    _state.finished = std::abs(v) < VELOCITY_EPS;
    return _state.current;
  }

private:
  // Animation's state
  RNSkDecayAnimationState _state;
  RNSkDecayConfig _config;
};
} // namespace RNSkia
