#pragma once

#include <JsiSkHostObjects.h>
#include <JsiSkImageFilter.h>
#include <JsiSkMaskFilter.h>
#include <JsiSkShader.h>
#include <JsiSkPathEffect.h>
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPaint.h>

#pragma clang diagnostic pop

namespace RNSkia {
using namespace facebook;

class JsiSkPaint : public JsiSkWrappingSharedPtrHostObject<SkPaint> {
   public:
    JsiSkPaint(RNSkPlatformContext *context, SkPaint paint)
        : JsiSkWrappingSharedPtrHostObject<SkPaint>(
              context,
              std::make_shared<SkPaint>(paint)) {
        installFunction(
                "copy", JSI_FUNC_SIGNATURE {
                    auto paint = getObject().get();
                    return jsi::Object::createFromHostObject(
                            runtime, std::make_shared<JsiSkPaint>(context, SkPaint(*paint)));
                });

        installFunction(
                "getColor", JSI_FUNC_SIGNATURE {
                    return jsi::Value(getJsNumber( getObject()->getColor()));
                });

        installFunction(
                "getStrokeCap", JSI_FUNC_SIGNATURE {
                    return jsi::Value(getJsNumber( getObject()->getStrokeCap()));
                });

        installFunction(
                "getStrokeJoin", JSI_FUNC_SIGNATURE {
                    return jsi::Value(getJsNumber( getObject()->getStrokeJoin()));
                });

        installFunction(
                "getStrokeMiter", JSI_FUNC_SIGNATURE {
                    return jsi::Value(getJsNumber( getObject()->getStrokeMiter()));
                });

        installFunction(
                "getStrokeWidth", JSI_FUNC_SIGNATURE {
                    return jsi::Value(getJsNumber( getObject()->getStrokeWidth()));
                });


        installFunction(
            "setColor", JSI_FUNC_SIGNATURE {
                SkColor color = arguments[0].asNumber();
                getObject()->setColor(color);
                return jsi::Value::undefined();
            });

        installFunction(
            "setAlphaf", JSI_FUNC_SIGNATURE {
                SkScalar alpha = arguments[0].asNumber();
                getObject()->setAlphaf(alpha);
                return jsi::Value::undefined();
            });

        installFunction(
            "setAntiAlias", JSI_FUNC_SIGNATURE {
                bool antiAliased = arguments[0].getBool();
                getObject()->setAntiAlias(antiAliased);
                return jsi::Value::undefined();
            });

        installFunction(
            "setStrokeWidth", JSI_FUNC_SIGNATURE {
                SkScalar width = arguments[0].asNumber();
                getObject()->setStrokeWidth(width);
                return jsi::Value::undefined();
            });

        installFunction(
            "setStyle", JSI_FUNC_SIGNATURE {
                int styleInt = arguments[0].asNumber();
                switch (styleInt) {
                    case 0:
                        getObject()->setStyle(SkPaint::kFill_Style);
                        break;
                    case 1:
                        getObject()->setStyle(SkPaint::kStroke_Style);
                        break;
// This API is expected to be deprecated https://github.com/flutter/flutter/issues/5912
//                    case 2:
//                        getObject()->setStyle(SkPaint::kStrokeAndFill_Style);
//                        break;
                }
                return jsi::Value::undefined();
            });

        installFunction(
            "setStrokeCap", JSI_FUNC_SIGNATURE {
                int cap = arguments[0].asNumber();
                switch (cap) {
                    case 0:
                        getObject()->setStrokeCap(SkPaint::kButt_Cap);
                        break;
                    case 1:
                        getObject()->setStrokeCap(SkPaint::kRound_Cap);
                        break;
                    case 2:
                        getObject()->setStrokeCap(SkPaint::kSquare_Cap);
                        break;
                }
                return jsi::Value::undefined();
            });

        installFunction(
            "setStrokeJoin", JSI_FUNC_SIGNATURE {
                int join = arguments[0].asNumber();
                switch (join) {
                    case 0:
                        getObject()->setStrokeJoin(SkPaint::kBevel_Join);
                        break;
                    case 1:
                        getObject()->setStrokeJoin(SkPaint::kMiter_Join);
                        break;
                    case 2:
                        getObject()->setStrokeJoin(SkPaint::kRound_Join);
                        break;
                }
                return jsi::Value::undefined();
            });

        installFunction(
            "setStrokeMiter", JSI_FUNC_SIGNATURE {
                int limit = arguments[0].asNumber();
                getObject()->setStrokeMiter(limit);
                return jsi::Value::undefined();
            });

        installFunction(
            "setBlendMode", JSI_FUNC_SIGNATURE {
                auto blendMode = (SkBlendMode)arguments[0].asNumber();
                getObject()->setBlendMode(blendMode);
                return jsi::Value::undefined();
            });


        installFunction(
            "setMaskFilter", JSI_FUNC_SIGNATURE {
                auto maskFilter =
                    JsiSkMaskFilter::fromValue(runtime, arguments[0]);
                getObject()->setMaskFilter(maskFilter);
                return jsi::Value::undefined();
            });

        installFunction(
            "setImageFilter", JSI_FUNC_SIGNATURE {
                auto imageFilter =
                    JsiSkImageFilter::fromValue(runtime, arguments[0]);
                getObject()->setImageFilter(imageFilter);
                return jsi::Value::undefined();
            });

        installFunction(
            "setColorFilter", JSI_FUNC_SIGNATURE {
                auto colorFilter =
                    JsiSkColorFilter::fromValue(runtime, arguments[0]);
                getObject()->setColorFilter(colorFilter);
                return jsi::Value::undefined();
            });

        installFunction(
            "setShader", JSI_FUNC_SIGNATURE {
                auto shader = JsiSkShader::fromValue(runtime, arguments[0]);
                getObject()->setShader(shader);
                return jsi::Value::undefined();
            });


        installFunction(
                "setPathEffect", JSI_FUNC_SIGNATURE {
                    auto pathEffect = JsiSkPathEffect::fromValue(runtime, arguments[0]);
                    getObject()->setPathEffect(pathEffect);
                    return jsi::Value::undefined();
                });
    }

    /**
      Returns the underlying object from a host object of this type
     */
    static std::shared_ptr<SkPaint> fromValue(
        jsi::Runtime &runtime,
        const jsi::Value &obj) {
        return obj.asObject(runtime)
            .asHostObject<JsiSkPaint>(runtime)
            .get()
            ->getObject();
    }

    /**
     * Creates the function for construction a new instance of the SkPaint
     * wrapper
     * @param context Platform context
     * @return A function for creating a new host object wrapper for the SkPaint
     * class
     */
    static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
        return JSI_FUNC_SIGNATURE {
            // Return the newly constructed object
            return jsi::Object::createFromHostObject(
                runtime, std::make_shared<JsiSkPaint>(context, SkPaint()));
        };
    }
};
} // namespace RNSkia
