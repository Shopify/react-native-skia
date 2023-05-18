#pragma once

#include <chrono>
#include <memory>
#include <utility>

#include "RNSkAnimationValue.h"
#include "RNSkBaseInterpolator.h"

namespace RNSkia {

using RNSkDecayConfig = struct RNSkDecayConfig {
  // TODO:
};

/**
 Implements a base clock value class
 */
class RNSkDecayAnimatedValue : public RNSkAnimationValue {
public:
  /**
   Constructor
   */
  RNSkDecayAnimatedValue(std::shared_ptr<RNSkPlatformContext> platformContext,
                         RNSkDecayConfig config)
      : RNSkAnimationValue(platformContext), _config(std::move(config)) {
    _state = {config.from, .finished = false};
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

    return _state.current;
  }

private:
  // Animation's state
  AnimationState _state;
  RNSkDecayConfig _config;
};
} // namespace RNSkia
