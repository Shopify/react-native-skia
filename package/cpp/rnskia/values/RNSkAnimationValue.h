#pragma once

#include <chrono>
#include <memory>

#include "RNSkClockValue.h"

namespace RNSkia {

/**
 Implements a base clock value class
 */
class RNSkAnimationValue : public RNSkClockValue {
public:
  /**
   Constructor
   */
  explicit RNSkAnimationValue(
      std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkClockValue(platformContext) {}

  /**
   Constructor with animation finish callback
   */
  RNSkAnimationValue(std::function<void()> animationDidFinish,
                     std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkClockValue(platformContext),
        _animationDidFinish(animationDidFinish) {}

protected:
  /**
   Override to provide animation function that will be called when the dependant
   clock has been updated
   */
  virtual double getNextAnimationValue(double ellapsedTimeMs) = 0;

  /**
   Clock was updated
   */
  void onClockUpdated(double ellapsedTimeMs) override {
    setCurrent(getNextAnimationValue(ellapsedTimeMs));
  }

  /**
   Call when animation should finish.
   */
  void finishAnimation() {
    stopClock();
    if (_animationDidFinish) {
      _animationDidFinish();
    }
  }

private:
  std::function<void()> _animationDidFinish = nullptr;
};
} // namespace RNSkia
