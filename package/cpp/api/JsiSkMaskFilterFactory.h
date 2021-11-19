#pragma once

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include "JsiSkTypes.h"
#include <jsi/jsi.h>

#include <SkMaskFilter.h>

namespace RNSkia {

using namespace facebook;

class JsiSkMaskFilterFactory : public JsiSkHostObject {
public:
  JsiSkMaskFilterFactory(RNSkPlatformContext *context)
      : JsiSkHostObject(context) {
    installFunction(
        "MakeBlur", JSI_FUNC_SIGNATURE {
          int blurStyle = arguments[0].asNumber();
          float sigma = arguments[1].asNumber();
          bool respectCTM = arguments[2].getBool();
          return jsi::Object::createFromHostObject(
              runtime,
              std::make_shared<JsiSkMaskFilter>(
                  context, SkMaskFilter::MakeBlur((SkBlurStyle)blurStyle, sigma,
                                                  respectCTM)));
        });
  }
};

} // namespace RNSkia
