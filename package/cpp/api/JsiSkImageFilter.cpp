#include "JsiSkImageFilter.h"

namespace RNSkia {
using namespace facebook;

JsiSkImageFilterStatic::JsiSkImageFilterStatic(RNSkPlatformContext *context)
    : JsiSkHostObject(context) {
  installFunction(
      "blur", JSI_FUNC_SIGNATURE {
        float sigmaX = arguments[0].asNumber();
        float sigmaY = arguments[1].asNumber();
        int tileMode = arguments[2].asNumber();
        sk_sp<SkImageFilter> imageFilter;
        if (count == 4) {
          imageFilter = JsiSkImageFilter::fromValue(runtime, arguments[3]);
        }

        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkImageFilter>(context, sigmaX, sigmaY,
                                                        (SkTileMode)tileMode,
                                                        imageFilter));
      });

  installFunction(
      "color", JSI_FUNC_SIGNATURE {
        auto cf = JsiSkColorFilter::fromValue(runtime, arguments[0]);
        sk_sp<SkImageFilter> input;
        if (count == 2) {
          input = JsiSkImageFilter::fromValue(runtime, arguments[1]);
        }

        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkImageFilter>(context, cf, input));
      });

  installFunction(
      "compose", JSI_FUNC_SIGNATURE {
        auto outer = JsiSkImageFilter::fromValue(runtime, arguments[0]);
        auto inner = JsiSkImageFilter::fromValue(runtime, arguments[1]);

        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkImageFilter>(context, outer, inner));
      });

  installFunction(
      "dropshadow", JSI_FUNC_SIGNATURE {
        auto dx = arguments[0].asNumber();
        auto dy = arguments[1].asNumber();
        auto sigmaX = arguments[2].asNumber();
        auto sigmaY = arguments[3].asNumber();
        auto color = arguments[4].asNumber();
        return jsi::Object::createFromHostObject(
            runtime, std::make_shared<JsiSkImageFilter>(
                         context, dx, dy, sigmaX, sigmaY, color, nullptr));
      });

  installFunction(
      "dropshadowOnly", JSI_FUNC_SIGNATURE {
        auto dx = arguments[0].asNumber();
        auto dy = arguments[1].asNumber();
        auto sigmaX = arguments[2].asNumber();
        auto sigmaY = arguments[3].asNumber();
        auto color = arguments[4].asNumber();
        return jsi::Object::createFromHostObject(
            runtime,
            std::make_shared<JsiSkImageFilter>(context, dx, dy, sigmaX, sigmaY,
                                               color, nullptr, true));
      });
}

} // namespace RNSkia
