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

  JSI_HOST_FUNCTION(rotation) {
    auto context = getContext();
    auto rot = getObject()->getRotationInDegrees();
    return jsi::Value(static_cast<double>(rot));
  }

  JSI_HOST_FUNCTION(size) {
    auto context = getContext();
    auto size = getObject()->getSize();
    auto result = jsi::Object(runtime);
    result.setProperty(runtime, "width", static_cast<double>(size.width()));
    result.setProperty(runtime, "height", static_cast<double>(size.height()));
    return result;
  }

  JSI_HOST_FUNCTION(play) {
    getObject()->play();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(pause) {
    getObject()->pause();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setVolume) {
    auto volume = arguments[0].asNumber();
    getObject()->setVolume(static_cast<float>(volume));
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(
      JSI_EXPORT_FUNC(JsiVideo, nextImage), JSI_EXPORT_FUNC(JsiVideo, duration),
      JSI_EXPORT_FUNC(JsiVideo, framerate), JSI_EXPORT_FUNC(JsiVideo, seek),
      JSI_EXPORT_FUNC(JsiVideo, rotation), JSI_EXPORT_FUNC(JsiVideo, size),
      JSI_EXPORT_FUNC(JsiVideo, play), JSI_EXPORT_FUNC(JsiVideo, pause),
      JSI_EXPORT_FUNC(JsiVideo, setVolume), JSI_EXPORT_FUNC(JsiVideo, dispose))

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
static const jsi::HostFunctionType createCtor(std::shared_ptr<RNSkPlatformContext> context) {
  return JSI_HOST_FUNCTION_LAMBDA {
    if (count < 1) {
      context->raiseError("createCtor: Expected at least 1 argument, got " + std::to_string(count) + ".");
      return jsi::Value::undefined();
    }

    if (!arguments[0].isString()) {
      context->raiseError("createCtor: First argument must be a string");
      return jsi::Value::undefined();
    }

    auto url = arguments[0].asString(runtime).utf8(runtime);
    auto jsContext = context;
    return RNJsi::JsiPromises::createPromiseAsJSIValue(
        runtime, [jsContext, url = std::move(url)](
                     jsi::Runtime &runtime,
                     std::shared_ptr<RNJsi::JsiPromises::Promise> promise) {
          jsContext->runOnMainThread([&runtime, jsContext, url = std::move(url), promise = std::move(promise)]() {
            auto video = jsContext->createVideo(url);
            jsContext->runOnJavascriptThread([&runtime, jsContext, promise = std::move(promise), video = std::move(video)]() {
              if (video == nullptr) {
                promise->reject("Failed to create video object.");
                return;
              }
              promise->resolve(jsi::Object::createFromHostObject(
                  runtime, std::make_shared<JsiVideo>(std::move(jsContext), std::move(video))));
            });
          });
        });
  };
}

};

} // namespace RNSkia
