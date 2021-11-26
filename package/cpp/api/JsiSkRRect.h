#pragma once

#include "JsiSkHostObjects.h"
#include "SkRRect.h"

namespace RNSkia {

using namespace facebook;

class JsiSkRRect : public JsiSkWrappingSharedPtrHostObject<SkRRect> {
public:
  JSI_PROPERTY_GET(rx) {
    return static_cast<double>(getObject()->getSimpleRadii().x());
  }
  JSI_PROPERTY_GET(ry) {
    return static_cast<double>(getObject()->getSimpleRadii().y());
  }
  JSI_PROPERTY_GET(rect) {
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkRect>(getContext(), getObject()->getBounds()));
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkRRect, rx),
                              JSI_EXPORT_PROP_GET(JsiSkRRect, ry),
                              JSI_EXPORT_PROP_GET(JsiSkRRect, rect))

  JsiSkRRect(RNSkPlatformContext *context, const SkRRect &rect)
      : JsiSkWrappingSharedPtrHostObject<SkRRect>(
            context, std::make_shared<SkRRect>(rect)){};

  /**
    Returns the underlying object from a host object of this type
   */
  static std::shared_ptr<SkRRect> fromValue(jsi::Runtime &runtime,
                                            const jsi::Value &obj) {

    const auto object = obj.asObject(runtime);
    if (object.isHostObject(runtime)) {
      return obj.asObject(runtime)
              .asHostObject<JsiSkRRect>(runtime)
              .get()
              ->getObject();
    } else {
      auto rect = JsiSkRect::fromValue(runtime, object.getProperty(runtime, "rect"));
      auto rx = object.getProperty(runtime, "rx").asNumber();
      auto ry = object.getProperty(runtime, "ry").asNumber();
      return std::make_shared<SkRRect>(SkRRect::MakeRectXY(*rect, rx, ry));
    }
  }

  /**
    Returns the jsi object from a host object of this type
   */
  static jsi::Value toValue(jsi::Runtime &runtime, RNSkPlatformContext *context,
                            const SkRRect &rect) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkRRect>(context, rect));
  }

  /**
   * Creates the function for construction a new instance of the SkRect
   * wrapper
   * @param context platform context
   * @return A function for creating a new host object wrapper for the SkRect
   * class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      // Set up the rect
      auto rect = JsiSkRect::fromValue(runtime, arguments[0]).get();
      auto rx = arguments[1].asNumber();
      auto ry = arguments[2].asNumber();
      auto rrect = SkRRect::MakeRectXY(*rect, rx, ry);
      // Return the newly constructed object
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkRRect>(context, rrect));
    };
  }
};
} // namespace RNSkia
