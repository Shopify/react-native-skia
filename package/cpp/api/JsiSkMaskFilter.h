#pragma once

#include <map>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkMaskFilter.h"

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

using namespace facebook;

class JsiSkMaskFilter : public JsiSkWrappingSkPtrHostObject<SkMaskFilter> {
public:
  JsiSkMaskFilter(RNSkPlatformContext *context, const int blurStyle,
                  const float sigma)
      : JsiSkWrappingSkPtrHostObject<SkMaskFilter>(
            context,
            SkMaskFilter::MakeBlur((SkBlurStyle)blurStyle,
                                   sigma * context->getPixelDensity())) {}

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkMaskFilter> fromValue(jsi::Runtime &runtime,
                                       const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkMaskFilter>(runtime)
        .get()
        ->getObject();
  }

  /**
   * Creates the function for construction a new instance of the SkMaskFilter
   * wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the
   * SkMaskFilter class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_FUNC_SIGNATURE {
      int blurStyle = arguments[0].asNumber();
      float scalar = arguments[1].asNumber();
      return jsi::Object::createFromHostObject(
          runtime,
          std::make_shared<JsiSkMaskFilter>(context, blurStyle, scalar));
    };
  }
};

} // namespace RNSkia
