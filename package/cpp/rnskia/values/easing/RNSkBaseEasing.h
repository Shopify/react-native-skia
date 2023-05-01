#pragma once

#include <chrono>
#include <memory>

#include "RNSkValue.h"

namespace RNSkia {

/**
 Implements a base easing value class
 */
class RNSkBaseEasing : public RNSkMutableValue {
public:
  /**
   Constructs a new base easing
   */
  explicit RNSkBaseEasing(std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkMutableValue(platformContext) {}

protected:
  JsiValue &getCurrent() override {
    _value.setNumber(easing(RNSkValue::getCurrent().getAsNumber()));
    return _value;
  }

  virtual double easing(double t) = 0;

private:
  JsiValue _value;
};

/**
 Defines an easing value that has a fixed duration, ie the duration is provided
 by the value itself.
 */
class RNSkFixedDurationEasing : public RNSkBaseEasing {
public:
  /**
   Constructs a new base easing
   */
  explicit RNSkFixedDurationEasing(
      std::shared_ptr<RNSkPlatformContext> platformContext)
      : RNSkBaseEasing(platformContext) {}

  /**
   Implement to return the duration of the easing
   */
  virtual double getDurationMs() = 0;
};
} // namespace RNSkia
