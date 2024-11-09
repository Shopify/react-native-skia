#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#include "DawnContext.h"
#include "JsiSkCanvas.h"
#include "JsiSkImage.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkImage.h"
#include "include/core/SkPixmap.h"
#include "include/core/SkSurface.h"
#include "include/gpu/ganesh/GrDirectContext.h"
#include "include/gpu/graphite/Context.h"
#include "include/gpu/graphite/Surface.h"

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
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkCanvas>(getContext(), getObject()->getCanvas()));
  }

  JSI_HOST_FUNCTION(flush) {
    auto surface = getObject();
	  
//	  std::unique_ptr<skgpu::graphite::Recording> recording = DawnContext::getInstance().fGraphiteRecorder->snap();
//		   if (recording) {
//			   skgpu::graphite::InsertRecordingInfo info;
//			   info.fRecording = recording.get();
//			   DawnContext::getInstance().fGraphiteContext->insertRecording(info);
//			   DawnContext::getInstance().fGraphiteContext->submit(skgpu::graphite::SyncToCpu::kYes);
//		   }
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(makeImageSnapshot) {
    if (count == 1) {
      auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
      // image = getObject()->makeImageSnapshot(SkIRect::MakeXYWH(
      //     rect->x(), rect->y(), rect->width(), rect->height()));
    }
    auto image = SkSurfaces::AsImageCopy(getObject());
    if (image == nullptr) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSurface, width),
                       JSI_EXPORT_FUNC(JsiSkSurface, height),
                       JSI_EXPORT_FUNC(JsiSkSurface, getCanvas),
                       JSI_EXPORT_FUNC(JsiSkSurface, makeImageSnapshot),
                       JSI_EXPORT_FUNC(JsiSkSurface, flush),
                       JSI_EXPORT_FUNC(JsiSkSurface, dispose))
};

} // namespace RNSkia
