#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkMatrix.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkMatrix : public JsiSkWrappingSharedPtrHostObject<SkMatrix> {
public:

  JsiSkMatrix(std::shared_ptr<RNSkPlatformContext> context, SkMatrix m)
      : JsiSkWrappingSharedPtrHostObject<SkMatrix>(
            context, std::make_shared<SkMatrix>(std::move(m))) {}

  /**
Returns the underlying object from a host object of this type
*/
  static std::shared_ptr<SkMatrix> fromValue(jsi::Runtime &runtime,
                                             const jsi::Value &obj) {
    const auto& object = obj.asObject(runtime);
    if (object.isHostObject(runtime)) {
      return object
              .asHostObject<JsiSkMatrix>(runtime)
              ->getObject();
    } else {
      const auto& array = object.asArray(runtime);
      auto scaleX = array.getValueAtIndex(runtime, 0).asNumber();
      auto skewX = array.getValueAtIndex(runtime, 1).asNumber();
      auto transX = array.getValueAtIndex(runtime, 2).asNumber();
      auto skewY = array.getValueAtIndex(runtime, 3).asNumber();
      auto scaleY = array.getValueAtIndex(runtime, 4).asNumber();
      auto transY = array.getValueAtIndex(runtime, 5).asNumber();
      auto pers0 = array.getValueAtIndex(runtime, 6).asNumber();
      auto pers1 = array.getValueAtIndex(runtime, 7).asNumber();
      auto pers2 = array.getValueAtIndex(runtime, 8).asNumber();
      return std::make_shared<SkMatrix>(SkMatrix::MakeAll(
        scaleX, skewX, transX,
        skewY,  scaleY, transY,
        pers0,  pers1,  pers2));
    }
  }

  static const jsi::HostFunctionType
  createCtor(std::shared_ptr<RNSkPlatformContext> context) {
    return JSI_HOST_FUNCTION_LAMBDA {
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkMatrix>(std::move(context), SkMatrix::I()));
    };
  }
};
} // namespace RNSkia
