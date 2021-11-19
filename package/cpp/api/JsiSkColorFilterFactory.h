#pragma once

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include "JsiSkTypes.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkColorFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkColorFilterFactory : public JsiSkHostObject {
public:
  JsiSkColorFilterFactory(RNSkPlatformContext *context)
      : JsiSkHostObject(context) {
    installFunction(
        "MakeMatrix", JSI_FUNC_SIGNATURE {
          auto jsiMatrix = arguments[0].asObject(runtime).asArray(runtime);
          float matrix[20];
          for (int i = 0; i < 20; i++) {
            if (jsiMatrix.size(runtime) > i) {
              matrix[i] = jsiMatrix.getValueAtIndex(runtime, i).asNumber();
            }
          }
          // Return the newly constructed object
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkColorFilter>(
                           context, SkColorFilters::Matrix(matrix)));
        });

    installFunction(
        "MakeBlend", JSI_FUNC_SIGNATURE {
          auto color = arguments[0].asNumber();
          SkBlendMode blend = (SkBlendMode)arguments[1].asNumber();
          // Return the newly constructed object
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkColorFilter>(
                           context, SkColorFilters::Blend(color, blend)));
        });

    installFunction(
        "MakeCompose", JSI_FUNC_SIGNATURE {
          auto outer = JsiSkColorFilter::fromValue(runtime, arguments[0]);
          auto inner = JsiSkColorFilter::fromValue(runtime, arguments[1]);
          // Return the newly constructed object
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkColorFilter>(
                           context, SkColorFilters::Compose(outer, inner)));
        });

    installFunction(
        "MakeLerp", JSI_FUNC_SIGNATURE {
          auto t = arguments[0].asNumber();
          auto dst = JsiSkColorFilter::fromValue(runtime, arguments[1]);
          auto src = JsiSkColorFilter::fromValue(runtime, arguments[2]);
          // Return the newly constructed object
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkColorFilter>(
                           context, SkColorFilters::Lerp(t, dst, src)));
        });

    installFunction(
        "MakeSRGBToLinearGamma", JSI_FUNC_SIGNATURE {
          // Return the newly constructed object
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkColorFilter>(
                           context, SkColorFilters::SRGBToLinearGamma()));
        });

    installFunction(
        "MakeLinearToSRGBGamma", JSI_FUNC_SIGNATURE {
          // Return the newly constructed object
          return jsi::Object::createFromHostObject(
              runtime, std::make_shared<JsiSkColorFilter>(
                           context, SkColorFilters::LinearToSRGBGamma()));
        });
  }
};

} // namespace RNSkia
