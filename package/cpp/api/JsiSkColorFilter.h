#pragma once

#include "JsiSkHostObjects.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "SkColorFilter.h"

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkColorFilter : public JsiSkWrappingSkPtrHostObject<SkColorFilter> {
public:
  JsiSkColorFilter(RNSkPlatformContext *context, float matrix[20])
      : JsiSkWrappingSkPtrHostObject<SkColorFilter>(
            context, SkColorFilters::Matrix(matrix)) {}

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkColorFilter> fromValue(jsi::Runtime &runtime,
                                        const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkColorFilter>(runtime)
        .get()
        ->getObject();
  }

  /**
   * Creates the function for construction a new instance of the SkColorFilter
   * wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the
   * SkColorFilter class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_FUNC_SIGNATURE {
      // Handle constructor parameters
      auto jsiMatrix = arguments[0].asObject(runtime).asArray(runtime);
      float matrix[20];
      for (int i = 0; i < 20; i++) {
        if (jsiMatrix.size(runtime) > i) {
          matrix[i] = jsiMatrix.getValueAtIndex(runtime, i).asNumber();
        }
      }
      // Return the newly constructed object
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkColorFilter>(context, matrix));
    };
  }
};

} // namespace RNSkia
