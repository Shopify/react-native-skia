#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#include "JsiSkCanvas.h"
#include "JsiSkImage.h"
#include "JsiSkSurfaceFactory.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkBitmap.h"
#include "SkSurface.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkSurface : public JsiSkWrappingSkPtrHostObject<SkSurface> {
public:
  JsiSkSurface(std::shared_ptr<RNSkPlatformContext> context,
               sk_sp<SkSurface> surface)
      : JsiSkWrappingSkPtrHostObject<SkSurface>(std::move(context),
                                                std::move(surface)) {}

  EXPORT_JSI_API_TYPENAME(JsiSkSurface, "Surface")

  JSI_HOST_FUNCTION(getCanvas) {
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkCanvas>(getContext(), getObject()->getCanvas()));
  }

  JSI_HOST_FUNCTION(flush) {
    getObject()->flush();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(makeImageSnapshot) {
    sk_sp<SkImage> image;
    if (count == 1) {
      auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
      image = getObject()->makeImageSnapshot(SkIRect::MakeXYWH(
          rect->x(), rect->y(), rect->width(), rect->height()));
    } else {
      image = getObject()->makeImageSnapshot();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_HOST_FUNCTION(readPixels) {
    auto surface = getObject();

    int width = surface->width();
    int height = surface->height();
    SkImageInfo info =
        SkImageInfo::Make(width, height, kN32_SkColorType, kPremul_SkAlphaType);

    SkBitmap bitmap;
    bitmap.setInfo(info);
    bitmap.allocPixels();
    if (!surface->readPixels(bitmap, 0, 0)) {
      throw jsi::JSError(runtime, "Failed to read pixels from surface");
    }

    // Get a pointer to the bitmap's pixel data
    const uint8_t *pixels =
        reinterpret_cast<const uint8_t *>(bitmap.getPixels());

    // Calculate the size of the pixel data in bytes
    size_t size = bitmap.computeByteSize();

    auto arrayCtor =
        runtime.global().getPropertyAsFunction(runtime, "Uint8Array");
    jsi::Object array =
        arrayCtor.callAsConstructor(runtime, static_cast<double>(size))
            .getObject(runtime);
    jsi::ArrayBuffer buffer =
        array.getProperty(runtime, jsi::PropNameID::forAscii(runtime, "buffer"))
            .asObject(runtime)
            .getArrayBuffer(runtime);

    auto bfrPtr = reinterpret_cast<uint8_t *>(buffer.data(runtime));
    memcpy(bfrPtr, pixels, size);
    return array;
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSurface, getCanvas),
                       JSI_EXPORT_FUNC(JsiSkSurface, makeImageSnapshot),
                       JSI_EXPORT_FUNC(JsiSkSurface, readPixels),
                       JSI_EXPORT_FUNC(JsiSkSurface, flush),
                       JSI_EXPORT_FUNC(JsiSkSurface, dispose))
};

} // namespace RNSkia
