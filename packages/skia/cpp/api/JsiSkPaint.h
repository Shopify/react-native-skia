#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkColor.h"
#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include "JsiSkImageFilter.h"
#include "JsiSkMaskFilter.h"
#include "JsiSkPathEffect.h"
#include "JsiSkShader.h"

#include "JsiArgParser.h"
#include "JsiArgParserTypes.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPaint.h"

#pragma clang diagnostic pop

// ArgParser specializations for types used in JsiSkPaint
JSI_ARG_PARSER_SK_SP(SkMaskFilter, JsiSkMaskFilter)
JSI_ARG_PARSER_SK_SP(SkColorFilter, JsiSkColorFilter)
JSI_ARG_PARSER_SK_SP(SkShader, JsiSkShader)
JSI_ARG_PARSER_SK_SP(SkPathEffect, JsiSkPathEffect)

namespace RNSkia {
namespace jsi = facebook::jsi;

class JsiSkPaint : public JsiSkWrappingSharedPtrHostObject<SkPaint> {
public:
  EXPORT_JSI_API_TYPENAME(JsiSkPaint, Paint)

  JSI_HOST_FUNCTION(assign) {
    ArgParser parser(runtime, arguments, count);
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    *getObject() = *paint;
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(copy) {
    const auto *paint = getObject().get();
    auto hostObjectInstance =
        std::make_shared<JsiSkPaint>(getContext(), SkPaint(*paint));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(reset) {
    getObject()->reset();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getColor) {
    return JsiSkColor::toValue(runtime, getObject()->getColor());
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

  JSI_HOST_FUNCTION(getAlphaf) {
    float alphaf = getObject()->getAlphaf();
    return jsi::Value(SkScalarToDouble(alphaf));
  }

  JSI_HOST_FUNCTION(setColor) {
    ArgParser parser(runtime, arguments, count);
    auto color = parser.next<SkColor>();
    getObject()->setColor(color);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setAlphaf) {
    ArgParser parser(runtime, arguments, count);
    auto alpha = parser.next<SkScalar>();
    getObject()->setAlphaf(alpha);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setAntiAlias) {
    ArgParser parser(runtime, arguments, count);
    auto antiAliased = parser.next<bool>();
    getObject()->setAntiAlias(antiAliased);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setDither) {
    ArgParser parser(runtime, arguments, count);
    auto dithered = parser.next<bool>();
    getObject()->setDither(dithered);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeWidth) {
    ArgParser parser(runtime, arguments, count);
    auto width = parser.next<SkScalar>();
    getObject()->setStrokeWidth(width);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStyle) {
    ArgParser parser(runtime, arguments, count);
    auto style = parser.next<SkPaint::Style>();
    getObject()->setStyle(style);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeCap) {
    ArgParser parser(runtime, arguments, count);
    auto cap = parser.next<SkPaint::Cap>();
    getObject()->setStrokeCap(cap);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeJoin) {
    ArgParser parser(runtime, arguments, count);
    auto join = parser.next<SkPaint::Join>();
    getObject()->setStrokeJoin(join);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeMiter) {
    ArgParser parser(runtime, arguments, count);
    auto limit = parser.next<SkScalar>();
    getObject()->setStrokeMiter(limit);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setBlendMode) {
    ArgParser parser(runtime, arguments, count);
    auto blendMode = parser.next<SkBlendMode>();
    getObject()->setBlendMode(blendMode);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setMaskFilter) {
    ArgParser parser(runtime, arguments, count);
    auto maskFilter = parser.next<std::optional<sk_sp<SkMaskFilter>>>();
    getObject()->setMaskFilter(maskFilter.value_or(nullptr));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setImageFilter) {
    ArgParser parser(runtime, arguments, count);
    auto imageFilter = parser.next<std::optional<sk_sp<SkImageFilter>>>();
    getObject()->setImageFilter(imageFilter.value_or(nullptr));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setColorFilter) {
    ArgParser parser(runtime, arguments, count);
    auto colorFilter = parser.next<std::optional<sk_sp<SkColorFilter>>>();
    getObject()->setColorFilter(colorFilter.value_or(nullptr));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setShader) {
    ArgParser parser(runtime, arguments, count);
    auto shader = parser.next<std::optional<sk_sp<SkShader>>>();
    getObject()->setShader(shader.value_or(nullptr));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setPathEffect) {
    ArgParser parser(runtime, arguments, count);
    auto pathEffect = parser.next<std::optional<sk_sp<SkPathEffect>>>();
    getObject()->setPathEffect(pathEffect.value_or(nullptr));
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPaint, assign),
                       JSI_EXPORT_FUNC(JsiSkPaint, copy),
                       JSI_EXPORT_FUNC(JsiSkPaint, reset),
                       JSI_EXPORT_FUNC(JsiSkPaint, getAlphaf),
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
                       JSI_EXPORT_FUNC(JsiSkPaint, setDither),
                       JSI_EXPORT_FUNC(JsiSkPaint, setStrokeWidth),
                       JSI_EXPORT_FUNC(JsiSkPaint, setStyle),
                       JSI_EXPORT_FUNC(JsiSkPaint, setColor),
                       JSI_EXPORT_FUNC(JsiSkPaint, setAlphaf),
                       JSI_EXPORT_FUNC(JsiSkPaint, dispose))

  JsiSkPaint(std::shared_ptr<RNSkPlatformContext> context, SkPaint paint)
      : JsiSkWrappingSharedPtrHostObject<SkPaint>(
            std::move(context), std::make_shared<SkPaint>(std::move(paint))) {}

  /**
   Copy from another paint
   */
  void fromPaint(const SkPaint &paint) {
    setObject(std::make_shared<SkPaint>(std::move(paint)));
  }

  size_t getMemoryPressure() const override { return sizeof(SkPaint); }

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
      auto paint = SkPaint();
      paint.setAntiAlias(true);
      // Return the newly constructed object
      auto hostObjectInstance = std::make_shared<JsiSkPaint>(context, paint);
      return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
          runtime, hostObjectInstance, context);
    };
  }
};
} // namespace RNSkia
