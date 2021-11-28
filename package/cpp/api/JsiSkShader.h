#pragma once

#include <JsiSkHostObjects.h>
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkGradientShader.h>
#include <SkShader.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkShader : public JsiSkWrappingSkPtrHostObject<SkShader> {
public:
  JsiSkShader(std::shared_ptr<RNSkPlatformContext> context,
              sk_sp<SkShader> shader)
      : JsiSkWrappingSkPtrHostObject<SkShader>(context, shader) {}

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkShader> fromValue(jsi::Runtime &runtime,
                                   const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkShader>(runtime)
        .get()
        ->getObject();
  }
};
} // namespace RNSkia
