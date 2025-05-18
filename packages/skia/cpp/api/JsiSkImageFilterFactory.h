#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkImageFilter.h"
#include "JsiSkRuntimeShaderBuilder.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImageFilter.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

inline bool hasOptionalArgument(const jsi::Value *arguments, size_t count,
                               size_t index) {
  return (index < count && !arguments[index].isNull() &&
          !arguments[index].isUndefined());
}

class JsiSkImageFilterFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeBlur) {
    float sigmaX = arguments[0].asNumber();
    float sigmaY = arguments[1].asNumber();
    int tileMode = arguments[2].asNumber();
    sk_sp<SkImageFilter> imageFilter = nullptr;
    if (hasOptionalArgument(arguments, count, 3)) {
      imageFilter = JsiSkImageFilter::fromValue(runtime, arguments[3]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 4)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[4]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(),
                     SkImageFilters::Blur(sigmaX, sigmaY, (SkTileMode)tileMode,
                                          imageFilter, cropRect)));
  }

  JSI_HOST_FUNCTION(MakeColorFilter) {
    auto cf = JsiSkColorFilter::fromValue(runtime, arguments[0]);
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 1)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[1]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 2)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[2]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::ColorFilter(
                                       std::move(cf), std::move(input), cropRect)));
  }

  JSI_HOST_FUNCTION(MakeOffset) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 2)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[2]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 3)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[3]);
    }
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkImageFilter>(
            getContext(), SkImageFilters::Offset(x, y, std::move(input), cropRect)));
  }

  JSI_HOST_FUNCTION(MakeDisplacementMap) {
    auto fXChannelSelector =
        static_cast<SkColorChannel>(arguments[0].asNumber());
    auto fYChannelSelector =
        static_cast<SkColorChannel>(arguments[1].asNumber());
    auto scale = arguments[2].asNumber();
    auto in2 = JsiSkImageFilter::fromValue(runtime, arguments[3]);
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 4)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[4]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 5)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[5]);
    }
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkImageFilter>(
            getContext(), SkImageFilters::DisplacementMap(
                              fXChannelSelector, fYChannelSelector, scale,
                              std::move(in2), std::move(input), cropRect)));
  }

  JSI_HOST_FUNCTION(MakeShader) {
    auto shader = JsiSkShader::fromValue(runtime, arguments[0]);
    SkImageFilters::Dither dither = SkImageFilters::Dither::kNo;
    if (hasOptionalArgument(arguments, count, 1)) {
      dither = arguments[1].asBool() ? SkImageFilters::Dither::kYes
                                   : SkImageFilters::Dither::kNo;
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 2)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[2]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::Shader(std::move(shader), dither, cropRect)));
  }

  JSI_HOST_FUNCTION(MakeCompose) {
    sk_sp<SkImageFilter> outer = nullptr;
    if (hasOptionalArgument(arguments, count, 0)) {
      outer = JsiSkImageFilter::fromValue(runtime, arguments[0]);
    }
    sk_sp<SkImageFilter> inner = nullptr;
    if (hasOptionalArgument(arguments, count, 1)) {
      inner = JsiSkImageFilter::fromValue(runtime, arguments[1]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::Compose(std::move(outer),
                                                           std::move(inner))));
  }

  JSI_HOST_FUNCTION(MakeBlend) {
    auto mode = static_cast<SkBlendMode>(arguments[0].asNumber());
    sk_sp<SkImageFilter> background =
        JsiSkImageFilter::fromValue(runtime, arguments[1]);
    sk_sp<SkImageFilter> foreground = nullptr;

    if (hasOptionalArgument(arguments, count, 2)) {
      foreground = JsiSkImageFilter::fromValue(runtime, arguments[2]);
    }

    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 3)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[3]);
    }

    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::Blend(
                                       std::move(mode), std::move(background),
                                       std::move(foreground), cropRect)));
  }

  JSI_HOST_FUNCTION(MakeDropShadow) {
    auto dx = arguments[0].asNumber();
    auto dy = arguments[1].asNumber();
    auto sigmaX = arguments[2].asNumber();
    auto sigmaY = arguments[3].asNumber();
    auto color = JsiSkColor::fromValue(runtime, arguments[4]);
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 5)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[5]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 6)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[6]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(),
                     SkImageFilters::DropShadow(dx, dy, sigmaX, sigmaY, color,
                                                std::move(input), cropRect)));
  }

  JSI_HOST_FUNCTION(MakeDropShadowOnly) {
    auto dx = arguments[0].asNumber();
    auto dy = arguments[1].asNumber();
    auto sigmaX = arguments[2].asNumber();
    auto sigmaY = arguments[3].asNumber();
    auto color = JsiSkColor::fromValue(runtime, arguments[4]);
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 5)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[5]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 6)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[6]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::DropShadowOnly(
                                       dx, dy, sigmaX, sigmaY, color,
                                       std::move(input), cropRect)));
  }

  JSI_HOST_FUNCTION(MakeErode) {
    auto rx = arguments[0].asNumber();
    auto ry = arguments[1].asNumber();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 2)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[2]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 3)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[3]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::Erode(
                                       rx, ry, std::move(input), cropRect)));
  }

  JSI_HOST_FUNCTION(MakeDilate) {
    auto rx = arguments[0].asNumber();
    auto ry = arguments[1].asNumber();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 2)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[2]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 3)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[3]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::Dilate(
                                       rx, ry, std::move(input), cropRect)));
  }

  JSI_HOST_FUNCTION(MakeRuntimeShader) {
    auto rtb = JsiSkRuntimeShaderBuilder::fromValue(runtime, arguments[0]);

    const char *childName = "";
    if (hasOptionalArgument(arguments, count, 1)) {
      childName = arguments[1].asString(runtime).utf8(runtime).c_str();
    }

    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 2)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[2]);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImageFilter>(
                     getContext(), SkImageFilters::RuntimeShader(
                                       *rtb, childName, std::move(input))));
  }

  JSI_EXPORT_FUNCTIONS(
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeBlur),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeOffset),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeColorFilter),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeShader),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeDisplacementMap),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeCompose),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeErode),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeDilate),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeBlend),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeDropShadow),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeDropShadowOnly),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeRuntimeShader))

  explicit JsiSkImageFilterFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
