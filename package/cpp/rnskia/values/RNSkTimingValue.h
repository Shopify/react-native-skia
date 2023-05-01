#pragma once

#include <chrono>
#include <memory>
#include <utility>

#include "RNSkAnimationValue.h"
#include "RNSkBaseInterpolator.h"

namespace RNSkia {

using RNSkTimingConfig = struct RNSkTimingConfig {
  double from;
  double to;
  bool loop;
  bool yoyo;
  double duration;
  std::shared_ptr<RNSkMutableValue> easing;
};

/**
 Implements a base clock value class
 */
class RNSkTimingAnimatedValue : public RNSkAnimationValue {
public:
  /**
   Constructor
   */
  RNSkTimingAnimatedValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                          RNSkTimingConfig config)
      : RNSkAnimationValue(platformContext), _config(std::move(config)) {
    _state = {config.from, .finished = false};
    // TODO: Override duration if the easing is providing it
  }

  /**
   Constructor with animation finish callback
   */
  RNSkTimingAnimatedValue(std::function<void()> animationDidFinish,
                          std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkAnimationValue(animationDidFinish, platformContext) {}

protected:
  /**
   Override to provide animation function that will be called when the dependant
   clock has been updated
   */
  double getNextAnimationValue(double ellapsedTimeMs) override {

    auto current = ellapsedTimeMs / _config.duration;

    // Side effect to stop animation when duration is reached (if loop is false)
    if (current >= 1.0 && !_config.loop) {
      _state.finished = true;
      _state.current = 1.0;
    }

    // Calculate a value between 0 and 1 based on config
    auto clamped = std::fmod(current, 1.0);
    if (_config.yoyo) {
      clamped = std::fmod(current, 2.0) >= 1.0 ? 1 - clamped : clamped;
    } else if (!_config.loop) {
      if (current >= 1.0) {
        clamped = 1.0;
      }
    }

    // Apply easing - clamp to 0 - 1
    current = std::max(0.0, std::min(1.0, current));
    _config.easing->setCurrent(current);
    current = _config.easing->getCurrent().getAsNumber();

    // Interpolate
    _state.current = clamped * (_config.to - _config.from) + _config.from;

    if (_state.finished) {
      finishAnimation();
    }

    return _state.current;
  }

private:
  // Animation's state
  AnimationState _state;
  RNSkTimingConfig _config;
};
} // namespace RNSkia
