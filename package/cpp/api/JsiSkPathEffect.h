#pragma once

#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkPathEffect.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkPathEffect : public JsiSkWrappingSkPtrHostObject<SkPathEffect> {
public:
  JsiSkPathEffect(std::shared_ptr<RNSkPlatformContext> context,
                  sk_sp<SkPathEffect> pathEffect)
      : JsiSkWrappingSkPtrHostObject<SkPathEffect>(context, pathEffect) {}

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkPathEffect> fromValue(jsi::Runtime &runtime,
                                       const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkPathEffect>(runtime)
        .get()
        ->getObject();
  }
};

} // namespace RNSkia
