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
  struct RNSkAnimationState {
    double current;
    bool finished;
  };

  /**
   Constructor
   */
  RNSkTimingAnimatedValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                          RNSkTimingConfig config)
      : RNSkAnimationValue(platformContext), _config(std::move(config)) {
    _state = {config.from, .finished = false};
  }

  /**
   Constructor with animation finish callback
   */
  RNSkTimingAnimatedValue(std::function<void()> animationDidFinish,
                          std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkAnimationValue(animationDidFinish, platformContext) {}

  RNSkTimingAnimatedValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                          jsi::Runtime &runtime, const jsi::Value &maybeConfig,
                          const jsi::Value &maybeEasing)
      : RNSkAnimationValue(platformContext) {
    // Read parameters from Javascript
    if (!maybeConfig.isObject()) {
      throw std::runtime_error("Expected a config object as the first "
                               "parameter for the timing value.");
    }

    // Read parameters from Javascript
    auto configObject = maybeConfig.asObject(runtime);

    auto from = configObject.getProperty(runtime, "from").asNumber();
    auto to = configObject.getProperty(runtime, "to").asNumber();
    auto loop = configObject.getProperty(runtime, "loop").asBool();
    auto yoyo = configObject.getProperty(runtime, "yoyo").asBool();

    auto duration = configObject.getProperty(runtime, "duration").asNumber();

    // Read easing - easing is a value that will be driven by the timing if
    // provided.
    std::shared_ptr<RNSkMutableValue> easing = nullptr;
    if (!maybeEasing.isObject()) {
      throw std::runtime_error("Expected an easing object as the second "
                               "parameter for the timing value.");
    }

    easing =
        maybeEasing.getObject(runtime).asHostObject<RNSkMutableValue>(runtime);

    // TODO: Read animation done callback

    // Create config
    _config = {
        .from = from,
        .to = to,
        .loop = loop,
        .yoyo = yoyo,
        .duration = duration,
        .easing = easing,
    };
  }

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

    // Apply easing
    if (_config.easing != nullptr) {
      _config.easing->setCurrent(clamped);
      clamped = _config.easing->getCurrent().getAsNumber();
    }

    // Interpolate
    _state.current = clamped * (_config.to - _config.from) + _config.from;

    if (_state.finished) {
      finishAnimation();
    }

    return _state.current;
  }

private:
  // Animation's state
  RNSkAnimationState _state;
  RNSkTimingConfig _config;
};
} // namespace RNSkia
