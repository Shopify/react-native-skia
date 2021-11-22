#pragma once

#include "JsiSkHostObjects.h"
#include "JsiSkPathEffect.h"
#include <jsi/jsi.h>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkCornerPathEffect.h>
#include <SkDashPathEffect.h>
#include <SkDiscretePathEffect.h>
#include <SkPath.h>
#include <SkPathOps.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkPathFactory : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(Make) {
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), SkPath()));
  }

  JSI_HOST_FUNCTION(MakeFromSVGString) {
    auto svgString = arguments[0].asString(runtime).utf8(runtime);
    SkPath result;

    if (!SkParsePath::FromSVGString(svgString.c_str(), &result)) {
      jsi::detail::throwJSError(runtime, "Could not parse Svg path");
      return jsi::Value(nullptr);
    }

    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), result));
  }

  JSI_HOST_FUNCTION(MakeFromOp) {
    SkPath one = *JsiSkPath::fromValue(runtime, arguments[0]).get();
    SkPath two = *JsiSkPath::fromValue(runtime, arguments[1]).get();
    SkPathOp op = (SkPathOp)arguments[2].asNumber();
    SkPath result;
    bool success = Op(one, two, op, &result);
    if (!success) {
      return jsi::Value(nullptr);
    }
    return jsi::Object::createFromHostObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), result));
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPathFactory, Make),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, MakeFromSVGString),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, MakeFromOp))

  JsiSkPathFactory(RNSkPlatformContext *context) : JsiSkHostObject(context) {}
};

} // namespace RNSkia
