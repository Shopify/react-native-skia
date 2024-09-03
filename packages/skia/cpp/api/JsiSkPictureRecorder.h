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
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkCanvas>(getContext(), canvas));
  }

  JSI_HOST_FUNCTION(finishRecordingAsPicture) {
    auto picture = getObject()->finishRecordingAsPicture();
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPicture>(getContext(), picture));
  }

  EXPORT_JSI_API_TYPENAME(JsiSkPictureRecorder, PictureRecorder)

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPictureRecorder, beginRecording),
                       JSI_EXPORT_FUNC(JsiSkPictureRecorder,
                                       finishRecordingAsPicture),
                       JSI_EXPORT_FUNC(JsiSkPictureRecorder, dispose))

  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkPictureRecorder>(context));
    };
  }
};
} // namespace RNSkia
