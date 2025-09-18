#pragma once

#include <memory>

#include "JsiSkCanvas.h"
#include "JsiSkHostObjects.h"
#include "JsiSkPicture.h"
#include "JsiSkRect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkBBHFactory.h"
#include "include/core/SkPictureRecorder.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPictureRecorder
    : public JsiSkWrappingSharedPtrHostObject<SkPictureRecorder> {
public:
  explicit JsiSkPictureRecorder(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkWrappingSharedPtrHostObject<SkPictureRecorder>(
            context, std::make_shared<SkPictureRecorder>()) {}

  JSI_HOST_FUNCTION(beginRecording) {
    SkCanvas *canvas;
    if (count > 0 && !arguments[0].isUndefined()) {
      auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
      SkRTreeFactory factory;
      canvas = getObject()->beginRecording(*rect, &factory);
    } else {
      SkISize size = SkISize::Make(2'000'000, 2'000'000);
      SkRect rect = SkRect::Make(size);
      canvas = getObject()->beginRecording(rect, nullptr);
    }
    auto canvasObj = std::make_shared<JsiSkCanvas>(getContext(), canvas);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, canvasObj,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(finishRecordingAsPicture) {
    auto picture = getObject()->finishRecordingAsPicture();
    auto hostObjectInstance =
        std::make_shared<JsiSkPicture>(getContext(), std::move(picture));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  EXPORT_JSI_API_TYPENAME(JsiSkPictureRecorder, PictureRecorder)

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPictureRecorder, beginRecording),
                       JSI_EXPORT_FUNC(JsiSkPictureRecorder,
                                       finishRecordingAsPicture),
                       JSI_EXPORT_FUNC(JsiSkPictureRecorder, dispose))

  size_t getMemoryPressure() const override {
    return sizeof(SkPictureRecorder);
  }

  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto recorder = std::make_shared<JsiSkPictureRecorder>(context);
      return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, recorder,
                                                         context);
    };
  }
};
} // namespace RNSkia
