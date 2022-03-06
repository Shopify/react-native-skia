#pragma once

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkTextBlob.h>

#pragma clang diagnostic pop

namespace RNSkia {

    using namespace facebook;

    class JsiSkTextBlob : public JsiSkWrappingSkPtrHostObject<SkTextBlob> {
    public:
        JsiSkTextBlob(
                std::shared_ptr<RNSkPlatformContext> context,
                sk_sp<SkTextBlob> shader
        ) : JsiSkWrappingSkPtrHostObject<SkTextBlob>(context, shader) {}

        // TODO: declare in JsiSkWrappingSkPtrHostObject via extra template parameter?

        JSI_HOST_FUNCTION(bounds) {
            auto result = getObject()->bounds();
            return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkRect>(getContext(), result));
        }

        JSI_HOST_FUNCTION(uniqueID) {
            return static_cast<double>(getObject()->uniqueID());
        }

        JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTextBlob, bounds),
                             JSI_EXPORT_FUNC(JsiSkTextBlob, uniqueID))

        JSI_PROPERTY_GET(__typename__) {
            return jsi::String::createFromUtf8(runtime, "TextBlob");
        }

        JSI_EXPORT_PROPERTY_GETTERS(
                JSI_EXPORT_PROP_GET(JsiSkTextBlob, __typename__),
        )

        /**
        Returns the underlying object from a host object of this type
       */
        static sk_sp<SkTextBlob> fromValue(jsi::Runtime &runtime,
                                                    const jsi::Value &obj) {
            const auto object = obj.asObject(runtime);
            return object
                        .asHostObject<JsiSkTextBlob>(runtime)
                        .get()
                        ->getObject();

        }

    };
} // namespace RNSkia
