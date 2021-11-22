#pragma once

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPoint.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkPoint : public JsiSkWrappingSharedPtrHostObject<SkPoint> {
public:
  JSI_PROPERTY_GET(x) { return static_cast<double>(getObject()->x()); }

  JSI_PROPERTY_GET(y) { return static_cast<double>(getObject()->y()); }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkPoint, x),
                              JSI_EXPORT_PROP_GET(JsiSkPoint, y))

  JsiSkPoint(RNSkPlatformContext *context, const SkPoint &point)
      : JsiSkWrappingSharedPtrHostObject<SkPoint>(
            context, std::make_shared<SkPoint>(point)){};

  /**
  Returns the underlying object from a host object of this type
 */
  static std::shared_ptr<SkPoint> fromValue(jsi::Runtime &runtime,
                                            const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkPoint>(runtime)
        .get()
        ->getObject();
  }

  /**
  Returns the jsi object from a host object of this type
 */
  static jsi::Value toValue(jsi::Runtime &runtime, RNSkPlatformContext *context,
                            const SkPoint &point) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPoint>(context, point));
  }

  /**
   * Creates the function for construction a new instance of the SkPoint
   * wrapper
   * @param context platform context
   * @return A function for creating a new host object wrapper for the SkPoint
   * class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      auto point =
          SkPoint::Make(arguments[0].asNumber(), arguments[1].asNumber());

      // Return the newly constructed object
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkPoint>(context, point));
    };
  }
};
} // namespace RNSkia
