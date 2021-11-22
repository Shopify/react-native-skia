#pragma once

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#include <SkColorFilter.h>
#include <SkImageFilters.h>
#include <SkPerlinNoiseShader.h>

namespace RNSkia {

using namespace facebook;

class JsiSkShaderFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeLinearGradient) {
    auto p1 =
        *JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime)).get();
    auto p2 =
        *JsiSkPoint::fromValue(runtime, arguments[1].asObject(runtime)).get();
    SkPoint pts[] = {p1, p2};

    auto jsiColors = arguments[2].asObject(runtime).asArray(runtime);
    auto size = jsiColors.size(runtime);
    std::vector<SkColor> colors;
    for (int i = 0; i < size; i++) {
      SkColor color = jsiColors.getValueAtIndex(runtime, i).asNumber();
      colors.push_back(color);
    }

    std::vector<SkScalar> positions;
    if (!arguments[3].isNull()) {
      auto jsiPositions = arguments[3].asObject(runtime).asArray(runtime);
      auto positionsSize = jsiPositions.size(runtime);
      for (int i = 0; i < positionsSize; i++) {
        SkColor color = jsiPositions.getValueAtIndex(runtime, i).asNumber();
        positions.push_back(color);
      }
    }

    auto tileMode = (SkTileMode)arguments[4].asNumber();

    sk_sp<SkShader> gradient;
    if (count == 5) {
      gradient = SkGradientShader::MakeLinear(
          pts, colors.data(), positions.data(), (int)size, tileMode);
    } else {
      auto localMatrix =
          arguments[5].isUndefined() || count < 6
              ? nullptr
              : JsiSkMatrix::fromValue(runtime, arguments[5]).get();
      auto flag = count < 7 ? 0 : arguments[6].asNumber();
      gradient =
          SkGradientShader::MakeLinear(pts, colors.data(), positions.data(),
                                       (int)size, tileMode, flag, localMatrix);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), gradient));
  }

  JSI_HOST_FUNCTION(MakeRadialGradient) {
    auto center =
        *JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime)).get();

    auto r = arguments[1].asNumber();

    auto jsiColors = arguments[2].asObject(runtime).asArray(runtime);
    int size = (int)jsiColors.size(runtime);
    std::vector<SkColor> colors;
    for (int i = 0; i < size; i++) {
      SkColor color = jsiColors.getValueAtIndex(runtime, i).asNumber();
      colors.push_back(color);
    }

    std::vector<SkScalar> positions;
    if (!arguments[3].isNull()) {
      auto jsiPositions = arguments[3].asObject(runtime).asArray(runtime);
      auto positionsSize = jsiPositions.size(runtime);
      for (int i = 0; i < positionsSize; i++) {
        SkColor color = jsiPositions.getValueAtIndex(runtime, i).asNumber();
        positions.push_back(color);
      }
    }

    auto tileMode = (SkTileMode)arguments[4].asNumber();

    sk_sp<SkShader> gradient;
    if (count == 5) {
      gradient = SkGradientShader::MakeRadial(center, r, colors.data(),
                                              positions.data(), size, tileMode);
    } else {
      auto localMatrix =
          arguments[5].isUndefined() || count < 6
              ? nullptr
              : JsiSkMatrix::fromValue(runtime, arguments[5]).get();
      auto flag = count < 7 ? 0 : arguments[6].asNumber();
      gradient = SkGradientShader::MakeRadial(center, r, colors.data(),
                                              positions.data(), size, tileMode,
                                              flag, localMatrix);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), gradient));
  }

  JSI_HOST_FUNCTION(MakeSweepGradient) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    auto jsiColors = arguments[2].asObject(runtime).asArray(runtime);
    auto size = jsiColors.size(runtime);
    std::vector<SkColor> colors;
    for (int i = 0; i < size; i++) {
      SkColor color = jsiColors.getValueAtIndex(runtime, i).asNumber();
      colors.push_back(color);
    }

    std::vector<SkScalar> positions;
    if (!arguments[3].isNull()) {
      auto jsiPositions = arguments[3].asObject(runtime).asArray(runtime);
      auto positionsSize = jsiPositions.size(runtime);
      for (int i = 0; i < positionsSize; i++) {
        SkColor color = jsiPositions.getValueAtIndex(runtime, i).asNumber();
        positions.push_back(color);
      }
    }

    auto tileMode = (SkTileMode)arguments[4].asNumber();
    auto flags = count < 7 ? 0 : arguments[6].asNumber();
    auto startAngle =
        (count < 8 || arguments[7].isUndefined()) ? 0 : arguments[7].asNumber();
    auto endAngle = (count < 9 || arguments[8].isUndefined())
                        ? 360
                        : arguments[8].asNumber();
    auto localMatrix =
        arguments[5].isUndefined() || arguments[5].isNull() || count < 6
            ? nullptr
            : JsiSkMatrix::fromValue(runtime, arguments[5]).get();
    sk_sp<SkShader> gradient = SkGradientShader::MakeSweep(
        x, y, colors.data(), positions.data(), (int)size, tileMode, startAngle,
        endAngle, flags, localMatrix);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), gradient));
  }

  JSI_HOST_FUNCTION(MakeTwoPointConicalGradient) {
    auto start =
        *JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime)).get();
    auto startRadius = arguments[1].asNumber();

    auto end =
        *JsiSkPoint::fromValue(runtime, arguments[2].asObject(runtime)).get();
    auto endRadius = arguments[3].asNumber();

    auto jsiColors = arguments[4].asObject(runtime).asArray(runtime);
    auto size = jsiColors.size(runtime);
    std::vector<SkColor> colors;
    for (int i = 0; i < size; i++) {
      SkColor color = jsiColors.getValueAtIndex(runtime, i).asNumber();
      colors.push_back(color);
    }

    std::vector<SkScalar> positions;
    if (!arguments[5].isNull()) {
      auto jsiPositions = arguments[5].asObject(runtime).asArray(runtime);
      auto positionsSize = jsiPositions.size(runtime);
      for (int i = 0; i < positionsSize; i++) {
        SkColor color = jsiPositions.getValueAtIndex(runtime, i).asNumber();
        positions.push_back(color);
      }
    }

    auto tileMode = (SkTileMode)arguments[6].asNumber();

    sk_sp<SkShader> gradient;
    if (count == 7) {
      gradient = SkGradientShader::MakeTwoPointConical(
          start, startRadius, end, endRadius, colors.data(), positions.data(),
          (int)size, tileMode);
    } else {
      auto localMatrix =
          arguments[7].isUndefined() || count < 8
              ? nullptr
              : JsiSkMatrix::fromValue(runtime, arguments[7]).get();
      auto flag = count < 9 ? 0 : arguments[8].asNumber();
      gradient = SkGradientShader::MakeTwoPointConical(
          start, startRadius, end, endRadius, colors.data(), positions.data(),
          (int)size, tileMode, flag, localMatrix);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), gradient));
  }

  JSI_HOST_FUNCTION(MakeTurbulence) {
    auto baseFreqX = arguments[0].asNumber();
    auto baseFreqY = arguments[1].asNumber();
    auto octaves = arguments[2].asNumber();
    auto seed = arguments[3].asNumber();
    auto tileW = arguments[4].asNumber();
    auto tileH = arguments[5].asNumber();
    SkISize size = SkISize::Make(tileW, tileH);
    sk_sp<SkShader> gradient = SkPerlinNoiseShader::MakeTurbulence(
        baseFreqX, baseFreqY, octaves, seed, &size);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), gradient));
  }

  JSI_HOST_FUNCTION(MakeFractalNoise) {
    auto baseFreqX = arguments[0].asNumber();
    auto baseFreqY = arguments[1].asNumber();
    auto octaves = arguments[2].asNumber();
    auto seed = arguments[3].asNumber();
    auto tileW = arguments[4].asNumber();
    auto tileH = arguments[5].asNumber();
    SkISize size = SkISize::Make(tileW, tileH);
    sk_sp<SkShader> gradient = SkPerlinNoiseShader::MakeFractalNoise(
        baseFreqX, baseFreqY, octaves, seed, &size);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), gradient));
  }

  JSI_HOST_FUNCTION(MakeBlend) {
    auto blendMode = (SkBlendMode)arguments[0].asNumber();
    auto one = JsiSkShader::fromValue(runtime, arguments[1]);
    auto two = JsiSkShader::fromValue(runtime, arguments[2]);
    sk_sp<SkShader> gradient = SkShaders::Blend(blendMode, one, two);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), gradient));
  }

  JSI_HOST_FUNCTION(MakeColor) {
    auto color = arguments[0].asNumber();
    sk_sp<SkShader> gradient = SkShaders::Color(color);
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkShader>(getContext(), gradient));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeLinearGradient),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeRadialGradient),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeSweepGradient),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory,
                                       MakeTwoPointConicalGradient),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeTurbulence),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeFractalNoise),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeBlend),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeColor))

  JsiSkShaderFactory(RNSkPlatformContext *context) : JsiSkHostObject(context) {}
};

} // namespace RNSkia
