#pragma once

#include <JsiSkHostObjects.h>
#include <JsiSkImageFilter.h>
#include <JsiSkMaskFilter.h>
#include <JsiSkShader.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPaint.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {
using namespace facebook;

class JsiSkPaint : public JsiSkWrappingSharedPtrHostObject<SkPaint> {
public:
  JsiSkPaint(RNSkPlatformContext *context)
      : JsiSkWrappingSharedPtrHostObject<SkPaint>(context,
                                                  std::make_shared<SkPaint>()) {
    installFunction(
        "setColor", JSI_FUNC_SIGNATURE {
          SkColor color = arguments[0].asNumber();
          getObject()->setColor(color);
          return jsi::Value::undefined();
        });

    installFunction(
        "setAlpha", JSI_FUNC_SIGNATURE {
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
          case 2:
            getObject()->setStyle(SkPaint::kStrokeAndFill_Style);
            break;
          }
          return jsi::Value::undefined();
        });

    installFunction(
        "setBlendMode", JSI_FUNC_SIGNATURE {
          int blendMode = arguments[0].asNumber();
          getObject()->setBlendMode((SkBlendMode)blendMode);
          return jsi::Value::undefined();
        });

    installFunction(
        "setStrokeCap", JSI_FUNC_SIGNATURE {
          int strokeCap = arguments[0].asNumber();
          getObject()->setStrokeCap((SkPaint::Cap)strokeCap);
          return jsi::Value::undefined();
        });

    installFunction(
        "setMaskFilter", JSI_FUNC_SIGNATURE {
          auto maskFilter = JsiSkMaskFilter::fromValue(runtime, arguments[0]);
          getObject()->setMaskFilter(maskFilter);
          return jsi::Value::undefined();
        });

    installFunction(
        "setImageFilter", JSI_FUNC_SIGNATURE {
          auto imageFilter = JsiSkImageFilter::fromValue(runtime, arguments[0]);
          getObject()->setImageFilter(imageFilter);
          return jsi::Value::undefined();
        });

    installFunction(
        "setColorFilter", JSI_FUNC_SIGNATURE {
          auto colorFilter = JsiSkColorFilter::fromValue(runtime, arguments[0]);
          getObject()->setColorFilter(colorFilter);
          return jsi::Value::undefined();
        });

    installFunction(
        "setShader", JSI_FUNC_SIGNATURE {
          auto shader = JsiSkShader::fromValue(runtime, arguments[0]);
          getObject()->setShader(shader);
          return jsi::Value::undefined();
        });

    installProperty(
        "antialias",
        [this](jsi::Runtime &) -> jsi::Value {
          return jsi::Value(getObject()->isAntiAlias());
        },
        [this](jsi::Runtime &, const jsi::Value &value) {
          getObject()->setAntiAlias(value.getBool());
        });

    installProperty(
        "color",
        [this](jsi::Runtime &) -> jsi::Value {
          double color = getObject()->getColor();
          return jsi::Value(color);
        },
        [this](jsi::Runtime &, const jsi::Value &value) {
          getObject()->setColor(value.asNumber());
        });
  }

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
   * @return A function for creating a new host object wrapper for the SkPaint
   * class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_FUNC_SIGNATURE {
      // Return the newly constructed object
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkPaint>(context));
    };
  }
};
} // namespace RNSkia
