#pragma once

#include "JsiSkHostObjects.h"
#include "SkRRect.h"

namespace RNSkia {

using namespace facebook;

class JsiSkRRect : public JsiSkWrappingSharedPtrHostObject<SkRRect> {
public:
  JsiSkRRect(RNSkPlatformContext *context, const SkRRect &rect)
      : JsiSkWrappingSharedPtrHostObject<SkRRect>(
            context, std::make_shared<SkRRect>(rect)) {
    installReadonlyProperty("rx", [this](jsi::Runtime &rt) -> jsi::Value {
      return jsi::Value(getJsNumber(getObject()->getSimpleRadii().y()));
    });

    installReadonlyProperty("ry", [this](jsi::Runtime &rt) -> jsi::Value {
      return jsi::Value(getJsNumber(getObject()->getSimpleRadii().y()));
    });

    installReadonlyProperty(
        "rect", [this, context](jsi::Runtime &rt) -> jsi::Value {
          return jsi::Object::createFromHostObject(
              rt,
              std::make_shared<JsiSkRect>(context, getObject()->getBounds()));
        });
  };

  /**
    Returns the underlying object from a host object of this type
   */
  static std::shared_ptr<SkRRect> fromValue(jsi::Runtime &runtime,
                                            const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkRRect>(runtime)
        .get()
        ->getObject();
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
    return JSI_FUNC_SIGNATURE {
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
