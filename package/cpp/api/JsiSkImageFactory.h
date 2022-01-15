#pragma once

#include "JsiSkImage.h"
#include "JsiSkHostObjects.h"
#include "JsiSkData.h"
#include <jsi/jsi.h>

namespace RNSkia {

    using namespace facebook;

    class JsiSkImageFactory : public JsiSkHostObject {
    public:
        JSI_HOST_FUNCTION(MakeFromEncoded) {
            auto data = JsiSkData::fromValue(runtime, arguments[0]);
            return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkImage>(getContext(), SkImage::MakeFromEncoded(data)));
        }

        JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkImageFactory, MakeFromEncoded))

        JsiSkImageFactory(std::shared_ptr<RNSkPlatformContext> context)
                : JsiSkHostObject(context) {}
    };

} // namespace RNSkia
