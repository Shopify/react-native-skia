#pragma once

#include <memory>
#include <vector>

#include "RNSkValue.h"

#include "RNSkColorInterpolator.h"
#include "RNSkMatrixInterpolator.h"
#include "RNSkNumericInterpolator.h"
#include "RNSkPathInterpolator.h"
#include "RNSkPointInterpolator.h"
#include "RNSkRRectInterpolator.h"
#include "RNSkRectInterpolator.h"
#include "RNSkTransformInterplator.h"

namespace RNSkia {

/**
 Implements a value that interpolates from input values to output values. The
 input values will be a list of at least two numbers. The Interpolator value
 must be driven (have it's animation property set to) a value that updates with
 numbers like a clock value or timing value.
 */
template <typename TInterpolator>
class RNSkBaseInterpolatorValue : public RNSkMutableValue,
                                  public TInterpolator {
public:
  /**
   Constructor
   */
  RNSkBaseInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkMutableValue(platformContext),
        TInterpolator(platformContext, runtime, maybeConfig) {}

  /**
   Constructor
   */
  RNSkBaseInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      const RNSkInterpolatorConfig &config)
      : RNSkMutableValue(platformContext),
        TInterpolator(platformContext, config) {}

  JsiValue &getCurrent() override {
    return TInterpolator::interpolate(RNSkValue::getCurrent().getAsNumber());
  }
};

class RNSkColorInterpolatorValue
    : public RNSkBaseInterpolatorValue<RNSkColorInterpolator> {
public:
  RNSkColorInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      const RNSkInterpolatorConfig &config)
      : RNSkBaseInterpolatorValue(platformContext, config) {}

  RNSkColorInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolatorValue(platformContext, runtime, maybeConfig) {}
};

class RNSkMatrixInterpolatorValue
    : public RNSkBaseInterpolatorValue<RNSkMatrixInterpolator> {
public:
  RNSkMatrixInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      const RNSkInterpolatorConfig &config)
      : RNSkBaseInterpolatorValue(platformContext, config) {}

  RNSkMatrixInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolatorValue(platformContext, runtime, maybeConfig) {}
};

class RNSkNumericInterpolatorValue
    : public RNSkBaseInterpolatorValue<RNSkNumericInterpolator> {
public:
  RNSkNumericInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      const RNSkInterpolatorConfig &config)
      : RNSkBaseInterpolatorValue(platformContext, config) {}

  RNSkNumericInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolatorValue(platformContext, runtime, maybeConfig) {}
};

class RNSkPathInterpolatorValue
    : public RNSkBaseInterpolatorValue<RNSkPathInterpolator> {
public:
  RNSkPathInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      const RNSkInterpolatorConfig &config)
      : RNSkBaseInterpolatorValue(platformContext, config) {}

  RNSkPathInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolatorValue(platformContext, runtime, maybeConfig) {}
};

class RNSkPointInterpolatorValue
    : public RNSkBaseInterpolatorValue<RNSkPointInterpolator> {
public:
  RNSkPointInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      const RNSkInterpolatorConfig &config)
      : RNSkBaseInterpolatorValue(platformContext, config) {}

  RNSkPointInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolatorValue(platformContext, runtime, maybeConfig) {}
};

class RNSkRectInterpolatorValue
    : public RNSkBaseInterpolatorValue<RNSkRectInterpolator> {
public:
  RNSkRectInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      const RNSkInterpolatorConfig &config)
      : RNSkBaseInterpolatorValue(platformContext, config) {}

  RNSkRectInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolatorValue(platformContext, runtime, maybeConfig) {}
};

class RNSkRRectInterpolatorValue
    : public RNSkBaseInterpolatorValue<RNSkRRectInterpolator> {
public:
  RNSkRRectInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      const RNSkInterpolatorConfig &config)
      : RNSkBaseInterpolatorValue(platformContext, config) {}

  RNSkRRectInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolatorValue(platformContext, runtime, maybeConfig) {}
};

class RNSkTransformInterpolatorValue
    : public RNSkBaseInterpolatorValue<RNSkTransformInterpolator> {
public:
  RNSkTransformInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      const RNSkInterpolatorConfig &config)
      : RNSkBaseInterpolatorValue(platformContext, config) {}

  RNSkTransformInterpolatorValue(
      std::shared_ptr<RNSkPlatformContext> platformContext,
      jsi::Runtime &runtime, const jsi::Value &maybeConfig)
      : RNSkBaseInterpolatorValue(platformContext, runtime, maybeConfig) {}
};

} // namespace RNSkia
