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
    auto image = getObject()->nextImage();
    if (!image) {
      // TODO: throw an exception instead of returning null
      return jsi::Value::null();
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiVideo, nextImage))

  JsiVideo(std::shared_ptr<RNSkPlatformContext> context,
           std::shared_ptr<RNSkVideo> &video)
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
      return nullptr;
      // return jsi::Object::createFromHostObject(
      //     runtime, std::make_shared<JsiVideo>(std::move(context),
      //     std::move(video)));
    };
  }
};

} // namespace RNSkia
