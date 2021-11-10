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

class JsiSkImageFilterStatic : public JsiSkHostObject {
public:
  JsiSkImageFilterStatic(RNSkPlatformContext *context);
};

class JsiSkImageFilter : public JsiSkWrappingSkPtrHostObject<SkImageFilter> {
public:
  /**
   * Creates a new blur filter
   * @param context Platform context
   * @param sigmaX Sigma X
   * @param sigmaY Sigma Y
   * @param tileMode tilemode
   * @param input input
   */
  JsiSkImageFilter(RNSkPlatformContext *context, SkScalar sigmaX,
                   SkScalar sigmaY, SkTileMode tileMode,
                   sk_sp<SkImageFilter> input)
      : JsiSkWrappingSkPtrHostObject<SkImageFilter>(
            context, SkImageFilters::Blur(sigmaX, sigmaY, tileMode, input)){};

  /**
   * Creates a new color filter
   * @param context Platform context
   * @param cf cf
   * @param input input
   */
  JsiSkImageFilter(RNSkPlatformContext *context, sk_sp<SkColorFilter> cf,
                   sk_sp<SkImageFilter> input)
      : JsiSkWrappingSkPtrHostObject<SkImageFilter>(
            context, SkImageFilters::ColorFilter(cf, input)){};

  /**
   * Composes two filters
   * @param outer outer
   * @param inner inner
   */
  JsiSkImageFilter(RNSkPlatformContext *context, sk_sp<SkImageFilter> outer,
                   sk_sp<SkImageFilter> inner)
      : JsiSkWrappingSkPtrHostObject<SkImageFilter>(
            context, SkImageFilters::Compose(outer, inner)){};

  JsiSkImageFilter(RNSkPlatformContext *context, SkScalar dx, SkScalar dy,
                   SkScalar sigmaX, SkScalar sigmaY, SkColor color,
                   sk_sp<SkImageFilter> input)
      : JsiSkWrappingSkPtrHostObject<SkImageFilter>(
            context,
            SkImageFilters::DropShadow(dx, dy, sigmaX, sigmaY, color, input)){};

  JsiSkImageFilter(RNSkPlatformContext *context, SkScalar dx, SkScalar dy,
                   SkScalar sigmaX, SkScalar sigmaY, SkColor color,
                   sk_sp<SkImageFilter> input, bool only)
      : JsiSkWrappingSkPtrHostObject<SkImageFilter>(
            context, SkImageFilters::DropShadowOnly(dx, dy, sigmaX, sigmaY,
                                                    color, input)){};

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
