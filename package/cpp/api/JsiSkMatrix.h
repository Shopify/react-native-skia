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
  JsiSkMatrix(RNSkPlatformContext *context, SkMatrix m)
      : JsiSkWrappingSharedPtrHostObject<SkMatrix>(
            context, std::make_shared<SkMatrix>(m)) {
    installFunction(
        "set", JSI_FUNC_SIGNATURE {
          auto i = arguments[0].asNumber();
          auto v = arguments[1].asNumber();
          getObject()->set(i, v);
          return jsi::Value::undefined();
        });

    installFunction(
        "get", JSI_FUNC_SIGNATURE {
          auto i = arguments[0].asNumber();
          auto v = getObject()->get(i);
          return jsi::Value(SkScalarToDouble(v));
        });

    installFunction(
        "setScaleX", JSI_FUNC_SIGNATURE {
          auto v = arguments[0].asNumber();
          getObject()->setScaleX(v);
          return jsi::Value::undefined();
        });

    installFunction(
        "getScaleX", JSI_FUNC_SIGNATURE {
          auto v = getObject()->getScaleX();
          return jsi::Value(SkScalarToDouble(v));
        });

    installFunction(
        "setScaleY", JSI_FUNC_SIGNATURE {
          auto v = arguments[0].asNumber();
          getObject()->setScaleY(v);
          return jsi::Value::undefined();
        });

    installFunction(
        "getScaleY", JSI_FUNC_SIGNATURE {
          auto v = getObject()->getScaleY();
          return jsi::Value(SkScalarToDouble(v));
        });

    installFunction(
        "setSkewX", JSI_FUNC_SIGNATURE {
          auto v = arguments[0].asNumber();
          getObject()->setSkewX(v);
          return jsi::Value::undefined();
        });

    installFunction(
        "getSkewX", JSI_FUNC_SIGNATURE {
          auto v = getObject()->getSkewX();
          return jsi::Value(SkScalarToDouble(v));
        });

    installFunction(
        "setSkewY", JSI_FUNC_SIGNATURE {
          auto v = arguments[0].asNumber();
          getObject()->setSkewY(v);
          return jsi::Value::undefined();
        });

    installFunction(
        "getSkewY", JSI_FUNC_SIGNATURE {
          auto v = getObject()->getSkewY();
          return jsi::Value(SkScalarToDouble(v));
        });

    installFunction(
        "setTranslateX", JSI_FUNC_SIGNATURE {
          auto v = arguments[0].asNumber();
          getObject()->setTranslateX(v);
          return jsi::Value::undefined();
        });

    installFunction(
        "getTranslateX", JSI_FUNC_SIGNATURE {
          auto v = getObject()->getTranslateX();
          return jsi::Value(SkScalarToDouble(v));
        });

    installFunction(
        "setTranslateY", JSI_FUNC_SIGNATURE {
          auto v = arguments[0].asNumber();
          getObject()->setTranslateY(v);
          return jsi::Value::undefined();
        });

    installFunction(
        "getTranslateY", JSI_FUNC_SIGNATURE {
          auto v = getObject()->getTranslateY();
          return jsi::Value(SkScalarToDouble(v));
        });

    installFunction(
        "setPerspX", JSI_FUNC_SIGNATURE {
          auto v = arguments[0].asNumber();
          getObject()->setPerspX(v);
          return jsi::Value::undefined();
        });

    installFunction(
        "getPerspX", JSI_FUNC_SIGNATURE {
          auto v = getObject()->getPerspX();
          return jsi::Value(SkScalarToDouble(v));
        });

    installFunction(
        "setPerspY", JSI_FUNC_SIGNATURE {
          auto v = arguments[0].asNumber();
          getObject()->setPerspY(v);
          return jsi::Value::undefined();
        });

    installFunction(
        "getPerspY", JSI_FUNC_SIGNATURE {
          auto v = getObject()->getPerspX();
          return jsi::Value(SkScalarToDouble(v));
        });

    installFunction(
        "setRectToRect", JSI_FUNC_SIGNATURE {
          auto src = JsiSkRect::fromValue(runtime, arguments[0]).get();
          auto dest = JsiSkRect::fromValue(runtime, arguments[1]).get();
          auto scaleToFit = arguments[2].asNumber();
          getObject()->setRectToRect(*src, *dest,
                                     JsiSkMatrix::getScaleToFit(scaleToFit));
          return jsi::Value::undefined();
        });
  }

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
    return JSI_FUNC_SIGNATURE {
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
