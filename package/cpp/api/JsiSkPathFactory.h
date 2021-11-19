#pragma once

#include <jsi/jsi.h>
#include "JsiSkPathEffect.h"
#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPath.h>
#include <SkCornerPathEffect.h>
#include <SkDashPathEffect.h>
#include <SkDiscretePathEffect.h>
#include <SkPathOps.h>

#pragma clang diagnostic pop

namespace RNSkia {

    using namespace facebook;

    class JsiSkPathFactory : public JsiSkHostObject {
    public:
        JsiSkPathFactory(RNSkPlatformContext *context): JsiSkHostObject(context) {
            installFunction(
                "Make", JSI_FUNC_SIGNATURE {
                    return jsi::Object::createFromHostObject(
                            runtime, std::make_shared<JsiSkPath>(context, SkPath()));
                });

            installFunction(
                "MakeFromSVGString", JSI_FUNC_SIGNATURE {
                    auto svgString = arguments[0].asString(runtime).utf8(runtime);
                    SkPath result;

                    if (!SkParsePath::FromSVGString(svgString.c_str(), &result)) {
                        jsi::detail::throwJSError(
                                runtime, "Could not parse Svg path");
                        return jsi::Value(nullptr);
                    }

                    return jsi::Object::createFromHostObject(
                            runtime, std::make_shared<JsiSkPath>(context, result));
                });

            installFunction(
                "MakeFromOp", JSI_FUNC_SIGNATURE {
                    SkPath one = *JsiSkPath::fromValue(runtime, arguments[0]).get();
                    SkPath two = *JsiSkPath::fromValue(runtime, arguments[1]).get();
                    SkPathOp op = (SkPathOp)arguments[2].asNumber();
                    SkPath result;
                    bool success = Op(one, two, op, &result);
                    if (!success) {
                        return jsi::Value(nullptr);
                    }
                    return jsi::Object::createFromHostObject(
                            runtime, std::make_shared<JsiSkPath>(context, result));
                });
        }
    };

} // namespace RNSkia
