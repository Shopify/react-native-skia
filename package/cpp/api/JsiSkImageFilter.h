#pragma once

#include "JsiSkColorFilter.h"
#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkColorFilter.h>
#include <SkImageFilters.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkImageFilter : public JsiSkWrappingSkPtrHostObject<SkImageFilter> {
   public:
    JsiSkImageFilter(
        RNSkPlatformContext *context,
        sk_sp<SkImageFilter> imageFilter)
        : JsiSkWrappingSkPtrHostObject<SkImageFilter>(
              context,
              imageFilter){};

    /**
      Returns the underlying object from a host object of this type
     */
    static sk_sp<SkImageFilter> fromValue(
        jsi::Runtime &runtime,
        const jsi::Value &obj) {
        return obj.asObject(runtime)
            .asHostObject<JsiSkImageFilter>(runtime)
            .get()
            ->getObject();
    }
};

} // namespace RNSkia
