#pragma once

#include <JsiSkHostObjects.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkGradientShader.h>
#include <SkShader.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

using namespace facebook;

class JsiSkShader : public JsiSkWrappingSkPtrHostObject<SkShader> {
public:
  JsiSkShader(RNSkPlatformContext *context, sk_sp<SkShader> shader)
      : JsiSkWrappingSkPtrHostObject<SkShader>(context, shader) {}

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkShader> fromValue(jsi::Runtime &runtime,
                                   const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkShader>(runtime)
        .get()
        ->getObject();
  }

  /**
   * Creates the function for construction a new instance of the SkShader
   * wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the
   * SkShader class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_FUNC_SIGNATURE {
      if (count == 1) {
        auto c = arguments[0].asNumber();
        return jsi::Object::createFromHostObject(
            runtime,
            std::make_shared<JsiSkShader>(context, SkShaders::Color(c)));
      } else if (count >= 4) {
        SkScalar x1 = arguments[0].asNumber();
        SkScalar y1 = arguments[1].asNumber();
        SkScalar x2 = arguments[2].asNumber();
        SkScalar y2 = arguments[3].asNumber();
        SkPoint pts[] = {{x1, y1}, {x2, y2}};

        auto jsiColors = arguments[4].asObject(runtime).asArray(runtime);
        auto size = jsiColors.size(runtime);
        std::vector<SkColor> colors;
        for (int i = 0; i < size; i++) {
          SkColor color = jsiColors.getValueAtIndex(runtime, i).asNumber();
          colors.push_back(color);
        }

        auto jsiPositions = arguments[5].asObject(runtime).asArray(runtime);
        auto positionsSize = jsiPositions.size(runtime);
        std::vector<SkScalar> positions;
        for (int i = 0; i < positionsSize; i++) {
          SkColor color = jsiPositions.getValueAtIndex(runtime, i).asNumber();
          positions.push_back(color);
        }

        auto tileMode = arguments[6].asNumber();

        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkShader>(
                         context, SkGradientShader::MakeLinear(
                                      pts, colors.data(), positions.data(),
                                      (int)size, (SkTileMode)tileMode)));
      } else {
        jsi::detail::throwJSError(runtime, "Expected 1-7 parameters");
      }

      return jsi::Value::undefined();
    };
  }
};
} // namespace RNSkia
