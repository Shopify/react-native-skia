#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkTypeface.h"
#include "JsiSkHostObjects.h"
#include "JsiSkData.h"

namespace RNSkia {

    using namespace facebook;

    class JsiSkTypefaceFactory : public JsiSkHostObject {
    public:
        JSI_HOST_FUNCTION(MakeFreeTypeFaceFromData) {
            auto data = JsiSkData::fromValue(runtime, arguments[0]);
            return jsi::Object::createFromHostObject(
                runtime, std::make_shared<JsiSkTypeface>(getContext(), SkFontMgr::RefDefault()->makeFromData(std::move(data))));
        }

        JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkTypefaceFactory, MakeFreeTypeFaceFromData))

        JsiSkTypefaceFactory(std::shared_ptr<RNSkPlatformContext> context)
                : JsiSkHostObject(std::move(context)) {}
    };

} // namespace RNSkia
