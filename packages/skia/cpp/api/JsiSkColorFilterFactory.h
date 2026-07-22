#pragma once

#include "JsiSkColor.h"
#include "JsiSkColorFilter.h"
#include "JsiSkNativeObjects.h"
#include <jsi/jsi.h>
#include <memory>
#include <utility>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkColorFilter.h"
#include "include/effects/SkLumaColorFilter.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkColorFilterFactory
    : public JsiSkNativeObject<JsiSkColorFilterFactory> {
public:
  static constexpr const char *CLASS_NAME = "ColorFilterFactory";

  JSI_HOST_FUNCTION(MakeMatrix) {
    auto jsiMatrix = arguments[0].asObject(runtime).asArray(runtime);
    float matrix[20];
    for (int i = 0; i < 20; i++) {
      if (jsiMatrix.size(runtime) > i) {
        matrix[i] = jsiMatrix.getValueAtIndex(runtime, i).asNumber();
      }
    }
    // Return the newly constructed object
    return makeJsiObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::Matrix(std::move(matrix))));
  }

  JSI_HOST_FUNCTION(MakeBlend) {
    auto color = JsiSkColor::fromValue(runtime, arguments[0]);
    SkBlendMode blend = (SkBlendMode)arguments[1].asNumber();
    // Return the newly constructed object
    return makeJsiObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::Blend(color, blend)));
  }

  JSI_HOST_FUNCTION(MakeCompose) {
    auto outer = JsiSkColorFilter::fromValue(runtime, arguments[0]);
    auto inner = JsiSkColorFilter::fromValue(runtime, arguments[1]);
    // Return the newly constructed object
    return makeJsiObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::Compose(std::move(outer),
                                                           std::move(inner))));
  }

  JSI_HOST_FUNCTION(MakeLerp) {
    auto t = arguments[0].asNumber();
    auto dst = JsiSkColorFilter::fromValue(runtime, arguments[1]);
    auto src = JsiSkColorFilter::fromValue(runtime, arguments[2]);
    // Return the newly constructed object
    return makeJsiObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(),
                     SkColorFilters::Lerp(t, std::move(dst), std::move(src))));
  }

  JSI_HOST_FUNCTION(MakeSRGBToLinearGamma) {
    // Return the newly constructed object
    return makeJsiObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::SRGBToLinearGamma()));
  }

  JSI_HOST_FUNCTION(MakeLinearToSRGBGamma) {
    // Return the newly constructed object
    return makeJsiObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::LinearToSRGBGamma()));
  }

  JSI_HOST_FUNCTION(MakeLumaColorFilter) {
    // Return the newly constructed object
    return makeJsiObject(runtime, std::make_shared<JsiSkColorFilter>(
                                      getContext(), SkLumaColorFilter::Make()));
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "MakeMatrix",
                      &JsiSkColorFilterFactory::MakeMatrix);
    installHostMethod(runtime, prototype, "MakeBlend",
                      &JsiSkColorFilterFactory::MakeBlend);
    installHostMethod(runtime, prototype, "MakeCompose",
                      &JsiSkColorFilterFactory::MakeCompose);
    installHostMethod(runtime, prototype, "MakeLerp",
                      &JsiSkColorFilterFactory::MakeLerp);
    installHostMethod(runtime, prototype, "MakeSRGBToLinearGamma",
                      &JsiSkColorFilterFactory::MakeSRGBToLinearGamma);
    installHostMethod(runtime, prototype, "MakeLinearToSRGBGamma",
                      &JsiSkColorFilterFactory::MakeLinearToSRGBGamma);
    installHostMethod(runtime, prototype, "MakeLumaColorFilter",
                      &JsiSkColorFilterFactory::MakeLumaColorFilter);
  }

  explicit JsiSkColorFilterFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkColorFilterFactory>(std::move(context)) {}
};
} // namespace RNSkia
