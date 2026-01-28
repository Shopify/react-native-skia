#pragma once

#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkColorFilter.h"
#include "include/effects/SkGradient.h"
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

std::vector<float> getPositions(jsi::Runtime &runtime,
                                const jsi::Value &value) {
  std::vector<float> positions;
  if (!value.isNull()) {
    auto jsiPositions = value.asObject(runtime).asArray(runtime);
    auto size = jsiPositions.size(runtime);
    positions.reserve(size);
    for (int i = 0; i < size; i++) {
      float position = jsiPositions.getValueAtIndex(runtime, i).asNumber();
      positions.push_back(position);
    }
  }
  return positions;
}

class JsiSkShaderFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeLinearGradient) {
    auto p1 =
        *JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime)).get();
    auto p2 =
        *JsiSkPoint::fromValue(runtime, arguments[1].asObject(runtime)).get();
    SkPoint pts[] = {p1, p2};

    std::vector<SkColor4f> colors = getColors(runtime, arguments[2]);
    if (colors.size() < 2) {
      throw std::invalid_argument("colors must have at least 2 colors");
    }
    std::vector<float> positions = getPositions(runtime, arguments[3]);
    if (!positions.empty() && positions.size() != colors.size()) {
      throw std::invalid_argument(
          "positions must be empty or have the same size as colors");
    }
    auto tileMode = getTileMode(arguments, 4, count);
    auto flag = getFlag(arguments, 6, count);
    auto localMatrix = getLocalMatrix(runtime, arguments, 5, count);

    SkGradient::Colors gradColors(
        SkSpan(colors.data(), colors.size()),
        SkSpan(positions.data(), positions.size()), tileMode);
    SkGradient grad(gradColors, SkGradient::Interpolation::FromFlags(flag));
    sk_sp<SkShader> gradient = SkShaders::LinearGradient(pts, grad, localMatrix);
    auto shader =
        std::make_shared<JsiSkShader>(getContext(), std::move(gradient));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, shader,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeRadialGradient) {
    auto center =
        *JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime)).get();
    float r = arguments[1].asNumber();

    std::vector<SkColor4f> colors = getColors(runtime, arguments[2]);
    if (colors.size() < 2) {
      throw std::invalid_argument("colors must have at least 2 colors");
    }
    std::vector<float> positions = getPositions(runtime, arguments[3]);
    if (!positions.empty() && positions.size() != colors.size()) {
      throw std::invalid_argument(
          "positions must be empty or the same size as colors");
    }
    auto tileMode = getTileMode(arguments, 4, count);
    auto flag = getFlag(arguments, 6, count);
    auto localMatrix = getLocalMatrix(runtime, arguments, 5, count);

    SkGradient::Colors gradColors(
        SkSpan(colors.data(), colors.size()),
        SkSpan(positions.data(), positions.size()), tileMode);
    SkGradient grad(gradColors, SkGradient::Interpolation::FromFlags(flag));
    sk_sp<SkShader> gradient =
        SkShaders::RadialGradient(center, r, grad, localMatrix);
    auto shader =
        std::make_shared<JsiSkShader>(getContext(), std::move(gradient));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, shader,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeSweepGradient) {
    float x = arguments[0].asNumber();
    float y = arguments[1].asNumber();
    std::vector<SkColor4f> colors = getColors(runtime, arguments[2]);
    if (colors.size() < 2) {
      throw std::invalid_argument("colors must have at least 2 colors");
    }
    std::vector<float> positions = getPositions(runtime, arguments[3]);
    if (!positions.empty() && positions.size() != colors.size()) {
      throw std::invalid_argument(
          "positions must be empty or the same size as colors");
    }
    auto tileMode = getTileMode(arguments, 4, count);
    auto localMatrix = getLocalMatrix(runtime, arguments, 5, count);
    auto flag = getFlag(arguments, 6, count);
    float startAngle =
        (count < 8 || arguments[7].isUndefined()) ? 0 : arguments[7].asNumber();
    float endAngle = (count < 9 || arguments[8].isUndefined())
                         ? 360
                         : arguments[8].asNumber();

    SkGradient::Colors gradColors(
        SkSpan(colors.data(), colors.size()),
        SkSpan(positions.data(), positions.size()), tileMode);
    SkGradient grad(gradColors, SkGradient::Interpolation::FromFlags(flag));
    sk_sp<SkShader> gradient =
        SkShaders::SweepGradient({x, y}, startAngle, endAngle, grad, localMatrix);
    auto shader =
        std::make_shared<JsiSkShader>(getContext(), std::move(gradient));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, shader,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeTwoPointConicalGradient) {
    auto start =
        *JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime)).get();
    float startRadius = arguments[1].asNumber();

    auto end =
        *JsiSkPoint::fromValue(runtime, arguments[2].asObject(runtime)).get();
    float endRadius = arguments[3].asNumber();

    std::vector<SkColor4f> colors = getColors(runtime, arguments[4]);
    if (colors.size() < 2) {
      throw std::invalid_argument("colors must have at least 2 colors");
    }
    std::vector<float> positions = getPositions(runtime, arguments[5]);
    if (!positions.empty() && positions.size() != colors.size()) {
      throw std::invalid_argument(
          "positions must be empty or the same size as colors");
    }
    auto tileMode = getTileMode(arguments, 6, count);
    auto localMatrix = getLocalMatrix(runtime, arguments, 7, count);
    auto flag = getFlag(arguments, 8, count);

    SkGradient::Colors gradColors(
        SkSpan(colors.data(), colors.size()),
        SkSpan(positions.data(), positions.size()), tileMode);
    SkGradient grad(gradColors, SkGradient::Interpolation::FromFlags(flag));
    sk_sp<SkShader> gradient =
        SkShaders::TwoPointConicalGradient(start, startRadius, end, endRadius, grad, localMatrix);

    auto shader =
        std::make_shared<JsiSkShader>(getContext(), std::move(gradient));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, shader,
                                                       getContext());
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
    auto shader =
        std::make_shared<JsiSkShader>(getContext(), std::move(gradient));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, shader,
                                                       getContext());
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
    auto shader =
        std::make_shared<JsiSkShader>(getContext(), std::move(gradient));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, shader,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeBlend) {
    auto blendMode = (SkBlendMode)arguments[0].asNumber();
    auto one = JsiSkShader::fromValue(runtime, arguments[1]);
    auto two = JsiSkShader::fromValue(runtime, arguments[2]);
    sk_sp<SkShader> gradient = SkShaders::Blend(blendMode, one, two);
    auto shader =
        std::make_shared<JsiSkShader>(getContext(), std::move(gradient));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, shader,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeColor) {
    auto color = JsiSkColor::fromValue(runtime, arguments[0]);
    sk_sp<SkShader> gradient = SkShaders::Color(color);
    auto shader =
        std::make_shared<JsiSkShader>(getContext(), std::move(gradient));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, shader,
                                                       getContext());
  }

  size_t getMemoryPressure() const override { return 1024; }

  std::string getObjectType() const override { return "JsiSkShaderFactory"; }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeLinearGradient),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeRadialGradient),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeSweepGradient),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory,
                                       MakeTwoPointConicalGradient),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeTurbulence),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeFractalNoise),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeBlend),
                       JSI_EXPORT_FUNC(JsiSkShaderFactory, MakeColor))

  explicit JsiSkShaderFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
