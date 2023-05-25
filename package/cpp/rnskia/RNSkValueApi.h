#pragma once

#include <memory>
#include <string>
#include <vector>

#include "JsiHostObject.h"
#include "RNSkPlatformContext.h"
#include "RNSkValue.h"

#include "RNSkComputedValue.h"
#include "RNSkDecayValue.h"
#include "RNSkEasings.h"
#include "RNSkInterpolatorValues.h"
#include "RNSkSpringEasing.h"
#include "RNSkTimingValue.h"

#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

class RNSkValueApi : public RNJsi::JsiHostObject {
public:
  /**
   * Constructor
   * @param platformContext Platform context
   */
  explicit RNSkValueApi(std::shared_ptr<RNSkPlatformContext> platformContext)
      : JsiHostObject(), _platformContext(platformContext) {}

  /**
   * Destructor
   */
  ~RNSkValueApi() {}

  JSI_HOST_FUNCTION(createValue) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkMutableValue>(_platformContext, runtime,
                                                    arguments[0]));
  }

  JSI_HOST_FUNCTION(createSpringEasing) {
    auto springEasing = std::make_shared<RNSkSpringEasing>(
        _platformContext, runtime, arguments[0]);

    // Return spring easing config object as a JS object with
    // props for duration and the easing value itself
    auto duration = springEasing->getDurationMs();
    auto retVal = jsi::Object(runtime);
    retVal.setProperty(runtime, "duration", duration);
    retVal.setProperty(
        runtime, "easing",
        jsi::Object::createFromHostObject(runtime, springEasing));
    return retVal;
  }

  JSI_HOST_FUNCTION(createEasing) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkEasings>(
                     _platformContext, JsiValue(runtime, arguments[0])));
  }

  JSI_HOST_FUNCTION(createTiming) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkTimingAnimatedValue>(
                     _platformContext, runtime, arguments[0], arguments[1]));
  }

  JSI_HOST_FUNCTION(createDecay) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkDecayAnimatedValue>(
                     _platformContext, runtime, arguments[0]));
  }

  JSI_HOST_FUNCTION(createColorInterpolator) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkColorInterpolatorValue>(
                     _platformContext, runtime, arguments[0]));
  }

  JSI_HOST_FUNCTION(createMatrixInterpolator) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkMatrixInterpolatorValue>(
                     _platformContext, runtime, arguments[0]));
  }

  JSI_HOST_FUNCTION(createNumericInterpolator) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkNumericInterpolatorValue>(
                     _platformContext, runtime, arguments[0]));
  }

  JSI_HOST_FUNCTION(createPathInterpolator) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkPathInterpolatorValue>(
                     _platformContext, runtime, arguments[0]));
  }

  JSI_HOST_FUNCTION(createPointInterpolator) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkPointInterpolatorValue>(
                     _platformContext, runtime, arguments[0]));
  }

  JSI_HOST_FUNCTION(createRectInterpolator) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkRectInterpolatorValue>(
                     _platformContext, runtime, arguments[0]));
  }

  JSI_HOST_FUNCTION(createRRectInterpolator) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkRRectInterpolatorValue>(
                     _platformContext, runtime, arguments[0]));
  }

  JSI_HOST_FUNCTION(createTransformInterpolator) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkTransformInterpolatorValue>(
                     _platformContext, runtime, arguments[0]));
  }

  JSI_HOST_FUNCTION(createClockValue) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkClockValue>(_platformContext));
  }

  JSI_HOST_FUNCTION(createComputedValue) {
    // Creation and initialization is done in two steps to be able to use weak
    // references when setting up dependencies - since weak_from_this needs our
    // instance to be a shared_ptr before calling weak_from_this().
    auto computedValue = std::make_shared<RNSkComputedValue>(
        _platformContext, runtime, arguments, count);
    computedValue->initializeDependencies(runtime, arguments, count);
    return jsi::Object::createFromHostObject(runtime, computedValue);
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(RNSkValueApi, createValue),
                       JSI_EXPORT_FUNC(RNSkValueApi, createClockValue),
                       JSI_EXPORT_FUNC(RNSkValueApi, createTiming),
                       JSI_EXPORT_FUNC(RNSkValueApi, createDecay),
                       JSI_EXPORT_FUNC(RNSkValueApi, createColorInterpolator),
                       JSI_EXPORT_FUNC(RNSkValueApi, createMatrixInterpolator),
                       JSI_EXPORT_FUNC(RNSkValueApi, createNumericInterpolator),
                       JSI_EXPORT_FUNC(RNSkValueApi, createPathInterpolator),
                       JSI_EXPORT_FUNC(RNSkValueApi, createPointInterpolator),
                       JSI_EXPORT_FUNC(RNSkValueApi, createRectInterpolator),
                       JSI_EXPORT_FUNC(RNSkValueApi, createRRectInterpolator),
                       JSI_EXPORT_FUNC(RNSkValueApi,
                                       createTransformInterpolator),
                       JSI_EXPORT_FUNC(RNSkValueApi, createComputedValue),
                       JSI_EXPORT_FUNC(RNSkValueApi, createSpringEasing),
                       JSI_EXPORT_FUNC(RNSkValueApi, createEasing))

private:
  // Platform context
  std::shared_ptr<RNSkPlatformContext> _platformContext;
};
} // namespace RNSkia
