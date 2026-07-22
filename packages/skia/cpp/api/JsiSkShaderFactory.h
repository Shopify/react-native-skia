#pragma once

#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include "JsiSkNativeObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkColorFilter.h"
#include "include/effects/SkImageFilters.h"
#include "include/effects/SkPerlinNoiseShader.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

int getFlag(const jsi::Value *values, int i, size_t size) {
  if (i >= size || values[i].isUndefined()) {
    return 0;
  }
  return values[i].asNumber();
}

SkMatrix *getLocalMatrix(jsi::Runtime &runtime, const jsi::Value *values, int i,
                         size_t size) {
  if (i >= size || values[i].isUndefined()) {
    return nullptr;
  }
  return JsiSkMatrix::fromValue(runtime, values[i]).get();
}

SkTileMode getTileMode(const jsi::Value *values, int i, size_t size) {
  if (i >= size || values[i].isUndefined()) {
    return SkTileMode::kClamp;
  }
  return static_cast<SkTileMode>(values[i].asNumber());
}

std::vector<SkColor4f> getColors(jsi::Runtime &runtime,
                                 const jsi::Value &value) {
  std::vector<SkColor4f> colors;
  if (!value.isNull()) {
    auto jsiColors = value.asObject(runtime).asArray(runtime);
    auto size = jsiColors.size(runtime);
    colors.reserve(size);
    for (int i = 0; i < size; i++) {
      SkColor color =
          JsiSkColor::fromValue(runtime, jsiColors.getValueAtIndex(runtime, i));
      colors.push_back(SkColor4f::FromColor(color));
    }
  }
  return colors;
}

std::vector<SkScalar> getPositions(jsi::Runtime &runtime,
                                   const jsi::Value &value) {
  std::vector<SkScalar> positions;
  if (!value.isNull()) {
    auto jsiPositions = value.asObject(runtime).asArray(runtime);
    auto size = jsiPositions.size(runtime);
    positions.reserve(size);
    for (int i = 0; i < size; i++) {
      SkScalar position = jsiPositions.getValueAtIndex(runtime, i).asNumber();
      positions.push_back(position);
    }
  }
  return positions;
}

class JsiSkShaderFactory : public JsiSkNativeObject<JsiSkShaderFactory> {
public:
  static constexpr const char *CLASS_NAME = "ShaderFactory";

