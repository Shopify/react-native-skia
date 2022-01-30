#pragma once

#include "JsiSkImage.h"
#include "JsiSkHostObjects.h"
#include "JsiSkData.h"
#include <jsi/jsi.h>

namespace RNSkia {

    using namespace facebook;

    class JsiSkImageFactory : public JsiSkHostObject {
    public:
        JSI_HOST_FUNCTION(MakeImageFromEncoded) {
            auto data = JsiSkData::fromValue(runtime, arguments[0]);
            auto image = SkImage::MakeFromEncoded(data);
            if(image == nullptr) {
                return jsi::Value::null();
            }
            return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkImage>(getContext(), image));
        }

        JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkImageFactory, MakeImageFromEncoded))

        JsiSkImageFactory(std::shared_ptr<RNSkPlatformContext> context)
                : JsiSkHostObject(context) {}
    };

} // namespace RNSkia
