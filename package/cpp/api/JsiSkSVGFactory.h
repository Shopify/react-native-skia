#pragma once

#include "JsiSkTypeface.h"
#include "JsiSkHostObjects.h"
#include "JsiSkData.h"
#include "JsiSkSVG.h"
#include <jsi/jsi.h>

namespace RNSkia {

    using namespace facebook;

    class JsiSkSVGFactory : public JsiSkHostObject {
    public:
        JSI_HOST_FUNCTION(MakeFromData) {
            auto data = JsiSkData::fromValue(runtime, arguments[0]);
            auto stream = SkMemoryStream::Make(data);
            auto svg_dom = SkSVGDOM::Builder().make(*stream);
            return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkSVG>(getContext(), svg_dom));
        }

        JSI_HOST_FUNCTION(MakeFromString) {
            auto svgText = arguments[0].asString(runtime).utf8(runtime);
            auto stream = SkMemoryStream::MakeDirect(svgText.c_str(), svgText.size());
            auto svg_dom = SkSVGDOM::Builder().make(*stream);
            return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkSVG>(getContext(), svg_dom));
        }

        JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkSVGFactory, MakeFromData), JSI_EXPORT_FUNC(JsiSkSVGFactory, MakeFromString))

        JsiSkSVGFactory(std::shared_ptr<RNSkPlatformContext> context)
                : JsiSkHostObject(context) {}
    };

} // namespace RNSkia
