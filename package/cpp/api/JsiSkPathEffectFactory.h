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
  JsiSkPathEffectFactory(RNSkPlatformContext *context)
      : JsiSkHostObject(context) {
    installFunction(
        "MakeCorner", JSI_FUNC_SIGNATURE {
          int radius = arguments[0].asNumber();
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkPathEffect>(
                           context, SkCornerPathEffect::Make(radius)));
        });

    installFunction(
        "MakeDash", JSI_FUNC_SIGNATURE {
          auto jsiIntervals = arguments[0].asObject(runtime).asArray(runtime);
          int phase = arguments[1].asNumber();
          auto size = (int)jsiIntervals.size(runtime);
          std::vector<SkScalar> intervals;
          for (int i = 0; i < size; i++) {
            SkScalar interval =
                jsiIntervals.getValueAtIndex(runtime, i).asNumber();
            intervals.push_back(interval);
          }
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkPathEffect>(
                           context, SkDashPathEffect::Make(intervals.data(),
                                                           size, phase)));
        });

    installFunction(
        "MakeDiscrete", JSI_FUNC_SIGNATURE {
          int segLength = arguments[0].asNumber();
          int dec = arguments[1].asNumber();
          int seedAssist = arguments[2].asNumber();
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkPathEffect>(
                           context, SkDiscretePathEffect::Make(segLength, dec,
                                                               seedAssist)));
        });
  }
};

} // namespace RNSkia
