#pragma once

#include <jsi/jsi.h>
#include "JsiSkImageFilter.h"
#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkColorFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

    using namespace facebook;

    class JsiSkImageFilterFactory : public JsiSkHostObject {
    public:
        JsiSkImageFilterFactory(RNSkPlatformContext *context): JsiSkHostObject(context) {
            installFunction(
                    "MakeBlur", JSI_FUNC_SIGNATURE {
                        float sigmaX = arguments[0].asNumber();
                        float sigmaY = arguments[1].asNumber();
                        int tileMode = arguments[2].asNumber();
                        sk_sp<SkImageFilter> imageFilter;
                        if (!arguments[3].isNull()) {
                            imageFilter = JsiSkImageFilter::fromValue(runtime, arguments[3]);
                        }
                        return jsi::Object::createFromHostObject(
                                runtime,
                                std::make_shared<JsiSkImageFilter>(
                                        context,
                                        SkImageFilters::Blur(
                                            sigmaX,
                                            sigmaY,
                                            (SkTileMode)tileMode,
                                            imageFilter)
                                        )
                                    );
                    });

            installFunction(
                "MakeColorFilter", JSI_FUNC_SIGNATURE {
                    auto cf = JsiSkColorFilter::fromValue(runtime, arguments[0]);
                    sk_sp<SkImageFilter> input;
                    if (!arguments[1].isNull()) {
                        input = JsiSkImageFilter::fromValue(runtime, arguments[1]);
                    }
                    return jsi::Object::createFromHostObject(
                            runtime,
                            std::make_shared<JsiSkImageFilter>(context, SkImageFilters::ColorFilter(cf, input)));
                });

            installFunction(
                    "MakeCompose", JSI_FUNC_SIGNATURE {
                        auto outer = JsiSkImageFilter::fromValue(runtime, arguments[0]);
                        sk_sp<SkImageFilter> inner;
                        if (arguments[1].isNull()) {
                            inner = JsiSkImageFilter::fromValue(runtime, arguments[1]);
                        }
                        return jsi::Object::createFromHostObject(
                                runtime,
                                std::make_shared<JsiSkImageFilter>(context, SkImageFilters::Compose(outer, inner)));
                    });

            installFunction(
                    "MakeDropShadow", JSI_FUNC_SIGNATURE {
                        auto dx = arguments[0].asNumber();
                        auto dy = arguments[1].asNumber();
                        auto sigmaX = arguments[2].asNumber();
                        auto sigmaY = arguments[3].asNumber();
                        auto color = arguments[4].asNumber();
                        return jsi::Object::createFromHostObject(
                                runtime,
                                std::make_shared<JsiSkImageFilter>(
                                        context, SkImageFilters::DropShadow(
                                                dx,
                                                dy,
                                                sigmaX,
                                                sigmaY,
                                                color,
                                                nullptr)));
                    });

            installFunction(
                    "MakeDropShadowOnly", JSI_FUNC_SIGNATURE {
                        auto dx = arguments[0].asNumber();
                        auto dy = arguments[1].asNumber();
                        auto sigmaX = arguments[2].asNumber();
                        auto sigmaY = arguments[3].asNumber();
                        auto color = arguments[4].asNumber();
                        return jsi::Object::createFromHostObject(
                                runtime,
                                std::make_shared<JsiSkImageFilter>(
                                        context, SkImageFilters::DropShadowOnly(
                                                dx,
                                                dy,
                                                sigmaX,
                                                sigmaY,
                                                color,
                                                nullptr)));
                    });
        }
    };

} // namespace RNSkia
