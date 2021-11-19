#pragma once

#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkColorFilter.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkColorFilter : public JsiSkWrappingSkPtrHostObject<SkColorFilter> {
   public:
    JsiSkColorFilter(RNSkPlatformContext *context, sk_sp<SkColorFilter> colorFilter)
        : JsiSkWrappingSkPtrHostObject<SkColorFilter>(
              context,
              colorFilter) {}

    /**
      Returns the underlying object from a host object of this type
     */
    static sk_sp<SkColorFilter> fromValue(
        jsi::Runtime &runtime,
        const jsi::Value &obj) {
        return obj.asObject(runtime)
            .asHostObject<JsiSkColorFilter>(runtime)
            .get()
            ->getObject();
    }
};

} // namespace RNSkia
