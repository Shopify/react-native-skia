#pragma once

#include "JsiSkHostObjects.h"
#include "JsiSkImageFilter.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkColorFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkImageFilterFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeBlur) {
    float sigmaX = arguments[0].asNumber();
    float sigmaY = arguments[1].asNumber();
    int tileMode = arguments[2].asNumber();
    sk_sp<SkImageFilter> imageFilter;
    if (!arguments[3].isNull()) {
      imageFilter = JsiSkImageFilter::fromValue(runtime, arguments[3]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(),
                     SkImageFilters::Blur(sigmaX, sigmaY, (SkTileMode)tileMode,
                                          imageFilter)));
  }

  JSI_HOST_FUNCTION(MakeColorFilter) {
    auto cf = JsiSkColorFilter::fromValue(runtime, arguments[0]);
    sk_sp<SkImageFilter> input;
    if (!arguments[1].isNull()) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[1]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::ColorFilter(cf, input)));
  }

  JSI_HOST_FUNCTION(MakeOffset) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    sk_sp<SkImageFilter> input;
    if (!arguments[2].isNull()) {
        input = JsiSkImageFilter::fromValue(runtime, arguments[2]);
    }
    return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkImageFilter>(
                    getContext(), SkImageFilters::Offset(x, y, input)));
  }

  JSI_HOST_FUNCTION(MakeDisplacementMap) {
    auto fXChannelSelector = static_cast<SkColorChannel>(arguments[0].asNumber());
    auto fYChannelSelector = static_cast<SkColorChannel>(arguments[1].asNumber());
    auto scale = arguments[2].asNumber();
    auto in2 = JsiSkImageFilter::fromValue(runtime, arguments[3]);
    sk_sp<SkImageFilter> input;
    if (!arguments[4].isNull()) {
     input = JsiSkImageFilter::fromValue(runtime, arguments[4]);
    }
    return jsi::Object::createFromHostObject(
    runtime,
    std::make_shared<JsiSkImageFilter>(
    getContext(),
                SkImageFilters::DisplacementMap(fXChannelSelector, fYChannelSelector, scale, in2, input)
        )
    );
  }

  JSI_HOST_FUNCTION(MakeShader) {
    auto shader = JsiSkShader::fromValue(runtime, arguments[0]);
    return jsi::Object::createFromHostObject(
                runtime, std::make_shared<JsiSkImageFilter>(
                        getContext(), SkImageFilters::Shader(shader)));
  }

  JSI_HOST_FUNCTION(MakeCompose) {
    sk_sp<SkImageFilter> outer;
    if (!arguments[0].isNull()&& !arguments[0].isUndefined()) {
      outer = JsiSkImageFilter::fromValue(runtime, arguments[0]);
    }
    sk_sp<SkImageFilter> inner;
    if (!arguments[1].isNull() && !arguments[1].isUndefined()) {
      inner = JsiSkImageFilter::fromValue(runtime, arguments[1]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::Compose(outer, inner)));
  }

  JSI_HOST_FUNCTION(MakeDropShadow) {
    auto dx = arguments[0].asNumber();
    auto dy = arguments[1].asNumber();
    auto sigmaX = arguments[2].asNumber();
    auto sigmaY = arguments[3].asNumber();
    auto color = arguments[4].asNumber();
    sk_sp<SkImageFilter> input;
    if (!arguments[5].isNull() && !arguments[5].isUndefined()) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[5]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (count > 6 && !arguments[6].isUndefined()) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[6]);
    }
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkImageFilter>(
            getContext(), SkImageFilters::DropShadow(dx, dy, sigmaX, sigmaY,
                                                     color, input, cropRect)));
  }

  JSI_HOST_FUNCTION(MakeDropShadowOnly) {
    auto dx = arguments[0].asNumber();
    auto dy = arguments[1].asNumber();
    auto sigmaX = arguments[2].asNumber();
    auto sigmaY = arguments[3].asNumber();
    auto color = arguments[4].asNumber();
    sk_sp<SkImageFilter> input;
    if (!arguments[5].isNull() && !arguments[5].isUndefined()) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[5]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (count > 6 && !arguments[6].isUndefined()) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[6]);
    }
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkImageFilter>(
            getContext(), SkImageFilters::DropShadowOnly(dx, dy, sigmaX, sigmaY,
                                                         color, input, cropRect)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeBlur),
                       JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeOffset),
                       JSI_EXPORT_FUNC(JsiSkImageFilterFactory,
                                       MakeColorFilter),
                       JSI_EXPORT_FUNC(JsiSkImageFilterFactory,
                                       MakeShader),
                       JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeDisplacementMap),
                       JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeCompose),
                       JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeDropShadow),
                       JSI_EXPORT_FUNC(JsiSkImageFilterFactory,
                                       MakeDropShadowOnly))

  JsiSkImageFilterFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(context) {}
};

} // namespace RNSkia
