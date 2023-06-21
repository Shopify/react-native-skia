#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkFontStyle.h"

#pragma clang diagnostic pop

namespace RNSkia {

    namespace jsi = facebook::jsi;

    class JsiSkFontStyle : public JsiSkWrappingSharedPtrHostObject<SkFontStyle> {
    public:

        JSI_API_TYPENAME("FontStyle");

        JsiSkFontStyle(std::shared_ptr<RNSkPlatformContext> context, const SkFontStyle &fontStyle)
                : JsiSkWrappingSharedPtrHostObject<SkFontStyle>(
                std::move(context), std::make_shared<SkFontStyle>(fontStyle)) {}

        /**
        Returns the underlying object from a host object of this type
       */
        static std::shared_ptr<SkFontStyle> fromValue(jsi::Runtime &runtime,
                                                  const jsi::Value &obj) {
            const auto &object = obj.asObject(runtime);
            if (object.isHostObject(runtime)) {
                return object.asHostObject<JsiSkFontStyle>(runtime)->getObject();
            } else {
//                auto x = object.getProperty(runtime, "x").asNumber();
//                auto y = object.getProperty(runtime, "y").asNumber();
                SkFontStyle normalStyle(SkFontStyle::kNormal_Weight,
                                        SkFontStyle::kNormal_Width,
                                        SkFontStyle::kUpright_Slant);
                return std::make_shared<SkFontStyle>(normalStyle);
            }
        }

        /**
        Returns the jsi object from a host object of this type
       */
        static jsi::Value toValue(jsi::Runtime &runtime,
                                  std::shared_ptr<RNSkPlatformContext> context,
                                  const SkFontStyle &fontStyle) {
            return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkFontStyle>(std::move(context), fontStyle));
        }

        /**
         * Creates the function for construction a new instance of the SkPoint
         * wrapper
         * @param context platform context
         * @return A function for creating a new host object wrapper for the SkPoint
         * class
         */
        static const jsi::HostFunctionType
        createCtor(std::shared_ptr<RNSkPlatformContext> context) {
            return JSI_HOST_FUNCTION_LAMBDA {
                    auto point =
                    SkPoint::Make(arguments[0].asNumber(), arguments[1].asNumber());

                    // Return the newly constructed object
                    return jsi::Object::createFromHostObject(
                    runtime,
                    std::make_shared<JsiSkPoint>(std::move(context), std::move(point)));
            };
        }
    };
} // namespace RNSkia
