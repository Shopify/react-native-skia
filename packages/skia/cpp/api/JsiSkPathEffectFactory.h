#pragma once

#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkNativeObjects.h"
#include "JsiSkPathEffect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPathEffect.h"
#include "include/effects/Sk1DPathEffect.h"
#include "include/effects/Sk2DPathEffect.h"
#include "include/effects/SkCornerPathEffect.h"
#include "include/effects/SkDashPathEffect.h"
#include "include/effects/SkDiscretePathEffect.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPathEffectFactory
    : public JsiSkNativeObject<JsiSkPathEffectFactory> {
public:
  static constexpr const char *CLASS_NAME = "PathEffectFactory";

  JSI_HOST_FUNCTION(MakeCorner) {
    int radius = arguments[0].asNumber();
    auto pathEffect = std::make_shared<JsiSkPathEffect>(
        getContext(), SkCornerPathEffect::Make(radius));
    return makeJsiObject(runtime, std::move(pathEffect));
  }

  JSI_HOST_FUNCTION(MakeDash) {
    auto jsiIntervals = arguments[0].asObject(runtime).asArray(runtime);
    auto size = static_cast<int>(jsiIntervals.size(runtime));
    std::vector<SkScalar> intervals;
    intervals.reserve(size);
    for (int i = 0; i < size; i++) {
      SkScalar interval = jsiIntervals.getValueAtIndex(runtime, i).asNumber();
      intervals.push_back(interval);
    }
    int phase =
        count >= 2 && !arguments[1].isUndefined() && !arguments[1].isNull()
            ? arguments[1].asNumber()
            : 0;
    auto i = SkSpan(intervals.data(), intervals.size());
    auto pathEffect = std::make_shared<JsiSkPathEffect>(
        getContext(), SkDashPathEffect::Make(i, phase));
    return makeJsiObject(runtime, std::move(pathEffect));
  }

  JSI_HOST_FUNCTION(MakeDiscrete) {
    int segLength = arguments[0].asNumber();
    int dec = arguments[1].asNumber();
    int seedAssist = arguments[2].asNumber();
    auto pathEffect = std::make_shared<JsiSkPathEffect>(
        getContext(), SkDiscretePathEffect::Make(segLength, dec, seedAssist));
    return makeJsiObject(runtime, std::move(pathEffect));
  }

  JSI_HOST_FUNCTION(MakeCompose) {
    auto outer = JsiSkPathEffect::fromValue(runtime, arguments[0]);
    auto inner = JsiSkPathEffect::fromValue(runtime, arguments[1]);
    auto pathEffect = std::make_shared<JsiSkPathEffect>(
        getContext(),
        SkPathEffect::MakeCompose(std::move(outer), std::move(inner)));
    return makeJsiObject(runtime, std::move(pathEffect));
  }

  JSI_HOST_FUNCTION(MakeSum) {
    auto outer = JsiSkPathEffect::fromValue(runtime, arguments[0]);
    auto inner = JsiSkPathEffect::fromValue(runtime, arguments[1]);
    auto pathEffect = std::make_shared<JsiSkPathEffect>(
        getContext(),
        SkPathEffect::MakeSum(std::move(outer), std::move(inner)));
    return makeJsiObject(runtime, std::move(pathEffect));
  }

  JSI_HOST_FUNCTION(MakePath1D) {
    auto path = JsiSkPath::fromValue(runtime, arguments[0]);
    auto advance = arguments[1].asNumber();
    auto phase = arguments[2].asNumber();
    auto style =
        static_cast<SkPath1DPathEffect::Style>(arguments[3].asNumber());
    auto pathEffect = std::make_shared<JsiSkPathEffect>(
        getContext(),
        SkPath1DPathEffect::Make(path->snapshot(), advance, phase, style));
    return makeJsiObject(runtime, std::move(pathEffect));
  }

  JSI_HOST_FUNCTION(MakePath2D) {
    auto matrix = JsiSkMatrix::fromValue(runtime, arguments[0]);
    auto path = JsiSkPath::fromValue(runtime, arguments[1]);
    auto pathEffect = std::make_shared<JsiSkPathEffect>(
        getContext(), SkPath2DPathEffect::Make(*matrix, path->snapshot()));
    return makeJsiObject(runtime, std::move(pathEffect));
  }

  JSI_HOST_FUNCTION(MakeLine2D) {
    auto width = arguments[0].asNumber();
    auto matrix = JsiSkMatrix::fromValue(runtime, arguments[1]);
    auto pathEffect = std::make_shared<JsiSkPathEffect>(
        getContext(), SkLine2DPathEffect::Make(width, *matrix));
    return makeJsiObject(runtime, std::move(pathEffect));
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "MakeCorner",
                      &JsiSkPathEffectFactory::MakeCorner);
    installHostMethod(runtime, prototype, "MakeDash",
                      &JsiSkPathEffectFactory::MakeDash);
    installHostMethod(runtime, prototype, "MakeDiscrete",
                      &JsiSkPathEffectFactory::MakeDiscrete);
    installHostMethod(runtime, prototype, "MakeCompose",
                      &JsiSkPathEffectFactory::MakeCompose);
    installHostMethod(runtime, prototype, "MakeSum",
                      &JsiSkPathEffectFactory::MakeSum);
    installHostMethod(runtime, prototype, "MakeLine2D",
                      &JsiSkPathEffectFactory::MakeLine2D);
    installHostMethod(runtime, prototype, "MakePath1D",
                      &JsiSkPathEffectFactory::MakePath1D);
    installHostMethod(runtime, prototype, "MakePath2D",
                      &JsiSkPathEffectFactory::MakePath2D);
  }

  size_t getMemoryPressure() override { return 1024; }

  explicit JsiSkPathEffectFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkPathEffectFactory>(std::move(context)) {}
};

} // namespace RNSkia
