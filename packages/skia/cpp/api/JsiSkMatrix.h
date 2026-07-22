#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkNativeObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkMatrix.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkMatrix
    : public JsiSkWrappingSharedPtrNativeObject<JsiSkMatrix, SkMatrix> {
public:
  static constexpr const char *CLASS_NAME = "Matrix";

  JsiSkMatrix(std::shared_ptr<RNSkPlatformContext> context, SkMatrix m)
      : JsiSkWrappingSharedPtrNativeObject<JsiSkMatrix, SkMatrix>(
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
    auto matrix = tryGetJsiObject<JsiSkMatrix>(runtime, arguments[0]);
    if (matrix) {
      getObject()->preConcat(*matrix->getObject());
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

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Woverloaded-virtual"
  JSI_HOST_FUNCTION(get) {
    auto values = jsi::Array(runtime, 9);
    for (auto i = 0; i < 9; i++) {
      values.setValueAtIndex(runtime, i, getObject()->get(i));
    }
    return values;
  }
#pragma clang diagnostic pop

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "concat", &JsiSkMatrix::concat);
    installHostMethod(runtime, prototype, "translate", &JsiSkMatrix::translate);
    installHostMethod(runtime, prototype, "postTranslate",
                      &JsiSkMatrix::postTranslate);
    installHostMethod(runtime, prototype, "scale", &JsiSkMatrix::scale);
    installHostMethod(runtime, prototype, "postScale", &JsiSkMatrix::postScale);
    installHostMethod(runtime, prototype, "skew", &JsiSkMatrix::skew);
    installHostMethod(runtime, prototype, "postSkew", &JsiSkMatrix::postSkew);
    installHostMethod(runtime, prototype, "rotate", &JsiSkMatrix::rotate);
    installHostMethod(runtime, prototype, "postRotate",
                      &JsiSkMatrix::postRotate);
    installHostMethod(runtime, prototype, "identity", &JsiSkMatrix::identity);
    installHostMethod(runtime, prototype, "get", &JsiSkMatrix::get);
  }

  /**
   * Returns the underlying object from a host object of this type
   */
  static std::shared_ptr<SkMatrix> fromValue(jsi::Runtime &runtime,
                                             const jsi::Value &obj) {
    auto matrix = tryGetJsiObject<JsiSkMatrix>(runtime, obj);
    if (matrix) {
      return matrix->getObject();
    } else {
      return std::make_shared<SkMatrix>(JsiSkMatrix::getMatrix(runtime, obj));
    }
  }

  size_t getMemoryPressure() override {
    return std::max(sizeof(SkMatrix), kMinMemoryPressure);
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
      return makeJsiObject(
          runtime, std::make_shared<JsiSkMatrix>(context, std::move(matrix)));
    };
  }
};
} // namespace RNSkia
