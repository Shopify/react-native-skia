#pragma once

#include <JsiSkHostObjects.h>
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <modules/svg/include/SkSVGDOM.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkSvgStatic : public JsiSkHostObject {
public:
  JsiSkSvgStatic(RNSkPlatformContext *context);
};

class JsiSkSvg : public JsiSkWrappingSkPtrHostObject<SkSVGDOM> {
public:
  JsiSkSvg(RNSkPlatformContext *context, sk_sp<SkSVGDOM> svgdom)
      : JsiSkWrappingSkPtrHostObject<SkSVGDOM>(context, svgdom){};

  /**
    Returns the underlying object from a host object of this type
   */
  static sk_sp<SkSVGDOM> fromValue(jsi::Runtime &runtime,
                                   const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkSvg>(runtime)
        .get()
        ->getObject();
  }
};
} // namespace RNSkia
