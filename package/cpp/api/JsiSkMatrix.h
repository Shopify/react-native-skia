#pragma once

#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkMatrix.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkMatrix : public JsiSkWrappingSharedPtrHostObject<SkMatrix> {
public:
  // TODO-API: Properties?
  JSI_HOST_FUNCTION(set) {
    auto i = arguments[0].asNumber();
    auto v = arguments[1].asNumber();
    getObject()->set(i, v);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(get) {
    auto i = arguments[0].asNumber();
    auto v = getObject()->get(i);
    return jsi::Value(SkScalarToDouble(v));
  }

  JSI_HOST_FUNCTION(setScaleX) {
    auto v = arguments[0].asNumber();
    getObject()->setScaleX(v);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getScaleX) {
    auto v = getObject()->getScaleX();
    return jsi::Value(SkScalarToDouble(v));
  }

  JSI_HOST_FUNCTION(setScaleY) {
    auto v = arguments[0].asNumber();
    getObject()->setScaleY(v);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getScaleY) {
    auto v = getObject()->getScaleY();
    return jsi::Value(SkScalarToDouble(v));
  }

  JSI_HOST_FUNCTION(setSkewX) {
    auto v = arguments[0].asNumber();
    getObject()->setSkewX(v);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getSkewX) {
    auto v = getObject()->getSkewX();
    return jsi::Value(SkScalarToDouble(v));
  }

  JSI_HOST_FUNCTION(setSkewY) {
    auto v = arguments[0].asNumber();
    getObject()->setSkewY(v);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getSkewY) {
    auto v = getObject()->getSkewY();
    return jsi::Value(SkScalarToDouble(v));
  }

  JSI_HOST_FUNCTION(setTranslateX) {
    auto v = arguments[0].asNumber();
    getObject()->setTranslateX(v);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getTranslateX) {
    auto v = getObject()->getTranslateX();
    return jsi::Value(SkScalarToDouble(v));
  }

  JSI_HOST_FUNCTION(setTranslateY) {
    auto v = arguments[0].asNumber();
    getObject()->setTranslateY(v);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getTranslateY) {
    auto v = getObject()->getTranslateY();
    return jsi::Value(SkScalarToDouble(v));
  }

  JSI_HOST_FUNCTION(setPerspX) {
    auto v = arguments[0].asNumber();
    getObject()->setPerspX(v);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getPerspX) {
    auto v = getObject()->getPerspX();
    return jsi::Value(SkScalarToDouble(v));
  }

  JSI_HOST_FUNCTION(setPerspY) {
    auto v = arguments[0].asNumber();
    getObject()->setPerspY(v);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getPerspY) {
    auto v = getObject()->getPerspX();
    return jsi::Value(SkScalarToDouble(v));
  }

  JSI_HOST_FUNCTION(setRectToRect) {
    auto src = JsiSkRect::fromValue(runtime, arguments[0]).get();
    auto dest = JsiSkRect::fromValue(runtime, arguments[1]).get();
    auto scaleToFit = arguments[2].asNumber();
    getObject()->setRectToRect(*src, *dest,
                               JsiSkMatrix::getScaleToFit(scaleToFit));
    return jsi::Value::undefined();
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkMatrix, setRectToRect),
                       JSI_EXPORT_FUNC(JsiSkMatrix, getPerspY),
                       JSI_EXPORT_FUNC(JsiSkMatrix, setPerspY),
                       JSI_EXPORT_FUNC(JsiSkMatrix, getPerspX),
                       JSI_EXPORT_FUNC(JsiSkMatrix, setPerspX),
                       JSI_EXPORT_FUNC(JsiSkMatrix, getTranslateY),
                       JSI_EXPORT_FUNC(JsiSkMatrix, setTranslateY),
                       JSI_EXPORT_FUNC(JsiSkMatrix, getTranslateX),
                       JSI_EXPORT_FUNC(JsiSkMatrix, setTranslateX),
                       JSI_EXPORT_FUNC(JsiSkMatrix, getSkewY),
                       JSI_EXPORT_FUNC(JsiSkMatrix, setSkewY),
                       JSI_EXPORT_FUNC(JsiSkMatrix, getSkewX),
                       JSI_EXPORT_FUNC(JsiSkMatrix, setSkewX),
                       JSI_EXPORT_FUNC(JsiSkMatrix, getScaleY),
                       JSI_EXPORT_FUNC(JsiSkMatrix, setScaleY),
                       JSI_EXPORT_FUNC(JsiSkMatrix, getScaleX),
                       JSI_EXPORT_FUNC(JsiSkMatrix, setScaleX),
                       JSI_EXPORT_FUNC(JsiSkMatrix, get),
                       JSI_EXPORT_FUNC(JsiSkMatrix, set))

  JsiSkMatrix(RNSkPlatformContext *context, SkMatrix m)
      : JsiSkWrappingSharedPtrHostObject<SkMatrix>(
            context, std::make_shared<SkMatrix>(m)) {}

  /**
Returns the underlying object from a host object of this type
*/
  static std::shared_ptr<SkMatrix> fromValue(jsi::Runtime &runtime,
                                             const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkMatrix>(runtime)
        .get()
        ->getObject();
  }

  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkMatrix>(context, SkMatrix::I()));
    };
  }

private:
  static SkMatrix::ScaleToFit getScaleToFit(int scaleToFit) {
    switch (scaleToFit) {
    case 0:
      return SkMatrix::kFill_ScaleToFit;
    case 1:
      return SkMatrix::kStart_ScaleToFit;
    case 2:
      return SkMatrix::kCenter_ScaleToFit;
    case 3:
      return SkMatrix::kEnd_ScaleToFit;
    default:
      return SkMatrix::kFill_ScaleToFit;
    };
  }
};
} // namespace RNSkia
