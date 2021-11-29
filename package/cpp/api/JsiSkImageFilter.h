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
  JsiSkImageFilter(std::shared_ptr<RNSkPlatformContext> context,
                   sk_sp<SkImageFilter> imageFilter)
      : JsiSkWrappingSkPtrHostObject<SkImageFilter>(context, imageFilter){};

  // TODO: declare in JsiSkWrappingSkPtrHostObject via extra template parameter?
  JSI_PROPERTY_GET(__typename__) {
    return jsi::String::createFromUtf8(runtime, "ImageFilter");
  }

  JSI_EXPORT_PROPERTY_GETTERS(JSI_EXPORT_PROP_GET(JsiSkImageFilter, __typename__))

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkImageFilter> fromValue(jsi::Runtime &runtime,
                                        const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkImageFilter>(runtime)
        .get()
        ->getObject();
  }
};

} // namespace RNSkia
