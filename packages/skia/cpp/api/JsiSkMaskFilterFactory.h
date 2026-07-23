#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkColorFilter.h"
#include "JsiSkMaskFilter.h"
#include "JsiSkNativeObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkMaskFilter.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkMaskFilterFactory
    : public JsiSkNativeObject<JsiSkMaskFilterFactory> {
public:
  static constexpr const char *CLASS_NAME = "MaskFilterFactory";

  JSI_HOST_FUNCTION(MakeBlur) {
    int blurStyle = arguments[0].asNumber();
    float sigma = arguments[1].asNumber();
    bool respectCTM = arguments[2].getBool();
    return makeJsiObject(
        runtime,
        std::make_shared<JsiSkMaskFilter>(
            getContext(),
            SkMaskFilter::MakeBlur((SkBlurStyle)blurStyle, sigma, respectCTM)));
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installHostMethod(runtime, prototype, "MakeBlur",
                      &JsiSkMaskFilterFactory::MakeBlur);
  }

  explicit JsiSkMaskFilterFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkMaskFilterFactory>(std::move(context)) {}
};

} // namespace RNSkia
