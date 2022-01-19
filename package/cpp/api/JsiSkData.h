#pragma once

#include <ReactCommon/TurboModuleUtils.h>

#include <map>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkFont.h>
#include <SkStream.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

    using namespace facebook;

    class JsiSkData : public JsiSkWrappingSkPtrHostObject<SkData> {
    public:
        JsiSkData(std::shared_ptr<RNSkPlatformContext> context,
                      const sk_sp<SkData> asset)
                : JsiSkWrappingSkPtrHostObject(context, asset){};


        JSI_PROPERTY_GET(__typename__) {
            return jsi::String::createFromUtf8(runtime, "Data");
        }

        JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkData, __typename__))

        /**
          Returns the underlying object from a host object of this type
         */
        static sk_sp<SkData> fromValue(jsi::Runtime &runtime,
                                           const jsi::Value &obj) {
            return obj.asObject(runtime)
                    .asHostObject<JsiSkData>(runtime)
                    .get()
                    ->getObject();
        }
    };
} // namespace RNSkia
