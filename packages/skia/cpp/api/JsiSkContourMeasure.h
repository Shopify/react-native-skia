#pragma once

#include <memory>
#include <utility>

#include <jsi/jsi.h>

#include "JsiSkNativeObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkContourMeasure.h"

#include "JsiSkPath.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkContourMeasure
    : public JsiSkWrappingSkPtrNativeObject<JsiSkContourMeasure,
                                            SkContourMeasure> {
public:
  static constexpr const char *CLASS_NAME = "ContourMeasure";

  JsiSkContourMeasure(std::shared_ptr<RNSkPlatformContext> context,
                      const sk_sp<SkContourMeasure> contourMeasure)
      : JsiSkWrappingSkPtrNativeObject<JsiSkContourMeasure, SkContourMeasure>(
            std::move(context), std::move(contourMeasure)) {}

  JSI_HOST_FUNCTION(getPosTan) {
    auto dist = arguments[0].asNumber();
    SkPoint position;
    SkPoint tangent;
    auto result = getObject()->getPosTan(dist, &position, &tangent);
    if (!result) {
      throw jsi::JSError(runtime, "getPosTan() failed");
    }
    auto posTan = jsi::Array(runtime, 2);
    auto pos = makeJsiObject(
        runtime, std::make_shared<JsiSkPoint>(getContext(), position));
    auto tan = makeJsiObject(
        runtime, std::make_shared<JsiSkPoint>(getContext(), tangent));
    posTan.setValueAtIndex(runtime, 0, pos);
    posTan.setValueAtIndex(runtime, 1, tan);
    return posTan;
  }

  JSI_HOST_FUNCTION(length) {
    return jsi::Value(SkScalarToDouble(getObject()->length()));
  }

  JSI_HOST_FUNCTION(isClosed) { return jsi::Value(getObject()->isClosed()); }

  JSI_HOST_FUNCTION(getSegment) {
    auto start = arguments[0].asNumber();
    auto end = arguments[1].asNumber();
    auto startWithMoveTo = arguments[2].getBool();
    SkPathBuilder builder;
    auto result =
        getObject()->getSegment(start, end, &builder, startWithMoveTo);
    if (!result) {
      throw jsi::JSError(runtime, "getSegment() failed");
    }
    return JsiSkPath::toValue(runtime, getContext(), builder.snapshot());
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "getPosTan",
                      &JsiSkContourMeasure::getPosTan);
    installHostMethod(runtime, prototype, "length",
                      &JsiSkContourMeasure::length);
    installHostMethod(runtime, prototype, "isClosed",
                      &JsiSkContourMeasure::isClosed);
    installHostMethod(runtime, prototype, "getSegment",
                      &JsiSkContourMeasure::getSegment);
  }
};
} // namespace RNSkia
