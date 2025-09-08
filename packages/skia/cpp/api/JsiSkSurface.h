#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiTextureInfo.h"

#include "JsiSkCanvas.h"
#include "JsiSkImage.h"

#if defined(SK_GRAPHITE)
#include "RNDawnContext.h"
#endif

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkSurface.h"
#include "include/gpu/ganesh/GrDirectContext.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkSurface : public JsiSkWrappingSkPtrHostObject<SkSurface> {
public:
  JsiSkSurface(std::shared_ptr<RNSkPlatformContext> context,
               sk_sp<SkSurface> surface)
      : JsiSkWrappingSkPtrHostObject<SkSurface>(std::move(context),
                                                std::move(surface)) {}

  EXPORT_JSI_API_TYPENAME(JsiSkSurface, Surface)

  // TODO-API: Properties?
  JSI_HOST_FUNCTION(width) { return static_cast<double>(getObject()->width()); }
  JSI_HOST_FUNCTION(height) {
    return static_cast<double>(getObject()->height());
  }

  JSI_HOST_FUNCTION(getCanvas) {
    auto canvas =
        std::make_shared<JsiSkCanvas>(getContext(), getObject()->getCanvas());
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, canvas,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(flush) {
    auto surface = getObject();
#if defined(SK_GRAPHITE)
    auto recording = surface->recorder()->snap();
    DawnContext::getInstance().submitRecording(recording.get());
#else
    if (auto dContext = GrAsDirectContext(surface->recordingContext())) {
      dContext->flushAndSubmit();
    }
#endif
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(makeImageSnapshot) {
    auto surface = getObject();
    sk_sp<SkImage> image;
    if (count > 0 && arguments[0].isObject()) {
      auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
      image = surface->makeImageSnapshot(SkIRect::MakeXYWH(
          rect->x(), rect->y(), rect->width(), rect->height()));
    } else {
      image = surface->makeImageSnapshot();
    }
#if defined(SK_GRAPHITE)
    auto recording = surface->recorder()->snap();
    DawnContext::getInstance().submitRecording(recording.get());
#endif
    if (count > 1 && arguments[1].isObject()) {
      auto jsiImage =
          arguments[1].asObject(runtime).asHostObject<JsiSkImage>(runtime);
      jsiImage->setObject(image);
      return jsi::Value(runtime, arguments[1]);
    }
    auto hostObjectInstance =
        std::make_shared<JsiSkImage>(getContext(), std::move(image));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(getNativeTextureUnstable) {
    auto texInfo = getContext()->getTexture(getObject());
    return JsiTextureInfo::toValue(runtime, texInfo);
  }

  size_t getMemoryPressure() const override {
    auto surface = getObject();
    if (!surface)
      return 0;

    // Surface memory is primarily the pixel buffer: width × height × bytes per
    // pixel
    int width = surface->width();
    int height = surface->height();
    // Assume 4 bytes per pixel (RGBA) for most surfaces
    return width * height * 4;
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSurface, width),
                       JSI_EXPORT_FUNC(JsiSkSurface, height),
                       JSI_EXPORT_FUNC(JsiSkSurface, getCanvas),
                       JSI_EXPORT_FUNC(JsiSkSurface, makeImageSnapshot),
                       JSI_EXPORT_FUNC(JsiSkSurface, flush),
                       JSI_EXPORT_FUNC(JsiSkSurface, getNativeTextureUnstable),
                       JSI_EXPORT_FUNC(JsiSkSurface, dispose))
};

} // namespace RNSkia
