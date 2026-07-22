#pragma once

#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkMatrix.h"
#include "JsiSkNativeObjects.h"
#include "JsiSkPath.h"
#include "JsiSkPoint.h"
#include "JsiSkRRect.h"
#include "JsiSkRect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPath.h"
#include "include/core/SkPathBuilder.h"
#include "include/core/SkPathTypes.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPathBuilder
    : public JsiSkWrappingSharedPtrNativeObject<JsiSkPathBuilder,
                                                SkPathBuilder> {
public:
  static constexpr const char *CLASS_NAME = "PathBuilder";

  // Movement methods
  JSI_HOST_FUNCTION(moveTo) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->moveTo(x, y);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rMoveTo) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->rMoveTo({x, y});
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(lineTo) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->lineTo(x, y);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rLineTo) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->rLineTo(x, y);
    return thisValue.getObject(runtime);
  }

  // Curve methods
  JSI_HOST_FUNCTION(quadTo) {
    auto x1 = arguments[0].asNumber();
    auto y1 = arguments[1].asNumber();
    auto x2 = arguments[2].asNumber();
    auto y2 = arguments[3].asNumber();
    getObject()->quadTo(x1, y1, x2, y2);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rQuadTo) {
    auto x1 = arguments[0].asNumber();
    auto y1 = arguments[1].asNumber();
    auto x2 = arguments[2].asNumber();
    auto y2 = arguments[3].asNumber();
    getObject()->rQuadTo(x1, y1, x2, y2);
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

  JSI_HOST_FUNCTION(rConicTo) {
    auto x1 = arguments[0].asNumber();
    auto y1 = arguments[1].asNumber();
    auto x2 = arguments[2].asNumber();
    auto y2 = arguments[3].asNumber();
    auto w = arguments[4].asNumber();
    getObject()->rConicTo(x1, y1, x2, y2, w);
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

  JSI_HOST_FUNCTION(rCubicTo) {
    auto x1 = arguments[0].asNumber();
    auto y1 = arguments[1].asNumber();
    auto x2 = arguments[2].asNumber();
    auto y2 = arguments[3].asNumber();
    auto x3 = arguments[4].asNumber();
    auto y3 = arguments[5].asNumber();
    getObject()->rCubicTo(x1, y1, x2, y2, x3, y3);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(close) {
    getObject()->close();
    return thisValue.getObject(runtime);
  }

  // Arc methods
  JSI_HOST_FUNCTION(arcToOval) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto start = arguments[1].asNumber();
    auto sweep = arguments[2].asNumber();
    auto forceMoveTo = arguments[3].getBool();
    getObject()->arcTo(*rect, start, sweep, forceMoveTo);
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
    SkPoint r(rx, ry);
    SkVector d(dx, dy);
    getObject()->rArcTo(r, xAxisRotate, arcSize, sweep, d);
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

  // Shape methods
  JSI_HOST_FUNCTION(addRect) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    getObject()->addRect(*rect, direction);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addOval) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    unsigned startIndex = count < 3 ? 0 : arguments[2].asNumber();
    getObject()->addOval(*rect, direction, startIndex);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addArc) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto start = arguments[1].asNumber();
    auto sweep = arguments[2].asNumber();
    getObject()->addArc(*rect, start, sweep);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addRRect) {
    auto rrect = JsiSkRRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
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
    if (count >= 4 && arguments[3].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    getObject()->addCircle(x, y, r, direction);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addPoly) {
    std::vector<SkPoint> points;
    auto jsiPoints = arguments[0].asObject(runtime).asArray(runtime);
    auto close = arguments[1].getBool();
    auto pointsSize = jsiPoints.size(runtime);
    points.reserve(pointsSize);
    for (int i = 0; i < pointsSize; i++) {
      std::shared_ptr<SkPoint> point = JsiSkPoint::fromValue(
          runtime, jsiPoints.getValueAtIndex(runtime, i).asObject(runtime));
      points.push_back(*point.get());
    }
    getObject()->addPolygon(SkSpan(points.data(), points.size()), close);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addPath) {
    auto src = JsiSkPath::fromValue(runtime, arguments[0]);
    auto srcPath = src->snapshot();
    auto matrix =
        count > 1 && !arguments[1].isUndefined() && !arguments[1].isNull()
            ? JsiSkMatrix::fromValue(runtime, arguments[1])
            : nullptr;
    auto mode = count > 2 && arguments[2].isBool() && arguments[2].getBool()
                    ? SkPath::kExtend_AddPathMode
                    : SkPath::kAppend_AddPathMode;
    if (matrix == nullptr) {
      getObject()->addPath(srcPath, mode);
    } else {
      getObject()->addPath(srcPath, *matrix, mode);
    }
    return thisValue.getObject(runtime);
  }

  // Configuration methods
  JSI_HOST_FUNCTION(setFillType) {
    auto ft = (SkPathFillType)arguments[0].asNumber();
    getObject()->setFillType(ft);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(setIsVolatile) {
    auto v = arguments[0].getBool();
    getObject()->setIsVolatile(v);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(reset) {
    getObject()->reset();
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(offset) {
    SkScalar dx = arguments[0].asNumber();
    SkScalar dy = arguments[1].asNumber();
    getObject()->offset(dx, dy);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(transform) {
    auto m3 = *JsiSkMatrix::fromValue(runtime, arguments[0]);
    // Create a path from current state, transform, then rebuild
    auto path = getObject()->snapshot().makeTransform(m3);
    *getObject() = SkPathBuilder(path);
    return thisValue.getObject(runtime);
  }

  // Query methods
  JSI_HOST_FUNCTION(computeBounds) {
    auto path = getObject()->snapshot();
    auto result = path.getBounds();
    return makeJsiObject(runtime,
                         std::make_shared<JsiSkRect>(getContext(), result));
  }

  JSI_HOST_FUNCTION(isEmpty) {
    return jsi::Value(getObject()->snapshot().isEmpty());
  }

  JSI_HOST_FUNCTION(getLastPt) {
    SkPoint last;
    getObject()->snapshot().getLastPt(&last);
    auto point = jsi::Object(runtime);
    point.setProperty(runtime, "x", static_cast<double>(last.fX));
    point.setProperty(runtime, "y", static_cast<double>(last.fY));
    return point;
  }

  JSI_HOST_FUNCTION(countPoints) {
    auto points = getObject()->snapshot().countPoints();
    return jsi::Value(points);
  }

  // Build methods
  JSI_HOST_FUNCTION(build) {
    // snapshot() returns a copy without resetting the builder
    auto path = getObject()->snapshot();
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), std::move(path)));
  }

  JSI_HOST_FUNCTION(detach) {
    // detach() returns the path and resets the builder
    auto path = getObject()->detach();
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), std::move(path)));
  }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    // Movement
    installHostMethod(runtime, prototype, "moveTo", &JsiSkPathBuilder::moveTo);
    installHostMethod(runtime, prototype, "rMoveTo",
                      &JsiSkPathBuilder::rMoveTo);
    installHostMethod(runtime, prototype, "lineTo", &JsiSkPathBuilder::lineTo);
    installHostMethod(runtime, prototype, "rLineTo",
                      &JsiSkPathBuilder::rLineTo);
    // Curves
    installHostMethod(runtime, prototype, "quadTo", &JsiSkPathBuilder::quadTo);
    installHostMethod(runtime, prototype, "rQuadTo",
                      &JsiSkPathBuilder::rQuadTo);
    installHostMethod(runtime, prototype, "conicTo",
                      &JsiSkPathBuilder::conicTo);
    installHostMethod(runtime, prototype, "rConicTo",
                      &JsiSkPathBuilder::rConicTo);
    installHostMethod(runtime, prototype, "cubicTo",
                      &JsiSkPathBuilder::cubicTo);
    installHostMethod(runtime, prototype, "rCubicTo",
                      &JsiSkPathBuilder::rCubicTo);
    installHostMethod(runtime, prototype, "close", &JsiSkPathBuilder::close);
    // Arcs
    installHostMethod(runtime, prototype, "arcToOval",
                      &JsiSkPathBuilder::arcToOval);
    installHostMethod(runtime, prototype, "arcToRotated",
                      &JsiSkPathBuilder::arcToRotated);
    installHostMethod(runtime, prototype, "rArcTo", &JsiSkPathBuilder::rArcTo);
    installHostMethod(runtime, prototype, "arcToTangent",
                      &JsiSkPathBuilder::arcToTangent);
    // Shapes
    installHostMethod(runtime, prototype, "addRect",
                      &JsiSkPathBuilder::addRect);
    installHostMethod(runtime, prototype, "addOval",
                      &JsiSkPathBuilder::addOval);
    installHostMethod(runtime, prototype, "addArc", &JsiSkPathBuilder::addArc);
    installHostMethod(runtime, prototype, "addRRect",
                      &JsiSkPathBuilder::addRRect);
    installHostMethod(runtime, prototype, "addCircle",
                      &JsiSkPathBuilder::addCircle);
    installHostMethod(runtime, prototype, "addPoly",
                      &JsiSkPathBuilder::addPoly);
    installHostMethod(runtime, prototype, "addPath",
                      &JsiSkPathBuilder::addPath);
    // Config
    installHostMethod(runtime, prototype, "setFillType",
                      &JsiSkPathBuilder::setFillType);
    installHostMethod(runtime, prototype, "setIsVolatile",
                      &JsiSkPathBuilder::setIsVolatile);
    installHostMethod(runtime, prototype, "reset", &JsiSkPathBuilder::reset);
    installHostMethod(runtime, prototype, "offset", &JsiSkPathBuilder::offset);
    installHostMethod(runtime, prototype, "transform",
                      &JsiSkPathBuilder::transform);
    // Query
    installHostMethod(runtime, prototype, "computeBounds",
                      &JsiSkPathBuilder::computeBounds);
    installHostMethod(runtime, prototype, "isEmpty",
                      &JsiSkPathBuilder::isEmpty);
    installHostMethod(runtime, prototype, "getLastPt",
                      &JsiSkPathBuilder::getLastPt);
    installHostMethod(runtime, prototype, "countPoints",
                      &JsiSkPathBuilder::countPoints);
    // Build
    installHostMethod(runtime, prototype, "build", &JsiSkPathBuilder::build);
    installHostMethod(runtime, prototype, "detach", &JsiSkPathBuilder::detach);
  }

  JsiSkPathBuilder(std::shared_ptr<RNSkPlatformContext> context,
                   SkPathBuilder builder)
      : JsiSkWrappingSharedPtrNativeObject<JsiSkPathBuilder, SkPathBuilder>(
            std::move(context),
            std::make_shared<SkPathBuilder>(std::move(builder))) {}

  size_t getMemoryPressure() override {
    auto builder = getObject();
    if (!builder)
      return 0;
    // Estimate memory usage based on snapshot
    return builder->snapshot().approximateBytesUsed();
  }

  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            const SkPathBuilder &builder) {
    return makeJsiObject(runtime,
                         std::make_shared<JsiSkPathBuilder>(context, builder));
  }
};

} // namespace RNSkia
