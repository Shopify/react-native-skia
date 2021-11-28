#pragma once

#include <JsiSkHostObjects.h>
#include <JsiSkImageFilter.h>
#include <JsiSkMaskFilter.h>
#include <JsiSkPathEffect.h>
#include <JsiSkShader.h>
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPaint.h>

#pragma clang diagnostic pop

namespace RNSkia {
using namespace facebook;

class JsiSkPaint : public JsiSkWrappingSharedPtrHostObject<SkPaint> {
public:
  JSI_HOST_FUNCTION(copy) {
    auto paint = getObject().get();
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPaint>(getContext(), SkPaint(*paint)));
  }

  JSI_HOST_FUNCTION(getColor) {
    return static_cast<double>(getObject()->getColor());
  }

  JSI_HOST_FUNCTION(getStrokeCap) {
    return static_cast<double>(getObject()->getStrokeCap());
  }

  JSI_HOST_FUNCTION(getStrokeJoin) {
    return static_cast<double>(getObject()->getStrokeJoin());
  }

  JSI_HOST_FUNCTION(getStrokeMiter) {
    return static_cast<double>(getObject()->getStrokeMiter());
  }

  JSI_HOST_FUNCTION(getStrokeWidth) {
    return static_cast<double>(getObject()->getStrokeWidth());
  }

  JSI_HOST_FUNCTION(setColor) {
    SkColor color = arguments[0].asNumber();
    getObject()->setColor(color);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setAlphaf) {
    SkScalar alpha = arguments[0].asNumber();
    getObject()->setAlphaf(alpha);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setAntiAlias) {
    bool antiAliased = arguments[0].getBool();
    getObject()->setAntiAlias(antiAliased);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeWidth) {
    SkScalar width = arguments[0].asNumber();
    getObject()->setStrokeWidth(width);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStyle) {
    int styleInt = arguments[0].asNumber();
    switch (styleInt) {
    case 0:
      getObject()->setStyle(SkPaint::kFill_Style);
      break;
    case 1:
      getObject()->setStyle(SkPaint::kStroke_Style);
      break;
      // This API is expected to be deprecated
      // https://github.com/flutter/flutter/issues/5912
      //                    case 2:
      //                        getObject()->setStyle(SkPaint::kStrokeAndFill_Style);
      //                        break;
    }
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeCap) {
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
  }

  JSI_HOST_FUNCTION(setStrokeJoin) {
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
  }

  JSI_HOST_FUNCTION(setStrokeMiter) {
    int limit = arguments[0].asNumber();
    getObject()->setStrokeMiter(limit);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setBlendMode) {
    auto blendMode = (SkBlendMode)arguments[0].asNumber();
    getObject()->setBlendMode(blendMode);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setMaskFilter) {
    auto maskFilter = JsiSkMaskFilter::fromValue(runtime, arguments[0]);
    getObject()->setMaskFilter(maskFilter);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setImageFilter) {
    auto imageFilter = JsiSkImageFilter::fromValue(runtime, arguments[0]);
    getObject()->setImageFilter(imageFilter);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setColorFilter) {
    auto colorFilter = JsiSkColorFilter::fromValue(runtime, arguments[0]);
    getObject()->setColorFilter(colorFilter);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setShader) {
    auto shader = JsiSkShader::fromValue(runtime, arguments[0]);
    getObject()->setShader(shader);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setPathEffect) {
    auto pathEffect = JsiSkPathEffect::fromValue(runtime, arguments[0]);
    getObject()->setPathEffect(pathEffect);
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPaint, copy),
                       JSI_EXPORT_FUNC(JsiSkPaint, getColor),
                       JSI_EXPORT_FUNC(JsiSkPaint, getStrokeCap),
                       JSI_EXPORT_FUNC(JsiSkPaint, getStrokeJoin),
                       JSI_EXPORT_FUNC(JsiSkPaint, getStrokeMiter),
                       JSI_EXPORT_FUNC(JsiSkPaint, getStrokeWidth),
                       JSI_EXPORT_FUNC(JsiSkPaint, setPathEffect),
                       JSI_EXPORT_FUNC(JsiSkPaint, setShader),
                       JSI_EXPORT_FUNC(JsiSkPaint, setColorFilter),
                       JSI_EXPORT_FUNC(JsiSkPaint, setImageFilter),
                       JSI_EXPORT_FUNC(JsiSkPaint, setMaskFilter),
                       JSI_EXPORT_FUNC(JsiSkPaint, setBlendMode),
                       JSI_EXPORT_FUNC(JsiSkPaint, setStrokeMiter),
                       JSI_EXPORT_FUNC(JsiSkPaint, setStrokeJoin),
                       JSI_EXPORT_FUNC(JsiSkPaint, setStrokeCap),
                       JSI_EXPORT_FUNC(JsiSkPaint, setAntiAlias),
                       JSI_EXPORT_FUNC(JsiSkPaint, setStrokeWidth),
                       JSI_EXPORT_FUNC(JsiSkPaint, setStyle),
                       JSI_EXPORT_FUNC(JsiSkPaint, setColor),
                       JSI_EXPORT_FUNC(JsiSkPaint, setAlphaf))

  JsiSkPaint(std::shared_ptr<RNSkPlatformContext> context, SkPaint paint)
      : JsiSkWrappingSharedPtrHostObject<SkPaint>(
            context, std::make_shared<SkPaint>(paint)) {}

  /**
Returns the underlying object from a host object of this type
*/
  static std::shared_ptr<SkPaint> fromValue(jsi::Runtime &runtime,
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
  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      // Return the newly constructed object
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkPaint>(context, SkPaint()));
    };
  }
};
} // namespace RNSkia
