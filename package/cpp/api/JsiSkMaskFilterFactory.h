#pragma once

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#include <SkMaskFilter.h>

namespace RNSkia {

using namespace facebook;

class JsiSkMaskFilterFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(MakeBlur) {
    int blurStyle = arguments[0].asNumber();
    float sigma = arguments[1].asNumber();
    bool respectCTM = arguments[2].getBool();
    return jsi::Object::createFromHostObject(
        runtime,
        std::make_shared<JsiSkMaskFilter>(
            getContext(),
            SkMaskFilter::MakeBlur((SkBlurStyle)blurStyle, sigma, respectCTM)));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkMaskFilterFactory, MakeBlur))

  JsiSkMaskFilterFactory(RNSkPlatformContext *context)
      : JsiSkHostObject(context) {}
};

} // namespace RNSkia
