#pragma once

#include "JsiSkColor.h"
#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
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

constexpr int RGBA_RED_PIXEL_INDEX0 = 0;
constexpr int RGBA_RED_PIXEL_INDEX2 = 2;
constexpr int RGBA_BLUE_PIXEL_INDEX10 = 10;
constexpr int RGBA_BLUE_PIXEL_INDEX12 = 12;

class JsiSkColorFilterFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeMatrix) {
    auto jsiMatrix = arguments[0].asObject(runtime).asArray(runtime);
    float matrix[20];
    /*std::vector<std::vector<float>> correctionMatrix;
    for (int i = 0; i < 4; ++i) {
        std::vector<float> temp;
        for (int j = 0; j < 5; ++j) {
            temp.push_back(jsiMatrix.getValueAtIndex(runtime, i * 5 + j).asNumber());
        }
        correctionMatrix.push_back(temp);
    }
    std::swap(correctionMatrix[0], correctionMatrix[2]);
    int index = 0;
    for (const auto& vec : correctionMatrix) {
        for (float value : vec) {
            matrix[index++] = value;
        }
    }*/
    float rc0 = 0.0f;
    float rc2 = 0.0f;
    float bc10 = 0.0f;
    float bc12 = 0.0f;
    for (int i = 0; i < 20; i++) {
        if (i == RGBA_RED_PIXEL_INDEX0) {
            rc0 = jsiMatrix.getValueAtIndex(runtime, i).asNumber();
        }
        if (i == RGBA_RED_PIXEL_INDEX2) {
            rc2 = jsiMatrix.getValueAtIndex(runtime, i).asNumber();
        }
        if (i == RGBA_BLUE_PIXEL_INDEX10) {
            bc10 = jsiMatrix.getValueAtIndex(runtime, i).asNumber();
        }
        if (i == RGBA_BLUE_PIXEL_INDEX12) {
            bc12 = jsiMatrix.getValueAtIndex(runtime, i).asNumber();
        }
        if (jsiMatrix.size(runtime) > i) {
            matrix[i] = jsiMatrix.getValueAtIndex(runtime, i).asNumber();
        }
    }
    matrix[RGBA_RED_PIXEL_INDEX0] = bc10;
    matrix[RGBA_BLUE_PIXEL_INDEX10] = rc0;
    matrix[RGBA_RED_PIXEL_INDEX2] = bc12;
    matrix[RGBA_BLUE_PIXEL_INDEX12] = rc2;

    // Return the newly constructed object
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(), SkColorFilters::Matrix(std::move(matrix))));
  }

  JSI_HOST_FUNCTION(MakeBlend) {
    auto color = JsiSkColor::fromValue(runtime, arguments[0]);
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
                     getContext(), SkColorFilters::Compose(std::move(outer),
                                                           std::move(inner))));
  }

  JSI_HOST_FUNCTION(MakeLerp) {
    auto t = arguments[0].asNumber();
    auto dst = JsiSkColorFilter::fromValue(runtime, arguments[1]);
    auto src = JsiSkColorFilter::fromValue(runtime, arguments[2]);
    // Return the newly constructed object
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkColorFilter>(
                     getContext(),
                     SkColorFilters::Lerp(t, std::move(dst), std::move(src))));
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

  JSI_HOST_FUNCTION(MakeLumaColorFilter) {
    // Return the newly constructed object
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkColorFilter>(getContext(),
                                                    SkLumaColorFilter::Make()));
  }

  JSI_EXPORT_FUNCTIONS(
      JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeMatrix),
      JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeBlend),
      JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeCompose),
      JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeLerp),
      JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeSRGBToLinearGamma),
      JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeLinearToSRGBGamma),
      JSI_EXPORT_FUNC(JsiSkColorFilterFactory, MakeLumaColorFilter))

  explicit JsiSkColorFilterFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};
} // namespace RNSkia
