#pragma once

#include <jsi/jsi.h>

#include "JsiSkCanvas.h"
#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "modules/skottie/include/Skottie.h"
#include "modules/sksg/include/SkSGInvalidationController.h"

#pragma clang diagnostic pop

namespace RNSkia {
using namespace facebook;

class JsiSkSkottie : public JsiSkWrappingSkPtrHostObject<skottie::Animation> {
public:
  // #region Properties
  JSI_HOST_FUNCTION(duration) {
    return static_cast<double>(getObject()->duration());
  }
  JSI_HOST_FUNCTION(fps) { return static_cast<double>(getObject()->fps()); }

  JSI_PROPERTY_GET(__typename__) {
    return jsi::String::createFromUtf8(runtime, "Skottie");
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkSkottie, __typename__))
  // #endregion

  // #region Methods
  JSI_HOST_FUNCTION(seekFrame) {
    sksg::InvalidationController ic;
    getObject()->seek(arguments[0].asNumber(), &ic);
    auto bounds = ic.bounds();
    if (count >= 2) {
      auto rect = JsiSkRect::fromValue(runtime, arguments[1]);
      if (rect != nullptr) {
        rect->setXYWH(bounds.x(), bounds.y(), bounds.width(), bounds.height());
      }
    }
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(size) {
    auto size = getObject()->size();
    jsi::Object jsiSize(runtime);
    jsiSize.setProperty(runtime, "width", size.width());
    jsiSize.setProperty(runtime, "height", size.height());
    return jsiSize;
  }

  JSI_HOST_FUNCTION(render) {
    auto canvas = arguments[0]
                      .asObject(runtime)
                      .asHostObject<JsiSkCanvas>(runtime)
                      ->getCanvas();
    if (count > 1) {
      auto rect = JsiSkRect::fromValue(runtime, arguments[1]);
      getObject()->render(canvas, rect.get());
    } else {
        getObject()->render(canvas);
    }

    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(version) {
    return jsi::String::createFromUtf8(runtime, getObject()->version().c_str());
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSkottie, duration),
                       JSI_EXPORT_FUNC(JsiSkSkottie, fps),
                       JSI_EXPORT_FUNC(JsiSkSkottie, seekFrame),
                       JSI_EXPORT_FUNC(JsiSkSkottie, render),
                       JSI_EXPORT_FUNC(JsiSkSkottie, size),
                       JSI_EXPORT_FUNC(JsiSkSkottie, version),
                       JSI_EXPORT_FUNC(JsiSkSkottie, dispose))
  // #endregion

  /**
    Constructor
  */
  JsiSkSkottie(std::shared_ptr<RNSkPlatformContext> context,
               const sk_sp<skottie::Animation> animation)
      : JsiSkWrappingSkPtrHostObject<skottie::Animation>(std::move(context),
                                                         std::move(animation)) {
  }

  /**
    Returns the jsi object from a host object of this type
  */
  static sk_sp<skottie::Animation> fromValue(jsi::Runtime &runtime,
                                             const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkSkottie>(runtime)
        ->getObject();
  }
};
} // namespace RNSkia
