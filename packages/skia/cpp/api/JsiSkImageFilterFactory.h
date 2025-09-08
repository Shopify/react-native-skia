#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkImageFilter.h"
#include "JsiSkPicture.h"
#include "JsiSkRuntimeShaderBuilder.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImageFilter.h"
#include "include/core/SkPoint3.h"

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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::Blur(sigmaX, sigmaY, (SkTileMode)tileMode,
                                           imageFilter, cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::ColorFilter(std::move(cf), std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::Offset(x, y, std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::DisplacementMap(
                          fXChannelSelector, fYChannelSelector, scale,
                          std::move(in2), std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::Shader(std::move(shader), dither, cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::Compose(std::move(outer), std::move(inner)));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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

    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::Blend(std::move(mode), std::move(background),
                              std::move(foreground), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::DropShadow(dx, dy, sigmaX, sigmaY, color,
                                                 std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::DropShadowOnly(dx, dy, sigmaX, sigmaY, color,
                                       std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::Erode(rx, ry, std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::Dilate(rx, ry, std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::RuntimeShader(*rtb, childName, std::move(input)));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeArithmetic) {
    float k1 = arguments[0].asNumber();
    float k2 = arguments[1].asNumber();
    float k3 = arguments[2].asNumber();
    float k4 = arguments[3].asNumber();
    bool enforcePMColor = arguments[4].asBool();
    sk_sp<SkImageFilter> background = nullptr;
    if (hasOptionalArgument(arguments, count, 5)) {
      background = JsiSkImageFilter::fromValue(runtime, arguments[5]);
    }
    sk_sp<SkImageFilter> foreground = nullptr;
    if (hasOptionalArgument(arguments, count, 6)) {
      foreground = JsiSkImageFilter::fromValue(runtime, arguments[6]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 7)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[7]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::Arithmetic(
                          k1, k2, k3, k4, enforcePMColor, std::move(background),
                          std::move(foreground), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeCrop) {
    SkRect rect = *JsiSkRect::fromValue(runtime, arguments[0]);
    SkTileMode tileMode = SkTileMode::kDecal;
    if (hasOptionalArgument(arguments, count, 1)) {
      tileMode = (SkTileMode)arguments[1].asNumber();
    }
    sk_sp<SkImageFilter> imageFilter = nullptr;
    if (hasOptionalArgument(arguments, count, 2)) {
      imageFilter = JsiSkImageFilter::fromValue(runtime, arguments[2]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::Crop(rect, tileMode, std::move(imageFilter)));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeEmpty) {
    auto filter = std::make_shared<JsiSkImageFilter>(getContext(),
                                                     SkImageFilters::Empty());
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  inline SkPoint3 SkPoint3FromValue(jsi::Runtime &runtime,
                                    const jsi::Value &obj) {
    const auto &object = obj.asObject(runtime);
    auto x = object.getProperty(runtime, "x").asNumber();
    auto y = object.getProperty(runtime, "y").asNumber();
    auto z = object.getProperty(runtime, "z").asNumber();
    return SkPoint3::Make(x, y, z);
  }

  JSI_HOST_FUNCTION(MakeDistantLitDiffuse) {
    SkPoint3 direction = SkPoint3FromValue(runtime, arguments[0]);
    SkColor lightColor = JsiSkColor::fromValue(runtime, arguments[1]);
    float surfaceScale = arguments[2].asNumber();
    float kd = arguments[3].asNumber();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 4)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[4]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 5)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[5]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::DistantLitDiffuse(direction, lightColor, surfaceScale,
                                          kd, std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakePointLitDiffuse) {
    SkPoint3 location = SkPoint3FromValue(runtime, arguments[0]);
    SkColor lightColor = JsiSkColor::fromValue(runtime, arguments[1]);
    float surfaceScale = arguments[2].asNumber();
    float kd = arguments[3].asNumber();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 4)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[4]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 5)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[5]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::PointLitDiffuse(location, lightColor, surfaceScale, kd,
                                        std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeSpotLitDiffuse) {
    SkPoint3 location = SkPoint3FromValue(runtime, arguments[0]);
    SkPoint3 target = SkPoint3FromValue(runtime, arguments[1]);
    float falloffExponent = arguments[2].asNumber();
    float cutoffAngle = arguments[3].asNumber();
    SkColor lightColor = JsiSkColor::fromValue(runtime, arguments[4]);
    float surfaceScale = arguments[5].asNumber();
    float kd = arguments[6].asNumber();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 7)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[7]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 8)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[8]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::SpotLitDiffuse(location, target, falloffExponent,
                                       cutoffAngle, lightColor, surfaceScale,
                                       kd, std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeDistantLitSpecular) {
    SkPoint3 direction = SkPoint3FromValue(runtime, arguments[0]);
    SkColor lightColor = JsiSkColor::fromValue(runtime, arguments[1]);
    float surfaceScale = arguments[2].asNumber();
    float ks = arguments[3].asNumber();
    float shininess = arguments[4].asNumber();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 5)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[5]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 6)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[6]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::DistantLitSpecular(
                          direction, lightColor, surfaceScale, ks, shininess,
                          std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakePointLitSpecular) {
    SkPoint3 location = SkPoint3FromValue(runtime, arguments[0]);
    SkColor lightColor = JsiSkColor::fromValue(runtime, arguments[1]);
    float surfaceScale = arguments[2].asNumber();
    float ks = arguments[3].asNumber();
    float shininess = arguments[4].asNumber();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 5)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[5]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 6)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[6]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::PointLitSpecular(
                          location, lightColor, surfaceScale, ks, shininess,
                          std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeSpotLitSpecular) {
    SkPoint3 location = SkPoint3FromValue(runtime, arguments[0]);
    SkPoint3 target = SkPoint3FromValue(runtime, arguments[1]);
    float falloffExponent = arguments[2].asNumber();
    float cutoffAngle = arguments[3].asNumber();
    SkColor lightColor = JsiSkColor::fromValue(runtime, arguments[4]);
    float surfaceScale = arguments[5].asNumber();
    float ks = arguments[6].asNumber();
    float shininess = arguments[7].asNumber();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 8)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[8]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 9)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[9]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::SpotLitSpecular(
            location, target, falloffExponent, cutoffAngle, lightColor,
            surfaceScale, ks, shininess, std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeImage) {
    sk_sp<SkImage> image = JsiSkImage::fromValue(runtime, arguments[0]);
    SkRect srcRect;
    if (hasOptionalArgument(arguments, count, 1)) {
      srcRect = *JsiSkRect::fromValue(runtime, arguments[1]);
    } else {
      srcRect = SkRect::Make(image->bounds());
    }
    SkRect dstRect;
    if (hasOptionalArgument(arguments, count, 2)) {
      dstRect = *JsiSkRect::fromValue(runtime, arguments[2]);
    } else {
      dstRect = srcRect;
    }
    SkFilterMode filterMode = SkFilterMode::kNearest;
    if (hasOptionalArgument(arguments, count, 3)) {
      filterMode = (SkFilterMode)arguments[3].asNumber();
    }
    SkMipmapMode mipmap = SkMipmapMode::kNone;
    if (hasOptionalArgument(arguments, count, 4)) {
      mipmap = (SkMipmapMode)arguments[4].asNumber();
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::Image(std::move(image), srcRect, dstRect,
                              SkSamplingOptions(filterMode, mipmap)));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeMagnifier) {
    SkRect lensBounds = *JsiSkRect::fromValue(runtime, arguments[0]);
    float zoomAmount = arguments[1].asNumber();
    float inset = arguments[2].asNumber();
    SkFilterMode filterMode = SkFilterMode::kNearest;
    if (hasOptionalArgument(arguments, count, 3)) {
      filterMode = (SkFilterMode)arguments[3].asNumber();
    }
    SkMipmapMode mipmap = SkMipmapMode::kNone;
    if (hasOptionalArgument(arguments, count, 4)) {
      mipmap = (SkMipmapMode)arguments[4].asNumber();
    }
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 5)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[5]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 6)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[6]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::Magnifier(lensBounds, zoomAmount, inset,
                                  SkSamplingOptions(filterMode, mipmap), input,
                                  cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeMatrixConvolution) {
    SkISize kernelSize =
        SkISize::Make(arguments[0].asNumber(), arguments[1].asNumber());
    std::vector<float> kernel;
    auto kernelArray = arguments[2].asObject(runtime).asArray(runtime);
    auto size = kernelArray.size(runtime);
    for (size_t i = 0; i < size; i++) {
      kernel.push_back(kernelArray.getValueAtIndex(runtime, i).asNumber());
    }
    auto gain = arguments[3].asNumber();
    auto bias = arguments[4].asNumber();
    SkIPoint kernelOffset =
        SkIPoint::Make(arguments[5].asNumber(), arguments[6].asNumber());
    auto tileMode = static_cast<SkTileMode>(arguments[7].asNumber());
    bool convolveAlpha = arguments[8].asBool();
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 9)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[9]);
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 10)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[10]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::MatrixConvolution(
                          kernelSize, kernel.data(), gain, bias, kernelOffset,
                          tileMode, convolveAlpha, std::move(input), cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeMatrixTransform) {
    SkMatrix matrix = *JsiSkMatrix::fromValue(runtime, arguments[0]);
    SkFilterMode filterMode = SkFilterMode::kNearest;
    if (hasOptionalArgument(arguments, count, 1)) {
      filterMode = (SkFilterMode)arguments[1].asNumber();
    }
    SkMipmapMode mipmap = SkMipmapMode::kNone;
    if (hasOptionalArgument(arguments, count, 2)) {
      mipmap = (SkMipmapMode)arguments[2].asNumber();
    }
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 3)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[3]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::MatrixTransform(
            matrix, SkSamplingOptions(filterMode, mipmap), std::move(input)));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeMerge) {
    std::vector<sk_sp<SkImageFilter>> filters;
    auto filtersArray = arguments[0].asObject(runtime).asArray(runtime);
    auto filtersCount = filtersArray.size(runtime);
    for (size_t i = 0; i < filtersCount; ++i) {
      auto element = filtersArray.getValueAtIndex(runtime, i);
      if (element.isNull()) {
        filters.push_back(nullptr);
      } else {
        filters.push_back(JsiSkImageFilter::fromValue(runtime, element));
      }
    }
    SkImageFilters::CropRect cropRect = {};
    if (hasOptionalArgument(arguments, count, 1)) {
      cropRect = *JsiSkRect::fromValue(runtime, arguments[1]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(),
        SkImageFilters::Merge(filters.data(), filtersCount, cropRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakePicture) {
    sk_sp<SkPicture> picture = JsiSkPicture::fromValue(runtime, arguments[0]);
    SkRect targetRect;
    if (hasOptionalArgument(arguments, count, 1)) {
      targetRect = *JsiSkRect::fromValue(runtime, arguments[1]);
    } else {
      targetRect = picture ? picture->cullRect() : SkRect::MakeEmpty();
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::Picture(std::move(picture), targetRect));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeRuntimeShaderWithChildren) {
    auto rtb = JsiSkRuntimeShaderBuilder::fromValue(runtime, arguments[0]);
    float maxSampleRadius = arguments[1].asNumber();
    std::vector<std::string> childNames;
    auto childNamesJS = arguments[2].asObject(runtime).asArray(runtime);
    size_t length = childNamesJS.size(runtime);
    for (size_t i = 0; i < length; ++i) {
      auto element = childNamesJS.getValueAtIndex(runtime, i);
      childNames.push_back(element.asString(runtime).utf8(runtime).c_str());
    }
    std::vector<std::string_view> childNamesStringView;
    childNamesStringView.reserve(childNames.size());
    for (const auto &name : childNames) {
      childNamesStringView.push_back(std::string_view(name));
    }

    std::vector<sk_sp<SkImageFilter>> inputs;
    auto inputsJS = arguments[3].asObject(runtime).asArray(runtime);
    if (inputsJS.size(runtime) != length) {
      return jsi::Value::null();
    }
    for (size_t i = 0; i < length; ++i) {
      auto element = inputsJS.getValueAtIndex(runtime, i);
      if (element.isNull()) {
        inputs.push_back(nullptr);
      } else {
        inputs.push_back(JsiSkImageFilter::fromValue(runtime, element));
      }
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::RuntimeShader(*rtb, maxSampleRadius,
                                                    childNamesStringView.data(),
                                                    inputs.data(), length));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(MakeTile) {
    SkRect src = *JsiSkRect::fromValue(runtime, arguments[0]);
    SkRect dst = *JsiSkRect::fromValue(runtime, arguments[1]);
    sk_sp<SkImageFilter> input = nullptr;
    if (hasOptionalArgument(arguments, count, 2)) {
      input = JsiSkImageFilter::fromValue(runtime, arguments[2]);
    }
    auto filter = std::make_shared<JsiSkImageFilter>(
        getContext(), SkImageFilters::Tile(src, dst, std::move(input)));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, filter,
                                                       getContext());
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
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeRuntimeShader),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeArithmetic),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeCrop),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeEmpty),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeImage),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeMagnifier),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeMatrixConvolution),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeMatrixTransform),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeMerge),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakePicture),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeRuntimeShaderWithChildren),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeTile),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeDistantLitDiffuse),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakePointLitDiffuse),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeSpotLitDiffuse),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeDistantLitSpecular),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakePointLitSpecular),
      JSI_EXPORT_FUNC(JsiSkImageFilterFactory, MakeSpotLitSpecular))

  size_t getMemoryPressure() const override { return 2048; }

  explicit JsiSkImageFilterFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
