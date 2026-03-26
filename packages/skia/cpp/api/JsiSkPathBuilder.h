#pragma once

#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkPath.h"
#include "JsiSkPoint.h"
#include "JsiSkRect.h"
#include "JsiSkRRect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPath.h"
#include "include/core/SkPathBuilder.h"
#include "include/core/SkPathTypes.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

/**
 * JsiSkPathBuilder exposes SkPathBuilder as a first-class JS host object with
 * explicit builder semantics. Mutation methods return |this| for chaining.
 * Call snapshot() for a non-destructive SkPath copy, or build() to detach and
 * reset the builder.
 *
 * This is distinct from JsiSkPath, which wraps SkPathBuilder for backwards
 * compatibility with the existing Path JS API.
 */
class JsiSkPathBuilder
    : public JsiSkWrappingSharedPtrHostObject<SkPathBuilder> {
public:
  // -------------------------------------------------------------------------
  // Contour verbs
  // -------------------------------------------------------------------------

  JSI_HOST_FUNCTION(moveTo) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->moveTo(x, y);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(lineTo) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->lineTo(x, y);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(quadTo) {
    auto x1 = arguments[0].asNumber();
    auto y1 = arguments[1].asNumber();
    auto x2 = arguments[2].asNumber();
    auto y2 = arguments[3].asNumber();
    getObject()->quadTo(x1, y1, x2, y2);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(conicTo) {
    auto x1 = arguments[0].asNumber();
    auto y1 = arguments[1].asNumber();
    auto x2 = arguments[2].asNumber();
    auto y2 = arguments[3].asNumber();
    auto w = arguments[4].asNumber();
    getObject()->conicTo(x1, y1, x2, y2, w);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(cubicTo) {
    auto x1 = arguments[0].asNumber();
    auto y1 = arguments[1].asNumber();
    auto x2 = arguments[2].asNumber();
    auto y2 = arguments[3].asNumber();
    auto x3 = arguments[4].asNumber();
    auto y3 = arguments[5].asNumber();
    getObject()->cubicTo(x1, y1, x2, y2, x3, y3);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(close) {
    getObject()->close();
    return thisValue.getObject(runtime);
  }

  // -------------------------------------------------------------------------
  // Relative contour verbs
  // -------------------------------------------------------------------------

  JSI_HOST_FUNCTION(rMoveTo) {
    SkScalar dx = arguments[0].asNumber();
    SkScalar dy = arguments[1].asNumber();
    getObject()->rMoveTo(dx, dy);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rLineTo) {
    SkScalar dx = arguments[0].asNumber();
    SkScalar dy = arguments[1].asNumber();
    getObject()->rLineTo(dx, dy);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rQuadTo) {
    auto dx1 = arguments[0].asNumber();
    auto dy1 = arguments[1].asNumber();
    auto dx2 = arguments[2].asNumber();
    auto dy2 = arguments[3].asNumber();
    getObject()->rQuadTo(dx1, dy1, dx2, dy2);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rConicTo) {
    auto dx1 = arguments[0].asNumber();
    auto dy1 = arguments[1].asNumber();
    auto dx2 = arguments[2].asNumber();
    auto dy2 = arguments[3].asNumber();
    auto w = arguments[4].asNumber();
    getObject()->rConicTo(dx1, dy1, dx2, dy2, w);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rCubicTo) {
    auto dx1 = arguments[0].asNumber();
    auto dy1 = arguments[1].asNumber();
    auto dx2 = arguments[2].asNumber();
    auto dy2 = arguments[3].asNumber();
    auto dx3 = arguments[4].asNumber();
    auto dy3 = arguments[5].asNumber();
    getObject()->rCubicTo(dx1, dy1, dx2, dy2, dx3, dy3);
    return thisValue.getObject(runtime);
  }

  // -------------------------------------------------------------------------
  // Arc variants
  // -------------------------------------------------------------------------

  JSI_HOST_FUNCTION(arcToOval) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto start = arguments[1].asNumber();
    auto sweep = arguments[2].asNumber();
    auto forceMoveTo = arguments[3].getBool();
    getObject()->arcTo(*rect, start, sweep, forceMoveTo);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(arcToTangent) {
    auto x1 = arguments[0].asNumber();
    auto y1 = arguments[1].asNumber();
    auto x2 = arguments[2].asNumber();
    auto y2 = arguments[3].asNumber();
    auto r = arguments[4].asNumber();
    getObject()->arcTo(SkPoint::Make(x1, y1), SkPoint::Make(x2, y2), r);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(arcToRotated) {
    auto rx = arguments[0].asNumber();
    auto ry = arguments[1].asNumber();
    auto xAxisRotate = arguments[2].asNumber();
    auto useSmallArc = arguments[3].getBool();
    auto arcSize = useSmallArc ? SkPathBuilder::ArcSize::kSmall_ArcSize
                               : SkPathBuilder::ArcSize::kLarge_ArcSize;
    auto sweep =
        arguments[4].getBool() ? SkPathDirection::kCCW : SkPathDirection::kCW;
    auto x = arguments[5].asNumber();
    auto y = arguments[6].asNumber();
    getObject()->arcTo(SkPoint::Make(rx, ry), xAxisRotate, arcSize, sweep,
                       SkPoint::Make(x, y));
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rArcTo) {
    auto rx = arguments[0].asNumber();
    auto ry = arguments[1].asNumber();
    auto xAxisRotate = arguments[2].asNumber();
    auto useSmallArc = arguments[3].getBool();
    auto arcSize = useSmallArc ? SkPathBuilder::ArcSize::kSmall_ArcSize
                               : SkPathBuilder::ArcSize::kLarge_ArcSize;
    auto sweep =
        arguments[4].getBool() ? SkPathDirection::kCCW : SkPathDirection::kCW;
    auto dx = arguments[5].asNumber();
    auto dy = arguments[6].asNumber();
    getObject()->rArcTo(SkPoint::Make(rx, ry), xAxisRotate, arcSize, sweep,
                        SkVector::Make(dx, dy));
    return thisValue.getObject(runtime);
  }

  // -------------------------------------------------------------------------
  // Contour shapes
  // -------------------------------------------------------------------------

  JSI_HOST_FUNCTION(addArc) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto start = arguments[1].asNumber();
    auto sweep = arguments[2].asNumber();
    getObject()->addArc(*rect, start, sweep);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addRect) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && !arguments[1].isUndefined() && !arguments[1].isNull() &&
        arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    getObject()->addRect(*rect, direction);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addOval) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && !arguments[1].isUndefined() && !arguments[1].isNull() &&
        arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    unsigned startIndex = (count >= 3 && !arguments[2].isUndefined())
                              ? static_cast<unsigned>(arguments[2].asNumber())
                              : 1;
    getObject()->addOval(*rect, direction, startIndex);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addRRect) {
    auto rrect = JsiSkRRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && !arguments[1].isUndefined() && !arguments[1].isNull() &&
        arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    getObject()->addRRect(*rrect, direction);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addCircle) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    auto r = arguments[2].asNumber();
    auto direction = SkPathDirection::kCW;
    if (count >= 4 && !arguments[3].isUndefined() && !arguments[3].isNull() &&
        arguments[3].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    getObject()->addCircle(x, y, r, direction);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addPolygon) {
    std::vector<SkPoint> points;
    auto jsiPoints = arguments[0].asObject(runtime).asArray(runtime);
    auto close = arguments[1].getBool();
    auto pointsSize = jsiPoints.size(runtime);
    points.reserve(pointsSize);
    for (size_t i = 0; i < pointsSize; i++) {
      std::shared_ptr<SkPoint> point = JsiSkPoint::fromValue(
          runtime, jsiPoints.getValueAtIndex(runtime, i).asObject(runtime));
      points.push_back(*point.get());
    }
    getObject()->addPolygon(SkSpan(points.data(), points.size()), close);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addPath) {
    SkPath srcPath = JsiSkPath::pathFromValue(runtime, arguments[0]);
    auto mode = (count > 1 && !arguments[1].isUndefined() &&
                 !arguments[1].isNull() && arguments[1].isBool() &&
                 arguments[1].getBool())
                    ? SkPath::kExtend_AddPathMode
                    : SkPath::kAppend_AddPathMode;
    getObject()->addPath(srcPath, mode);
    return thisValue.getObject(runtime);
  }

  // -------------------------------------------------------------------------
  // State mutation
  // -------------------------------------------------------------------------

  JSI_HOST_FUNCTION(reset) {
    getObject()->reset();
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(setFillType) {
    auto ft = static_cast<SkPathFillType>(arguments[0].asNumber());
    getObject()->setFillType(ft);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(setIsVolatile) {
    auto v = arguments[0].getBool();
    getObject()->setIsVolatile(v);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(setLastPoint) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->setLastPoint(SkPoint::Make(x, y));
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(setPoint) {
    auto index = static_cast<size_t>(arguments[0].asNumber());
    SkScalar x = arguments[1].asNumber();
    SkScalar y = arguments[2].asNumber();
    getObject()->setPoint(index, SkPoint::Make(x, y));
    return thisValue.getObject(runtime);
  }

  // -------------------------------------------------------------------------
  // Query / snapshot
  // -------------------------------------------------------------------------

  JSI_HOST_FUNCTION(snapshot) {
    SkPath path = getObject()->snapshot();
    auto hostObjectInstance = std::make_shared<JsiSkPath>(getContext(), path);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, hostObjectInstance,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(build) {
    SkPath path = getObject()->detach();
    auto hostObjectInstance = std::make_shared<JsiSkPath>(getContext(), path);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, hostObjectInstance,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(computeBounds) {
    SkRect result = getObject()->computeBounds();
    auto hostObjectInstance = std::make_shared<JsiSkRect>(getContext(), result);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, hostObjectInstance,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(computeTightBounds) {
    auto tightBounds = getObject()->computeTightBounds();
    SkRect result = tightBounds.has_value() ? *tightBounds : SkRect::MakeEmpty();
    auto hostObjectInstance = std::make_shared<JsiSkRect>(getContext(), result);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, hostObjectInstance,
                                                       getContext());
  }

  JSI_HOST_FUNCTION(isEmpty) {
    return jsi::Value(getObject()->isEmpty());
  }

  JSI_HOST_FUNCTION(countPoints) {
    return jsi::Value(getObject()->countPoints());
  }

  JSI_HOST_FUNCTION(countVerbs) {
    return jsi::Value(static_cast<int>(getObject()->verbs().size()));
  }

  // -------------------------------------------------------------------------
  // Export
  // -------------------------------------------------------------------------

  EXPORT_JSI_API_TYPENAME(JsiSkPathBuilder, PathBuilder)

  JSI_EXPORT_FUNCTIONS(
      JSI_EXPORT_FUNC(JsiSkPathBuilder, moveTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, lineTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, quadTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, conicTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, cubicTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, close),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, rMoveTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, rLineTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, rQuadTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, rConicTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, rCubicTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, arcToOval),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, arcToTangent),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, arcToRotated),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, rArcTo),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, addArc),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, addRect),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, addOval),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, addRRect),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, addCircle),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, addPolygon),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, addPath),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, reset),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, setFillType),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, setIsVolatile),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, setLastPoint),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, setPoint),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, snapshot),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, build),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, computeBounds),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, computeTightBounds),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, isEmpty),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, countPoints),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, countVerbs),
      JSI_EXPORT_FUNC(JsiSkPathBuilder, dispose))

  JsiSkPathBuilder(std::shared_ptr<RNSkPlatformContext> context,
                   SkPathBuilder builder)
      : JsiSkWrappingSharedPtrHostObject<SkPathBuilder>(
            std::move(context),
            std::make_shared<SkPathBuilder>(std::move(builder))) {}

  size_t getMemoryPressure() const override {
    auto builder = getObject();
    if (!builder) {
      return 0;
    }
    return builder->snapshot().approximateBytesUsed();
  }

  std::string getObjectType() const override { return "JsiSkPathBuilder"; }
};

} // namespace RNSkia
