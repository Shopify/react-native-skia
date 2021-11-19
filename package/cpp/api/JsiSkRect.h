#pragma once

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkRect.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkRect : public JsiSkWrappingSharedPtrHostObject<SkRect> {
   public:
    JsiSkRect(RNSkPlatformContext *context, const SkRect &rect)
        : JsiSkWrappingSharedPtrHostObject<SkRect>(
              context,
              std::make_shared<SkRect>(rect)) {
        installReadonlyProperty("x", [this](jsi::Runtime &rt) -> jsi::Value {
            return jsi::Value(getJsNumber(getObject()->x()));
        });

        installReadonlyProperty("y", [this](jsi::Runtime &rt) -> jsi::Value {
            return jsi::Value(getJsNumber(getObject()->y()));
        });

        installReadonlyProperty(
            "width", [this](jsi::Runtime &rt) -> jsi::Value {
                return jsi::Value(getJsNumber(getObject()->width()));
            });

        installReadonlyProperty(
            "height", [this](jsi::Runtime &rt) -> jsi::Value {
                return jsi::Value(getJsNumber(getObject()->height()));
            });

        installReadonlyProperty("left", [this](jsi::Runtime &rt) -> jsi::Value {
            return jsi::Value(getJsNumber(getObject()->left()));
        });

        installReadonlyProperty("top", [this](jsi::Runtime &rt) -> jsi::Value {
            return jsi::Value(getJsNumber(getObject()->top()));
        });

        installReadonlyProperty(
            "right", [this](jsi::Runtime &rt) -> jsi::Value {
                return jsi::Value(getJsNumber(getObject()->right()));
            });

        installReadonlyProperty(
            "bottom", [this](jsi::Runtime &rt) -> jsi::Value {
                return jsi::Value(getJsNumber(getObject()->bottom()));
            });

        installFunction(
            "setXYWH", JSI_FUNC_SIGNATURE {
                getObject()->setXYWH(
                    arguments[0].asNumber(),
                    arguments[1].asNumber(),
                    arguments[2].asNumber(),
                    arguments[3].asNumber());
                return jsi::Value::undefined();
            });

        installFunction(
            "setLTRB", JSI_FUNC_SIGNATURE {
                getObject()->setLTRB(
                    arguments[0].asNumber(),
                    arguments[1].asNumber(),
                    arguments[2].asNumber(),
                   arguments[3].asNumber());
                return jsi::Value::undefined();
            });
    };

    /**
      Returns the underlying object from a host object of this type
     */
    static std::shared_ptr<SkRect> fromValue(
        jsi::Runtime &runtime,
        const jsi::Value &obj) {
        return obj.asObject(runtime)
            .asHostObject<JsiSkRect>(runtime)
            .get()
            ->getObject();
    }

    /**
      Returns the jsi object from a host object of this type
     */
    static jsi::Value toValue(
        jsi::Runtime &runtime,
        RNSkPlatformContext *context,
        const SkRect &rect) {
        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkRect>(context, rect));
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
            SkRect rect = SkRect::MakeXYWH(
                    arguments[0].asNumber(),
                    arguments[1].asNumber(),
                    arguments[2].asNumber(),
                    arguments[3].asNumber());

            // Return the newly constructed object
            return jsi::Object::createFromHostObject(
                runtime, std::make_shared<JsiSkRect>(context, rect));
        };
    }
};
} // namespace RNSkia
