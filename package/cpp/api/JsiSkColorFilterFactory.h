#pragma once

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkColorFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkColorFilterFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeMatrix) {
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
                     getContext(), SkColorFilters::Matrix(matrix)));
  }

  JSI_HOST_FUNCTION(MakeBlend) {
    auto color = arguments[0].asNumber();
    SkBlendMode blend = (SkBlendMode)arguments[1].asNumber();
    // Return the newly constructed object
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::Blend(color, blend)));
  }

  JSI_HOST_FUNCTION(MakeCompose) {
    auto outer = JsiSkColorFilter::fromValue(runtime, arguments[0]);
    auto inner = JsiSkColorFilter::fromValue(runtime, arguments[1]);
    // Return the newly constructed object
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::Compose(outer, inner)));
  }

  JSI_HOST_FUNCTION(MakeLerp) {
    auto t = arguments[0].asNumber();
    auto dst = JsiSkColorFilter::fromValue(runtime, arguments[1]);
    auto src = JsiSkColorFilter::fromValue(runtime, arguments[2]);
    // Return the newly constructed object
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::Lerp(t, dst, src)));
  }

  JSI_HOST_FUNCTION(MakeSRGBToLinearGamma) {
    // Return the newly constructed object
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::SRGBToLinearGamma()));
  }

  JSI_HOST_FUNCTION(MakeLinearToSRGBGamma) {
    // Return the newly constructed object
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::LinearToSRGBGamma()));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeMatrix),
                       JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeBlend),
                       JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeCompose),
                       JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeLerp),
                       JSI_EXPORT_FUNC(JsiSkColorFilterFactory,
                                       MakeSRGBToLinearGamma),
                       JSI_EXPORT_FUNC(JsiSkColorFilterFactory,
                                       MakeLinearToSRGBGamma))

  JsiSkColorFilterFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(context) {}
};
} // namespace RNSkia
