#pragma once

#include "JsiSkHostObjects.h"
#include "JsiSkPathEffect.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkCornerPathEffect.h>
#include <SkDashPathEffect.h>
#include <SkDiscretePathEffect.h>
#include <SkPathEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkPathEffectFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeCorner) {
    int radius = arguments[0].asNumber();
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPathEffect>(
                     getContext(), SkCornerPathEffect::Make(radius)));
  }

  JSI_HOST_FUNCTION(MakeDash) {
    auto jsiIntervals = arguments[0].asObject(runtime).asArray(runtime);
    int phase = arguments[1].asNumber();
    auto size = (int)jsiIntervals.size(runtime);
    std::vector<SkScalar> intervals;
    for (int i = 0; i < size; i++) {
      SkScalar interval = jsiIntervals.getValueAtIndex(runtime, i).asNumber();
      intervals.push_back(interval);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPathEffect>(
                     getContext(),
                     SkDashPathEffect::Make(intervals.data(), size, phase)));
  }

  JSI_HOST_FUNCTION(MakeDiscrete) {
    int segLength = arguments[0].asNumber();
    int dec = arguments[1].asNumber();
    int seedAssist = arguments[2].asNumber();
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPathEffect>(
                     getContext(),
                     SkDiscretePathEffect::Make(segLength, dec, seedAssist)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPathEffectFactory, MakeCorner),
                       JSI_EXPORT_FUNC(JsiSkPathEffectFactory, MakeDash),
                       JSI_EXPORT_FUNC(JsiSkPathEffectFactory, MakeDiscrete))

  JsiSkPathEffectFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(context) {}
};

} // namespace RNSkia
