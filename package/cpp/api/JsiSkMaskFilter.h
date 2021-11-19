#pragma once

#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkMaskFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkMaskFilter : public JsiSkWrappingSkPtrHostObject<SkMaskFilter> {
public:
  JsiSkMaskFilter(RNSkPlatformContext *context, sk_sp<SkMaskFilter> maskFilter)
      : JsiSkWrappingSkPtrHostObject<SkMaskFilter>(context, maskFilter) {}

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
};

} // namespace RNSkia
