#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "CustomBlendModes.h"
#include "JsiSkColor.h"
#include "JsiSkColorFilter.h"
#include "JsiSkImageFilter.h"
#include "JsiSkMaskFilter.h"
#include "JsiSkNativeObjects.h"
#include "JsiSkPathEffect.h"
#include "JsiSkShader.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPaint.h"

#pragma clang diagnostic pop

namespace RNSkia {
namespace jsi = facebook::jsi;

class JsiSkPaint
    : public JsiSkWrappingSharedPtrNativeObject<JsiSkPaint, SkPaint> {
public:
  static constexpr const char *CLASS_NAME = "Paint";

  JSI_HOST_FUNCTION(assign) {
    SkPaint *paint = JsiSkPaint::fromValue(runtime, arguments[0]).get();
    *getObject() = *paint;
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(copy) {
    const auto *paint = getObject().get();
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPaint>(getContext(), SkPaint(*paint)));
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
    SkColor color = JsiSkColor::fromValue(runtime, arguments[0]);
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

  JSI_HOST_FUNCTION(setDither) {
    bool dithered = arguments[0].getBool();
    getObject()->setDither(dithered);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeWidth) {
    SkScalar width = arguments[0].asNumber();
    getObject()->setStrokeWidth(width);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStyle) {
    auto style = arguments[0].asNumber();
    getObject()->setStyle(static_cast<SkPaint::Style>(style));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeCap) {
    auto cap = arguments[0].asNumber();
    getObject()->setStrokeCap(static_cast<SkPaint::Cap>(cap));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeJoin) {
    int join = arguments[0].asNumber();
    getObject()->setStrokeJoin(static_cast<SkPaint::Join>(join));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setStrokeMiter) {
    int limit = arguments[0].asNumber();
    getObject()->setStrokeMiter(limit);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setBlendMode) {
    int blendModeValue = static_cast<int>(arguments[0].asNumber());
    applyBlendMode(*getObject(), blendModeValue);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setMaskFilter) {
    auto maskFilter = arguments[0].isNull() || arguments[0].isUndefined()
                          ? nullptr
                          : JsiSkMaskFilter::fromValue(runtime, arguments[0]);
    getObject()->setMaskFilter(std::move(maskFilter));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setImageFilter) {
    auto imageFilter = arguments[0].isNull() || arguments[0].isUndefined()
                           ? nullptr
                           : JsiSkImageFilter::fromValue(runtime, arguments[0]);
    getObject()->setImageFilter(std::move(imageFilter));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setColorFilter) {
    auto colorFilter = arguments[0].isNull() || arguments[0].isUndefined()
                           ? nullptr
                           : JsiSkColorFilter::fromValue(runtime, arguments[0]);
    getObject()->setColorFilter(std::move(colorFilter));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setShader) {
    auto shader = arguments[0].isNull() || arguments[0].isUndefined()
                      ? nullptr
                      : JsiSkShader::fromValue(runtime, arguments[0]);
    getObject()->setShader(std::move(shader));
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(setPathEffect) {
    auto pathEffect = arguments[0].isNull() || arguments[0].isUndefined()
                          ? nullptr
                          : JsiSkPathEffect::fromValue(runtime, arguments[0]);
    getObject()->setPathEffect(std::move(pathEffect));
    return jsi::Value::undefined();
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "assign", &JsiSkPaint::assign);
    installHostMethod(runtime, prototype, "copy", &JsiSkPaint::copy);
    installHostMethod(runtime, prototype, "reset", &JsiSkPaint::reset);
    installHostMethod(runtime, prototype, "getAlphaf", &JsiSkPaint::getAlphaf);
    installHostMethod(runtime, prototype, "getColor", &JsiSkPaint::getColor);
    installHostMethod(runtime, prototype, "getStrokeCap",
                      &JsiSkPaint::getStrokeCap);
    installHostMethod(runtime, prototype, "getStrokeJoin",
                      &JsiSkPaint::getStrokeJoin);
    installHostMethod(runtime, prototype, "getStrokeMiter",
                      &JsiSkPaint::getStrokeMiter);
    installHostMethod(runtime, prototype, "getStrokeWidth",
                      &JsiSkPaint::getStrokeWidth);
    installHostMethod(runtime, prototype, "setPathEffect",
                      &JsiSkPaint::setPathEffect);
    installHostMethod(runtime, prototype, "setShader", &JsiSkPaint::setShader);
    installHostMethod(runtime, prototype, "setColorFilter",
                      &JsiSkPaint::setColorFilter);
    installHostMethod(runtime, prototype, "setImageFilter",
                      &JsiSkPaint::setImageFilter);
    installHostMethod(runtime, prototype, "setMaskFilter",
                      &JsiSkPaint::setMaskFilter);
    installHostMethod(runtime, prototype, "setBlendMode",
                      &JsiSkPaint::setBlendMode);
    installHostMethod(runtime, prototype, "setStrokeMiter",
                      &JsiSkPaint::setStrokeMiter);
    installHostMethod(runtime, prototype, "setStrokeJoin",
                      &JsiSkPaint::setStrokeJoin);
    installHostMethod(runtime, prototype, "setStrokeCap",
                      &JsiSkPaint::setStrokeCap);
    installHostMethod(runtime, prototype, "setAntiAlias",
                      &JsiSkPaint::setAntiAlias);
    installHostMethod(runtime, prototype, "setDither", &JsiSkPaint::setDither);
    installHostMethod(runtime, prototype, "setStrokeWidth",
                      &JsiSkPaint::setStrokeWidth);
    installHostMethod(runtime, prototype, "setStyle", &JsiSkPaint::setStyle);
    installHostMethod(runtime, prototype, "setColor", &JsiSkPaint::setColor);
    installHostMethod(runtime, prototype, "setAlphaf", &JsiSkPaint::setAlphaf);
  }

  JsiSkPaint(std::shared_ptr<RNSkPlatformContext> context, SkPaint paint)
      : JsiSkWrappingSharedPtrNativeObject<JsiSkPaint, SkPaint>(
            std::move(context), std::make_shared<SkPaint>(std::move(paint))) {}

  /**
    Returns the underlying object from a host object of this type
   */
  static std::shared_ptr<SkPaint> fromValue(jsi::Runtime &runtime,
                                            const jsi::Value &obj) {
    return objectFromValue(runtime, obj);
  }

  /**
   Copy from another paint
   */
  void fromPaint(const SkPaint &paint) {
    setObject(std::make_shared<SkPaint>(std::move(paint)));
  }

  size_t getMemoryPressure() override {
    return std::max(sizeof(SkPaint), kMinMemoryPressure);
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
      auto paint = SkPaint();
      paint.setAntiAlias(true);
      // Return the newly constructed object
      return makeJsiObject(runtime,
                           std::make_shared<JsiSkPaint>(context, paint));
    };
  }
};
} // namespace RNSkia
