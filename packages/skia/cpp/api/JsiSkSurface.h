#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#include "JsiSkCanvas.h"
#include "JsiSkImage.h"

#if defined(SK_GRAPHITE)
#include "DawnContext.h"
#endif

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkSurface.h"
#include "include/gpu/ganesh/GrDirectContext.h"

#include "include/private/chromium/GrDeferredDisplayList.h"
#include "include/private/chromium/GrDeferredDisplayListRecorder.h"
#include "include/private/chromium/GrPromiseImageTexture.h"
#include "include/private/chromium/GrSurfaceCharacterization.h"
#include "include/private/chromium/SkImageChromium.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkSurface : public JsiSkWrappingSkPtrHostObject<SkSurface> {
public:
  GrSurfaceCharacterization c;
  sk_sp<GrDeferredDisplayList> ddl;

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
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkCanvas>(getContext(), getObject()->getCanvas()));
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
    if (count == 1) {
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
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_HOST_FUNCTION(getDDL) {
    auto surface = getObject();
    auto dContext = getContext()->getDirectContext();
    // 1. Get surface Characterization
    size_t maxResourceBytes = dContext->getResourceCacheLimit();
    if (!dContext->colorTypeSupportedAsSurface(kRGBA_8888_SkColorType)) {
      throw std::runtime_error("ColorType not supported as surface");
    }

    // Note that Ganesh doesn't make use of the SkImageInfo's alphaType
    SkImageInfo ii = SkImageInfo::Make(256, 256, kRGBA_8888_SkColorType,
                                        kPremul_SkAlphaType, SkColorSpace::MakeSRGB());

    GrBackendFormat backendFormat = dContext->defaultBackendFormat(kRGBA_8888_SkColorType,
                                                                    GrRenderable::kYes);
    if (!backendFormat.isValid()) {
		throw std::runtime_error("Backend format not valid");
    }

	  SkSurfaceProps  surfaceProps(0x0, kUnknown_SkPixelGeometry);
    c = dContext->threadSafeProxy()->createCharacterization(
                                            maxResourceBytes, ii, backendFormat, 1,
															kTopLeft_GrSurfaceOrigin, surfaceProps, skgpu::Mipmapped::kNo,
                                            true, false, skgpu::Protected::kNo,
                                            false,
                                            false);

    if (!c.isValid()) {
      throw std::runtime_error("Characterization failed");
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(drawDDL) {
    auto surface = getObject();
    skgpu::ganesh::DrawDDL(surface, ddl);
    auto context = getContext()->getDirectContext();
      context->flush(surface.get());
      context->submit(GrSyncCpu::kYes);

      return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawExample) {
    GrDeferredDisplayListRecorder recorder(c);
    auto canvas = recorder.getCanvas();
    canvas->clear(SK_ColorCYAN);
    canvas->drawCircle(0, 0, 128, SkPaint());
    ddl = recorder.detach();
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSurface, width),
                       JSI_EXPORT_FUNC(JsiSkSurface, height),
                       JSI_EXPORT_FUNC(JsiSkSurface, getCanvas),
                       JSI_EXPORT_FUNC(JsiSkSurface, makeImageSnapshot),
                       JSI_EXPORT_FUNC(JsiSkSurface, flush),
                       JSI_EXPORT_FUNC(JsiSkSurface, getDDL),
                       JSI_EXPORT_FUNC(JsiSkSurface, drawDDL),
                       JSI_EXPORT_FUNC(JsiSkSurface, drawExample),
                       JSI_EXPORT_FUNC(JsiSkSurface, dispose))
};

} // namespace RNSkia
