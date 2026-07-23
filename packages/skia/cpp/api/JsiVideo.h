#pragma once

#include <memory>
#include <numeric>
#include <utility>
#include <vector>

#include "JsiSkNativeObjects.h"
#include "utils/RNSkLog.h"
#include <jsi/jsi.h>

#include "JsiSkPaint.h"
#include "JsiSkPoint.h"
#include "JsiSkRect.h"
#include "JsiSkTypeface.h"

#include "rnskia/RNSkVideo.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkFont.h"
#include "include/core/SkFontMetrics.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiVideo
    : public JsiSkWrappingSharedPtrNativeObject<JsiVideo, RNSkVideo> {
public:
  static constexpr const char *CLASS_NAME = "Video";

  JSI_HOST_FUNCTION(nextImage) {
    double timestamp = 0;
    auto video = getObject();
    auto image = video->nextImage(&timestamp);
    if (!image) {
      return jsi::Value::null();
    }
    return makeJsiObject(
        runtime, std::make_shared<JsiSkImage>(getContext(), std::move(image)));
  }

  JSI_HOST_FUNCTION(duration) { return getObject()->duration(); }

  JSI_HOST_FUNCTION(framerate) { return getObject()->framerate(); }

  JSI_HOST_FUNCTION(currentTime) { return getObject()->currentTime(); }

  JSI_HOST_FUNCTION(isPlaying) { return getObject()->isPlaying(); }

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

  JSI_HOST_FUNCTION(setLooping) {
    auto looping = arguments[0].asBool();
    getObject()->setLooping(looping);
    return jsi::Value::undefined();
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "nextImage", &JsiVideo::nextImage);
    installHostMethod(runtime, prototype, "duration", &JsiVideo::duration);
    installHostMethod(runtime, prototype, "framerate", &JsiVideo::framerate);
    installHostMethod(runtime, prototype, "currentTime",
                      &JsiVideo::currentTime);
    installHostMethod(runtime, prototype, "isPlaying", &JsiVideo::isPlaying);
    installHostMethod(runtime, prototype, "seek", &JsiVideo::seek);
    installHostMethod(runtime, prototype, "rotation", &JsiVideo::rotation);
    installHostMethod(runtime, prototype, "size", &JsiVideo::size);
    installHostMethod(runtime, prototype, "play", &JsiVideo::play);
    installHostMethod(runtime, prototype, "pause", &JsiVideo::pause);
    installHostMethod(runtime, prototype, "setVolume", &JsiVideo::setVolume);
    installHostMethod(runtime, prototype, "setLooping", &JsiVideo::setLooping);
  }

  JsiVideo(std::shared_ptr<RNSkPlatformContext> context,
           std::shared_ptr<RNSkVideo> video)
      : JsiSkWrappingSharedPtrNativeObject<JsiVideo, RNSkVideo>(
            std::move(context), std::move(video)) {}

  size_t getMemoryPressure() override { return 32768; }

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
      return makeJsiObject(runtime, std::make_shared<JsiVideo>(
                                        std::move(context), std::move(video)));
    };
  }
};

} // namespace RNSkia
