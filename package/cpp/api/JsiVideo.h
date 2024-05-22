#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkHostObjects.h"
#include "RNSkLog.h"
#include <jsi/jsi.h>

#include "JsiSkPaint.h"
#include "JsiSkPoint.h"
#include "JsiSkRect.h"
#include "JsiSkTypeface.h"

#include "RNSkVideo.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFont.h"
#include "include/core/SkFontMetrics.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiVideo : public JsiSkWrappingSharedPtrHostObject<RNSkVideo> {
public:
  EXPORT_JSI_API_TYPENAME(JsiVideo, Video)

  JSI_HOST_FUNCTION(nextImage) {
    double timestamp = 0;
    auto video = getObject();
    auto image = video->nextImage(&timestamp);
    if (!image) {
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_HOST_FUNCTION(duration) { return getObject()->duration(); }

  JSI_HOST_FUNCTION(framerate) { return getObject()->framerate(); }

  JSI_HOST_FUNCTION(seek) {
    double timestamp = arguments[0].asNumber();
    getObject()->seek(timestamp);
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiVideo, nextImage),
                       JSI_EXPORT_FUNC(JsiVideo, duration),
                       JSI_EXPORT_FUNC(JsiVideo, framerate),
                       JSI_EXPORT_FUNC(JsiVideo, seek),
                       JSI_EXPORT_FUNC(JsiVideo, dispose))

  JsiVideo(std::shared_ptr<RNSkPlatformContext> context,
           std::shared_ptr<RNSkVideo> video)
      : JsiSkWrappingSharedPtrHostObject(std::move(context), std::move(video)) {
  }

  /**
   * Creates the function for construction a new instance of the SkFont
   * wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the SkFont
   * class
   */
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto url = arguments[0].asString(runtime).utf8(runtime);
      auto video = context->createVideo(url);
      // Return the newly constructed object
      return jsi::Object::createFromHostObject(
          runtime,
          std::make_shared<JsiVideo>(std::move(context), std::move(video)));
    };
  }
};

} // namespace RNSkia
