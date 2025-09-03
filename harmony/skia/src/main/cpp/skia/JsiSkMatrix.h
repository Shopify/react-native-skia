#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkMatrix.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkMatrix : public JsiSkWrappingSharedPtrHostObject<SkMatrix> {
public:
  JsiSkMatrix(std::shared_ptr<RNSkPlatformContext> context, SkMatrix m)
      : JsiSkWrappingSharedPtrHostObject<SkMatrix>(
            context, std::make_shared<SkMatrix>(std::move(m))) {}

  static SkMatrix getMatrix(jsi::Runtime &runtime, const jsi::Value &value) {
    const auto &object = value.asObject(runtime);
    const auto &array = object.asArray(runtime);
    if (array.size(runtime) == 9) {
      auto scaleX = array.getValueAtIndex(runtime, 0).asNumber();
      auto skewX = array.getValueAtIndex(runtime, 1).asNumber();
      auto transX = array.getValueAtIndex(runtime, 2).asNumber();
      auto skewY = array.getValueAtIndex(runtime, 3).asNumber();
      auto scaleY = array.getValueAtIndex(runtime, 4).asNumber();
      auto transY = array.getValueAtIndex(runtime, 5).asNumber();
      auto pers0 = array.getValueAtIndex(runtime, 6).asNumber();
      auto pers1 = array.getValueAtIndex(runtime, 7).asNumber();
      auto pers2 = array.getValueAtIndex(runtime, 8).asNumber();
      return SkMatrix::MakeAll(scaleX, skewX, transX, skewY, scaleY, transY,
                               pers0, pers1, pers2);
    } else if (array.size(runtime) == 16) {
      auto m11 = array.getValueAtIndex(runtime, 0).asNumber();
      auto m12 = array.getValueAtIndex(runtime, 1).asNumber();
      auto m14 = array.getValueAtIndex(runtime, 3).asNumber();
      auto m21 = array.getValueAtIndex(runtime, 4).asNumber();
      auto m22 = array.getValueAtIndex(runtime, 5).asNumber();
      auto m24 = array.getValueAtIndex(runtime, 7).asNumber();
      auto m41 = array.getValueAtIndex(runtime, 12).asNumber();
      auto m42 = array.getValueAtIndex(runtime, 13).asNumber();
      auto m44 = array.getValueAtIndex(runtime, 15).asNumber();
      return SkMatrix::MakeAll(m11, m12, m14, m21, m22, m24, m41, m42, m44);
    }
    throw jsi::JSError(runtime,
                       "Expected array of length 9 or 16 for matrix, got " +
                           std::to_string(array.size(runtime)));
  }

  JSI_HOST_FUNCTION(concat) {
    if (arguments[0].isObject() &&
        arguments[0].asObject(runtime).isHostObject(runtime)) {
      auto m3 = JsiSkMatrix::fromValue(runtime, arguments[0]);
      getObject()->preConcat(*m3);
    } else {
      auto m3 = JsiSkMatrix::getMatrix(runtime, arguments[0]);
      getObject()->preConcat(m3);
    }
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(translate) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    getObject()->preTranslate(x, y);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(postTranslate) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    getObject()->postTranslate(x, y);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(scale) {
    auto x = arguments[0].asNumber();
    auto y = count > 1 ? arguments[1].asNumber() : 1;
    getObject()->preScale(x, y);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(postScale) {
    auto x = arguments[0].asNumber();
    auto y = count > 1 ? arguments[1].asNumber() : 1;
    getObject()->postScale(x, y);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(skew) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    getObject()->preSkew(x, y);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(postSkew) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    getObject()->postSkew(x, y);
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(rotate) {
    auto a = arguments[0].asNumber();
    getObject()->preRotate(SkRadiansToDegrees(a));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(postRotate) {
    auto a = arguments[0].asNumber();
    getObject()->postRotate(SkRadiansToDegrees(a));
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(identity) {
    getObject()->setIdentity();
    return thisValue.asObject(runtime);
  }

  JSI_HOST_FUNCTION(get) {
    auto values = jsi::Array(runtime, 9);
    for (auto i = 0; i < 9; i++) {
      values.setValueAtIndex(runtime, i, getObject()->get(i));
    }
    return values;
  }

  EXPORT_JSI_API_TYPENAME(JsiSkMatrix, Matrix)

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkMatrix, concat),
                       JSI_EXPORT_FUNC(JsiSkMatrix, translate),
                       JSI_EXPORT_FUNC(JsiSkMatrix, postTranslate),
                       JSI_EXPORT_FUNC(JsiSkMatrix, scale),
                       JSI_EXPORT_FUNC(JsiSkMatrix, postScale),
                       JSI_EXPORT_FUNC(JsiSkMatrix, skew),
                       JSI_EXPORT_FUNC(JsiSkMatrix, postSkew),
                       JSI_EXPORT_FUNC(JsiSkMatrix, rotate),
                       JSI_EXPORT_FUNC(JsiSkMatrix, postRotate),
                       JSI_EXPORT_FUNC(JsiSkMatrix, identity),
                       JSI_EXPORT_FUNC(JsiSkMatrix, get),
                       JSI_EXPORT_FUNC(JsiSkMatrix, dispose))

  /**
   * Returns the underlying object from a host object of this type
   */
  static std::shared_ptr<SkMatrix> fromValue(jsi::Runtime &runtime,
                                             const jsi::Value &obj) {
    const auto &object = obj.asObject(runtime);
    if (object.isHostObject(runtime)) {
      return object.asHostObject<JsiSkMatrix>(runtime)->getObject();
    } else {
      return std::make_shared<SkMatrix>(JsiSkMatrix::getMatrix(runtime, obj));
    }
  }

  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      SkMatrix matrix;
      if (count == 1) {
        matrix = JsiSkMatrix::getMatrix(runtime, arguments[0]);
      } else {
        matrix = SkMatrix::I();
      }
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkMatrix>(std::move(context), matrix));
    };
  }
};
} // namespace RNSkia