  JSI_HOST_FUNCTION(MakeLinearGradient) {
    auto p1 =
        *JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime)).get();
    auto p2 =
        *JsiSkPoint::fromValue(runtime, arguments[1].asObject(runtime)).get();
    SkPoint pts[] = {p1, p2};

    std::vector<SkColor4f> colors = getColors(runtime, arguments[2]);
    auto colorsSize = colors.size();
    if (colorsSize < 2) {
      throw std::invalid_argument("colors must have at least 2 colors");
    }
    std::vector<SkScalar> positions = getPositions(runtime, arguments[3]);
    if (!positions.empty() && positions.size() != colorsSize) {
      throw std::invalid_argument(
          "positions must be empty or have the same size as colors");
    }
    auto tileMode = getTileMode(arguments, 4, count);
    auto flag = getFlag(arguments, 6, count);
    auto localMatrix = getLocalMatrix(runtime, arguments, 5, count);

    SkGradient::Colors gradColors(
        SkSpan(colors),
        !positions.empty()
            ? SkSpan<const float>(positions.data(), positions.size())
            : SkSpan<const float>(),
        tileMode);
    SkGradient grad(gradColors, SkGradient::Interpolation::FromFlags(flag));
    sk_sp<SkShader> gradient =
        SkShaders::LinearGradient(pts, grad, localMatrix);
    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(gradient)));
  }

  JSI_HOST_FUNCTION(MakeRadialGradient) {
    auto center =
        *JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime)).get();
    auto r = arguments[1].asNumber();

    std::vector<SkColor4f> colors = getColors(runtime, arguments[2]);
    auto colorsSize = colors.size();
    if (colorsSize < 2) {
      throw std::invalid_argument("colors must have at least 2 colors");
    }
    std::vector<SkScalar> positions = getPositions(runtime, arguments[3]);
    if (!positions.empty() && positions.size() != colorsSize) {
      throw std::invalid_argument(
          "positions must be empty or the same size as colors");
    }
    auto tileMode = getTileMode(arguments, 4, count);
    auto flag = getFlag(arguments, 6, count);
    auto localMatrix = getLocalMatrix(runtime, arguments, 5, count);

    SkGradient::Colors gradColors(
        SkSpan(colors),
        !positions.empty()
            ? SkSpan<const float>(positions.data(), positions.size())
            : SkSpan<const float>(),
        tileMode);
    SkGradient grad(gradColors, SkGradient::Interpolation::FromFlags(flag));
    sk_sp<SkShader> gradient =
        SkShaders::RadialGradient(center, r, grad, localMatrix);
    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(gradient)));
  }

  JSI_HOST_FUNCTION(MakeSweepGradient) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    std::vector<SkColor4f> colors = getColors(runtime, arguments[2]);
    auto colorsSize = colors.size();
    if (colorsSize < 2) {
      throw std::invalid_argument("colors must have at least 2 colors");
    }
    std::vector<SkScalar> positions = getPositions(runtime, arguments[3]);
    if (!positions.empty() && positions.size() != colorsSize) {
      throw std::invalid_argument(
          "positions must be empty or the same size as colors");
    }
    auto tileMode = getTileMode(arguments, 4, count);
    auto localMatrix = getLocalMatrix(runtime, arguments, 5, count);
    auto flag = getFlag(arguments, 6, count);
    auto startAngle = (count < 8 || arguments[7].isUndefined())
                          ? 0.0f
                          : static_cast<float>(arguments[7].asNumber());
    auto endAngle = (count < 9 || arguments[8].isUndefined())
                        ? 360.0f
                        : static_cast<float>(arguments[8].asNumber());

    SkGradient::Colors gradColors(
        SkSpan(colors),
        !positions.empty()
            ? SkSpan<const float>(positions.data(), positions.size())
            : SkSpan<const float>(),
        tileMode);
    SkGradient grad(gradColors, SkGradient::Interpolation::FromFlags(flag));
    sk_sp<SkShader> gradient = SkShaders::SweepGradient(
        SkPoint::Make(x, y), startAngle, endAngle, grad, localMatrix);
    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(gradient)));
  }

  JSI_HOST_FUNCTION(MakeTwoPointConicalGradient) {
    auto start =
        *JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime)).get();
    auto startRadius = arguments[1].asNumber();

    auto end =
        *JsiSkPoint::fromValue(runtime, arguments[2].asObject(runtime)).get();
    auto endRadius = arguments[3].asNumber();

    std::vector<SkColor4f> colors = getColors(runtime, arguments[4]);
    auto colorsSize = colors.size();
    if (colorsSize < 2) {
      throw std::invalid_argument("colors must have at least 2 colors");
    }
    std::vector<SkScalar> positions = getPositions(runtime, arguments[5]);
    if (!positions.empty() && positions.size() != colorsSize) {
      throw std::invalid_argument(
          "positions must be empty or the same size as colors");
    }
    auto tileMode = getTileMode(arguments, 6, count);
    auto localMatrix = getLocalMatrix(runtime, arguments, 7, count);
    auto flag = getFlag(arguments, 8, count);

    SkGradient::Colors gradColors(
        SkSpan(colors),
        !positions.empty()
            ? SkSpan<const float>(positions.data(), positions.size())
            : SkSpan<const float>(),
        tileMode);
    SkGradient grad(gradColors, SkGradient::Interpolation::FromFlags(flag));
    sk_sp<SkShader> gradient = SkShaders::TwoPointConicalGradient(
        start, startRadius, end, endRadius, grad, localMatrix);

    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(gradient)));
  }

  JSI_HOST_FUNCTION(MakeTurbulence) {
    auto baseFreqX = arguments[0].asNumber();
    auto baseFreqY = arguments[1].asNumber();
    auto octaves = arguments[2].asNumber();
    auto seed = arguments[3].asNumber();
    auto tileW = arguments[4].asNumber();
    auto tileH = arguments[5].asNumber();
    SkISize size = SkISize::Make(tileW, tileH);
    sk_sp<SkShader> gradient =
        SkShaders::MakeTurbulence(baseFreqX, baseFreqY, octaves, seed, &size);
    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(gradient)));
  }

  JSI_HOST_FUNCTION(MakeFractalNoise) {
    auto baseFreqX = arguments[0].asNumber();
    auto baseFreqY = arguments[1].asNumber();
    auto octaves = arguments[2].asNumber();
    auto seed = arguments[3].asNumber();
    auto tileW = arguments[4].asNumber();
    auto tileH = arguments[5].asNumber();
    SkISize size = SkISize::Make(tileW, tileH);
    sk_sp<SkShader> gradient =
        SkShaders::MakeFractalNoise(baseFreqX, baseFreqY, octaves, seed, &size);
    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(gradient)));
  }

  JSI_HOST_FUNCTION(MakeBlend) {
    auto blendMode = (SkBlendMode)arguments[0].asNumber();
    auto one = JsiSkShader::fromValue(runtime, arguments[1]);
    auto two = JsiSkShader::fromValue(runtime, arguments[2]);
    sk_sp<SkShader> gradient = SkShaders::Blend(blendMode, one, two);
    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(gradient)));
  }

  JSI_HOST_FUNCTION(MakeColor) {
    auto color = JsiSkColor::fromValue(runtime, arguments[0]);
    sk_sp<SkShader> gradient = SkShaders::Color(color);
    return makeJsiObject(runtime, std::make_shared<JsiSkShader>(
                                      getContext(), std::move(gradient)));
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "MakeLinearGradient",
                      &JsiSkShaderFactory::MakeLinearGradient);
    installHostMethod(runtime, prototype, "MakeRadialGradient",
                      &JsiSkShaderFactory::MakeRadialGradient);
    installHostMethod(runtime, prototype, "MakeSweepGradient",
                      &JsiSkShaderFactory::MakeSweepGradient);
    installHostMethod(runtime, prototype, "MakeTwoPointConicalGradient",
                      &JsiSkShaderFactory::MakeTwoPointConicalGradient);
    installHostMethod(runtime, prototype, "MakeTurbulence",
                      &JsiSkShaderFactory::MakeTurbulence);
    installHostMethod(runtime, prototype, "MakeFractalNoise",
                      &JsiSkShaderFactory::MakeFractalNoise);
    installHostMethod(runtime, prototype, "MakeBlend",
                      &JsiSkShaderFactory::MakeBlend);
    installHostMethod(runtime, prototype, "MakeColor",
                      &JsiSkShaderFactory::MakeColor);
  }

  explicit JsiSkShaderFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkShaderFactory>(std::move(context)) {}
};

} // namespace RNSkia
