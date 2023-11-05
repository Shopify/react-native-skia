#pragma once

#include <memory>
#include <string>
#include <utility>

#include "JsiSkHostObjects.h"
#include "JsiSkMatrix.h"
#include "JsiSkShader.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkBase64.h"
#include "SkImage.h"
#include "SkStream.h"
#include "include/codec/SkEncodedImageFormat.h"
#include "include/encode/SkJpegEncoder.h"
#include "include/encode/SkPngEncoder.h"
#include "include/encode/SkWebpEncoder.h"

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkImage : public JsiSkWrappingSkPtrHostObject<SkImage> {
private:
  double lerp(double a, double b, double t) {
    return (a * (1.0 - t)) + (b * t);
  }

public:
  // TODO-API: Properties?
  JSI_HOST_FUNCTION(width) { return static_cast<double>(getObject()->width()); }
  JSI_HOST_FUNCTION(height) {
    return static_cast<double>(getObject()->height());
  }

  JSI_HOST_FUNCTION(makeShaderOptions) {
    auto tmx = (SkTileMode)arguments[0].asNumber();
    auto tmy = (SkTileMode)arguments[1].asNumber();
    auto fm = (SkFilterMode)arguments[2].asNumber();
    auto mm = (SkMipmapMode)arguments[3].asNumber();
    auto m = count > 4 && !arguments[4].isUndefined()
                 ? JsiSkMatrix::fromValue(runtime, arguments[4]).get()
                 : nullptr;
    auto shader =
        getObject()->makeShader(tmx, tmy, SkSamplingOptions(fm, mm), m);
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkShader>(getContext(), std::move(shader)));
  }

  JSI_HOST_FUNCTION(makeShaderCubic) {
    auto tmx = (SkTileMode)arguments[0].asNumber();
    auto tmy = (SkTileMode)arguments[1].asNumber();
    auto B = SkDoubleToScalar(arguments[2].asNumber());
    auto C = SkDoubleToScalar(arguments[3].asNumber());
    auto m = count > 4 && !arguments[4].isUndefined()
                 ? JsiSkMatrix::fromValue(runtime, arguments[4]).get()
                 : nullptr;
    auto shader =
        getObject()->makeShader(tmx, tmy, SkSamplingOptions({B, C}), m);
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkShader>(getContext(), std::move(shader)));
  }

  sk_sp<SkData> encodeImageData(const jsi::Value *arguments, size_t count) {
    // Get optional parameters
    auto format =
        count >= 1 ? static_cast<SkEncodedImageFormat>(arguments[0].asNumber())
                   : SkEncodedImageFormat::kPNG;

    auto quality = count == 2 ? arguments[1].asNumber() : 100.0;
    auto image = getObject();
    if (image->isTextureBacked()) {
      image = image->makeNonTextureImage();
    }
    sk_sp<SkData> data;

    if (format == SkEncodedImageFormat::kJPEG) {
      SkJpegEncoder::Options options;
      options.fQuality = quality;
      data = SkJpegEncoder::Encode(nullptr, image.get(), options);
    } else if (format == SkEncodedImageFormat::kWEBP) {
      const bool lossy = count == 3 ? arguments[2].asBool() : true;

      SkWebpEncoder::Options options;
      options.fQuality = quality;
      options.fCompression = lossy ? SkWebpEncoder::Compression::kLossy
                                   : SkWebpEncoder::Compression::kLossless;
      data = SkWebpEncoder::Encode(nullptr, image.get(), options);
    } else {
      const double t = quality / 100.0;
      const int level = static_cast<int>(std::round(lerp(9.0, 0.0, t)));

      SkPngEncoder::Options options;
      // must be in [0, 9] where 9 corresponds to maximal compression.
      options.fZLibLevel = level;
      data = SkPngEncoder::Encode(nullptr, image.get(), options);
    }

    return data;
  }

  JSI_HOST_FUNCTION(encodeToBytes) {
    auto data = encodeImageData(arguments, count);

    auto arrayCtor =
        runtime.global().getPropertyAsFunction(runtime, "Uint8Array");
    size_t size = data->size();

    jsi::Object array =
        arrayCtor.callAsConstructor(runtime, static_cast<double>(size))
            .getObject(runtime);
    jsi::ArrayBuffer buffer =
        array.getProperty(runtime, jsi::PropNameID::forAscii(runtime, "buffer"))
            .asObject(runtime)
            .getArrayBuffer(runtime);

    auto bfrPtr = reinterpret_cast<uint8_t *>(buffer.data(runtime));
    memcpy(bfrPtr, data->bytes(), size);
    return array;
  }

  JSI_HOST_FUNCTION(encodeToBase64) {
    auto data = encodeImageData(arguments, count);

    auto len = SkBase64::Encode(data->bytes(), data->size(), nullptr);
    auto buffer = std::string(len, 0);
    SkBase64::Encode(data->bytes(), data->size(),
                     reinterpret_cast<void *>(&buffer[0]));
    return jsi::String::createFromAscii(runtime, buffer);
  }

  JSI_HOST_FUNCTION(makeNonTextureImage) {
    auto image = getObject()->makeNonTextureImage();
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  EXPORT_JSI_API_TYPENAME(JsiSkImage, Image)

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkImage, width),
                       JSI_EXPORT_FUNC(JsiSkImage, height),
                       JSI_EXPORT_FUNC(JsiSkImage, makeShaderOptions),
                       JSI_EXPORT_FUNC(JsiSkImage, makeShaderCubic),
                       JSI_EXPORT_FUNC(JsiSkImage, encodeToBytes),
                       JSI_EXPORT_FUNC(JsiSkImage, encodeToBase64),
                       JSI_EXPORT_FUNC(JsiSkImage, makeNonTextureImage),
                       JSI_EXPORT_FUNC(JsiSkImage, dispose))

  JsiSkImage(std::shared_ptr<RNSkPlatformContext> context,
             const sk_sp<SkImage> image)
      : JsiSkWrappingSkPtrHostObject<SkImage>(std::move(context),
                                              std::move(image)) {}
};

} // namespace RNSkia
