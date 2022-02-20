#pragma once

#include "JsiSkHostObjects.h"
#include "JsiSkData.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPicture.h>

#pragma clang diagnostic pop

namespace RNSkia {

    using namespace facebook;

    class JsiSkPicture: public JsiSkWrappingSkPtrHostObject<SkPicture> {
    public:
        JsiSkPicture(std::shared_ptr<RNSkPlatformContext> context,
                      sk_sp<SkPicture> picture)
                : JsiSkWrappingSkPtrHostObject<SkPicture>(context, picture) {}

        // TODO: declare in JsiSkWrappingSkPtrHostObject via extra template parameter?
        JSI_PROPERTY_GET(__typename__) {
            return jsi::String::createFromUtf8(runtime, "Picture");
        }

        JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkPicture, __typename__))

        static sk_sp<SkPicture> fromValue(jsi::Runtime &runtime,
                                           const jsi::Value &obj) {
            const auto object = obj.asObject(runtime);
            return object
                    .asHostObject<JsiSkPicture>(runtime)
                    .get()
                    ->getObject();
        }

        static const jsi::HostFunctionType
        createCtor(std::shared_ptr<RNSkPlatformContext> context) {
            return JSI_HOST_FUNCTION_LAMBDA {
                auto data = JsiSkData::fromValue(runtime, arguments[0]);
                auto picture =  SkPicture::MakeFromData(data.get(), nullptr);
                return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkPicture>(context, picture));
            };
        }
    };
} // namespace RNSkia
