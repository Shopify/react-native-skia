#pragma once

#include <jsi/jsi.h>

#include "JsiSkCanvas.h"
#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "modules/skottie/include/Skottie.h"

#pragma clang diagnostic pop

namespace RNSkia {
using namespace facebook;

class JsiSkSkottie : public JsiSkWrappingSkPtrHostObject<skottie::Animation> {
public:
  // #region Properties
  JSI_PROPERTY_GET(duration) {
    return static_cast<double>(getObject()->duration());
  }
  JSI_PROPERTY_GET(fps) {
    return static_cast<double>(getObject()->fps());
  }

  JSI_PROPERTY_GET(__typename__) {
    return jsi::String::createFromUtf8(runtime, "Skottie");
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkSkottie, duration), JSI_EXPORT_PROP_GET(JsiSkSkottie, fps),
                              JSI_EXPORT_PROP_GET(JsiSkSkottie, __typename__))
  // #endregion

  // #region Methods
  JSI_HOST_FUNCTION(seek) {
    getObject()->seek(arguments[0].asNumber());
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(render) {
    auto canvas = arguments[0].asObject(runtime).asHostObject<JsiSkCanvas>(runtime)->getCanvas();

    auto rect = JsiSkRect::fromValue(runtime, arguments[1]);
    if (canvas != nullptr && rect != nullptr) {
      getObject()->render(canvas, rect.get());
    }

    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSkottie, seek), JSI_EXPORT_FUNC(JsiSkSkottie, render), JSI_EXPORT_FUNC(JsiSkSkottie, dispose))
  // #endregion

  /**
    Constructor
  */
  JsiSkSkottie(std::shared_ptr<RNSkPlatformContext> context, const sk_sp<skottie::Animation> animation)
      : JsiSkWrappingSkPtrHostObject<skottie::Animation>(std::move(context), std::move(animation)) {}

  /**
    Returns the jsi object from a host object of this type
  */
  static sk_sp<skottie::Animation> fromValue(jsi::Runtime& runtime, const jsi::Value& obj) {
    return obj.asObject(runtime).asHostObject<JsiSkSkottie>(runtime)->getObject();
  }

  /**
   * Creates the function for contructing a new instance of the
   * JsiSkSkottie class.
   *
   * @param context platform context
   * @return A function for creating a new host object wrapper for the JsiSkSkottie class.
   */
//  static const jsi::HostFunctionType createCtor(std::shared_ptr<RNSkPlatformContext>) {
//    return JSI_HOST_FUNCTION_LAMBDA {
//      auto jsonStr = arguments[0].asString(runtime).utf8(runtime);
//      auto animation = skottie::Animation::Builder().make(jsonStr.c_str(), jsonStr.size());
//
//      // Return the newly constructed object
//      return jsi::Object::createFromHostObject(runtime, std::make_shared<JsiSkSkottie>(std::move(getContext()), std::move(animation)));
//    };
//  }
};
} // namespace RNSkia
