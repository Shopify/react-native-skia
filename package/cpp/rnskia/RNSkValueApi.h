#pragma once

#include <memory>
#include <vector>

#include "RNSkValue.h"
#include "JsiHostObject.h"
#include "RNSkPlatformContext.h"

#include "RNSkComputedValue.h"
#include "RNSkEasings.h"
#include "RNSkInterpolatorValue.h"
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
    // Read parameters from Javascript
    auto configObject = arguments[0].asObject(runtime);

    double mass = configObject.getProperty(runtime, "mass").asNumber();
    double stiffness =
        configObject.getProperty(runtime, "stiffness").asNumber();
    double damping = configObject.getProperty(runtime, "damping").asNumber();
    double velocity = configObject.hasProperty(runtime, "velocity")
                          ? configObject.getProperty(runtime, "yoyo").asNumber()
                          : 0;

    RNSkSpringConfig config = {mass, stiffness, velocity, damping};

    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkSpringEasing>(_platformContext, config));
  }

  JSI_HOST_FUNCTION(createEasing) {
    // Read parameters from Javascript
    auto configObject = arguments[0].asObject(runtime);

    size_t type = configObject.getProperty(runtime, "type").asNumber();

    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<RNSkEasings>(
                     _platformContext, static_cast<RNSkEasingType>(type)));
  }

  JSI_HOST_FUNCTION(createTiming) {
    // Read parameters from Javascript
    auto configObject = arguments[0].asObject(runtime);

    auto from = configObject.getProperty(runtime, "from").asNumber();
    auto to = configObject.getProperty(runtime, "to").asNumber();
    auto loop = configObject.getProperty(runtime, "loop").asBool();
    auto yoyo = configObject.getProperty(runtime, "yoyo").asBool();

    auto duration = configObject.getProperty(runtime, "duration").asNumber();
    
    // Read easing - easing is a value that will be driven by the timing if provided.
    auto easing = configObject.getProperty(runtime, "easing").getObject(runtime).asHostObject<RNSkMutableValue>(runtime);
    
    // TODO: Read animation done callback

    RNSkTimingConfig config = {.from = from,
                               .to = to,
                               .loop = loop,
                               .yoyo = yoyo,
                               .duration = duration,
                               .easing = easing,
    };

    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<RNSkTimingAnimatedValue>(_platformContext, config));
  }

  JSI_HOST_FUNCTION(createInterpolator) {
    // Read parameters from Javascript
    auto configObject = arguments[0].asObject(runtime);

    // Create configuration
    std::vector<double> inputs;
    std::vector<JsiValue> outputs;

    auto inputsArray =
        configObject.getPropertyAsObject(runtime, "inputs").asArray(runtime);
    auto outputsArray =
        configObject.getPropertyAsObject(runtime, "outputs").asArray(runtime);

    // Resize and set numbers from input
    inputs.resize(inputsArray.size(runtime));
    for (size_t i = 0; i < inputs.size(); ++i) {
      inputs[i] = inputsArray.getValueAtIndex(runtime, i).asNumber();
    }

    // Reserve on outputs since we're constructing JsiValues here
    outputs.reserve(outputsArray.size(runtime));
    for (size_t i = 0; i < inputs.size(); ++i) {
      outputs.emplace_back(runtime, outputsArray.getValueAtIndex(runtime, i));
    }

    // TODO: Clamping

    // Create config
    RNSkInterpolatorConfig config = {inputs, outputs};

    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<RNSkInterpolatorValue>(_platformContext, config));
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
                       JSI_EXPORT_FUNC(RNSkValueApi, createInterpolator),
                       JSI_EXPORT_FUNC(RNSkValueApi, createComputedValue),
                       JSI_EXPORT_FUNC(RNSkValueApi, createSpringEasing),
                       JSI_EXPORT_FUNC(RNSkValueApi, createEasing))

private:
  // Platform context
  std::shared_ptr<RNSkPlatformContext> _platformContext;
};
} // namespace RNSkia
