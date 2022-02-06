#pragma once


#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkContourMeasure.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

    using namespace facebook;

    class JsiSkContourMeasure : public JsiSkWrappingSkPtrHostObject<SkContourMeasure> {
    public:
        JsiSkContourMeasure(std::shared_ptr<RNSkPlatformContext> context,
                  const sk_sp<SkContourMeasure> contourMeasure)
                : JsiSkWrappingSkPtrHostObject(context, contourMeasure){};


        JSI_PROPERTY_GET(__typename__) {
                return jsi::String::createFromUtf8(runtime, "ContourMeasure");
        }

        JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkContourMeasure, __typename__))

        /**
          Returns the underlying object from a host object of this type
         */
        static sk_sp<SkContourMeasure> fromValue(jsi::Runtime &runtime,
                                       const jsi::Value &obj) {
            return obj.asObject(runtime)
                    .asHostObject<JsiSkContourMeasure>(runtime)
                    .get()
                    ->getObject();
        }

        static jsi::Value toValue(jsi::Runtime &runtime,
                                  std::shared_ptr<RNSkPlatformContext> context,
                                  sk_sp<SkContourMeasure> contourMeasure) {
            return jsi::Object::createFromHostObject(
                    runtime,
                    std::make_shared<JsiSkContourMeasure>(context, contourMeasure)
            );
        }
    };
} // namespace RNSkia
