#pragma once

#include <algorithm>
#include <memory>
#include <set>
#include <string>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkMatrix.h"
#include "JsiSkPoint.h"
#include "JsiSkRRect.h"
#include "JsiSkRect.h"
#include "RNSkLog.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPath.h"
#include "include/core/SkPathBuilder.h"
#include "include/core/SkPathEffect.h"
#include "include/core/SkPathTypes.h"
#include "include/core/SkPathUtils.h"
#include "include/core/SkString.h"
#include "include/core/SkStrokeRec.h"
#include "include/effects/SkDashPathEffect.h"
#include "include/effects/SkTrimPathEffect.h"
#include "include/utils/SkParsePath.h"

#include "include/pathops/SkPathOps.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

// Track which deprecation warnings have been shown to avoid spam
inline std::set<std::string> &getShownPathDeprecationWarnings() {
  static std::set<std::string> warnings;
  return warnings;
}

inline void warnDeprecatedPathMethod(jsi::Runtime &runtime,
                                     const char *methodName,
                                     const char *suggestion) {
  auto &warnings = getShownPathDeprecationWarnings();
  if (warnings.find(methodName) != warnings.end()) {
    return;
  }
  warnings.insert(methodName);
  std::string message =
      std::string("[react-native-skia] SkPath.") + methodName +
      "() is deprecated and will be removed in a future release. " +
      suggestion +
      " See migration guide: "
      "https://shopify.github.io/react-native-skia/docs/shapes/path-migration";
  RNSkLogger::warnToJavascriptConsole(runtime, message);
}

class JsiSkPath : public JsiSkWrappingSharedPtrHostObject<SkPathBuilder> {
private:
  static const int MOVE = 0;
  static const int LINE = 1;
  static const int QUAD = 2;
  static const int CONIC = 3;
  static const int CUBIC = 4;
  static const int CLOSE = 5;

  SkPath asPath() const { return getObject()->snapshot(); }

public:
  // Mutable building methods (deprecated)

  JSI_HOST_FUNCTION(moveTo) {
    warnDeprecatedPathMethod(runtime, "moveTo",
                             "Use Skia.PathBuilder.Make().moveTo() instead.");
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->moveTo(x, y);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rMoveTo) {
    warnDeprecatedPathMethod(runtime, "rMoveTo",
                             "Use Skia.PathBuilder.Make().rMoveTo() instead.");
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->rMoveTo({x, y});
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(lineTo) {
    warnDeprecatedPathMethod(runtime, "lineTo",
                             "Use Skia.PathBuilder.Make().lineTo() instead.");
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->lineTo(x, y);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rLineTo) {
    warnDeprecatedPathMethod(runtime, "rLineTo",
                             "Use Skia.PathBuilder.Make().rLineTo() instead.");
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->rLineTo(x, y);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(quadTo) {
    warnDeprecatedPathMethod(runtime, "quadTo",
                             "Use Skia.PathBuilder.Make().quadTo() instead.");
    SkScalar x1 = arguments[0].asNumber();
    SkScalar y1 = arguments[1].asNumber();
    SkScalar x2 = arguments[2].asNumber();
    SkScalar y2 = arguments[3].asNumber();
    getObject()->quadTo(x1, y1, x2, y2);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rQuadTo) {
    warnDeprecatedPathMethod(runtime, "rQuadTo",
                             "Use Skia.PathBuilder.Make().rQuadTo() instead.");
    SkScalar x1 = arguments[0].asNumber();
    SkScalar y1 = arguments[1].asNumber();
    SkScalar x2 = arguments[2].asNumber();
    SkScalar y2 = arguments[3].asNumber();
    getObject()->rQuadTo(x1, y1, x2, y2);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(conicTo) {
    warnDeprecatedPathMethod(runtime, "conicTo",
                             "Use Skia.PathBuilder.Make().conicTo() instead.");
    SkScalar x1 = arguments[0].asNumber();
    SkScalar y1 = arguments[1].asNumber();
    SkScalar x2 = arguments[2].asNumber();
    SkScalar y2 = arguments[3].asNumber();
    SkScalar w = arguments[4].asNumber();
    getObject()->conicTo(x1, y1, x2, y2, w);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rConicTo) {
    warnDeprecatedPathMethod(runtime, "rConicTo",
                             "Use Skia.PathBuilder.Make().rConicTo() instead.");
    SkScalar x1 = arguments[0].asNumber();
    SkScalar y1 = arguments[1].asNumber();
    SkScalar x2 = arguments[2].asNumber();
    SkScalar y2 = arguments[3].asNumber();
    SkScalar w = arguments[4].asNumber();
    getObject()->rConicTo(x1, y1, x2, y2, w);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(cubicTo) {
    warnDeprecatedPathMethod(runtime, "cubicTo",
                             "Use Skia.PathBuilder.Make().cubicTo() instead.");
    SkScalar x1 = arguments[0].asNumber();
    SkScalar y1 = arguments[1].asNumber();
    SkScalar x2 = arguments[2].asNumber();
    SkScalar y2 = arguments[3].asNumber();
    SkScalar x3 = arguments[4].asNumber();
    SkScalar y3 = arguments[5].asNumber();
    getObject()->cubicTo(x1, y1, x2, y2, x3, y3);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rCubicTo) {
    warnDeprecatedPathMethod(runtime, "rCubicTo",
                             "Use Skia.PathBuilder.Make().rCubicTo() instead.");
    SkScalar x1 = arguments[0].asNumber();
    SkScalar y1 = arguments[1].asNumber();
    SkScalar x2 = arguments[2].asNumber();
    SkScalar y2 = arguments[3].asNumber();
    SkScalar x3 = arguments[4].asNumber();
    SkScalar y3 = arguments[5].asNumber();
    getObject()->rCubicTo(x1, y1, x2, y2, x3, y3);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(close) {
    warnDeprecatedPathMethod(runtime, "close",
                             "Use Skia.PathBuilder.Make().close() instead.");
    getObject()->close();
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(reset) {
    warnDeprecatedPathMethod(runtime, "reset",
                             "Use Skia.PathBuilder.Make().reset() instead.");
    getObject()->reset();
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rewind) {
    warnDeprecatedPathMethod(runtime, "rewind",
                             "Use Skia.PathBuilder.Make().reset() instead.");
    getObject()->reset();
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addPath) {
    warnDeprecatedPathMethod(runtime, "addPath",
                             "Use Skia.PathBuilder.Make().addPath() instead.");
    auto src = JsiSkPath::fromValue(runtime, arguments[0]);
    auto srcPath = src->snapshot();
    auto matrix =
        count > 1 && !arguments[1].isUndefined() && !arguments[1].isNull()
            ? JsiSkMatrix::fromValue(runtime, arguments[1])
            : nullptr;
    auto extend = count > 2 && arguments[2].getBool();
    auto mode =
        extend ? SkPath::kExtend_AddPathMode : SkPath::kAppend_AddPathMode;
    if (matrix) {
      getObject()->addPath(srcPath, *matrix, mode);
    } else {
      getObject()->addPath(srcPath, mode);
    }
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addArc) {
    warnDeprecatedPathMethod(runtime, "addArc",
                             "Use Skia.PathBuilder.Make().addArc() instead.");
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto start = arguments[1].asNumber();
    auto sweep = arguments[2].asNumber();
    getObject()->addArc(*rect, start, sweep);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addOval) {
    warnDeprecatedPathMethod(
        runtime, "addOval",
        "Use Skia.Path.Oval() or Skia.PathBuilder.Make().addOval() instead.");
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto isCCW = count > 1 && arguments[1].getBool();
    auto startIndex =
        count > 2 ? static_cast<unsigned>(arguments[2].asNumber()) : 1;
    auto direction = isCCW ? SkPathDirection::kCCW : SkPathDirection::kCW;
    getObject()->addOval(*rect, direction, startIndex);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addRect) {
    warnDeprecatedPathMethod(
        runtime, "addRect",
        "Use Skia.Path.Rect() or Skia.PathBuilder.Make().addRect() instead.");
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto isCCW = count > 1 && arguments[1].getBool();
    auto direction = isCCW ? SkPathDirection::kCCW : SkPathDirection::kCW;
    getObject()->addRect(*rect, direction);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addRRect) {
    warnDeprecatedPathMethod(
        runtime, "addRRect",
        "Use Skia.Path.RRect() or Skia.PathBuilder.Make().addRRect() instead.");
    auto rrect = JsiSkRRect::fromValue(runtime, arguments[0]);
    auto isCCW = count > 1 && arguments[1].getBool();
    auto direction = isCCW ? SkPathDirection::kCCW : SkPathDirection::kCW;
    getObject()->addRRect(*rrect, direction);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addCircle) {
    warnDeprecatedPathMethod(
        runtime, "addCircle",
        "Use Skia.Path.Circle() or Skia.PathBuilder.Make().addCircle() "
        "instead.");
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    SkScalar r = arguments[2].asNumber();
    getObject()->addCircle(x, y, r);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addPoly) {
    warnDeprecatedPathMethod(
        runtime, "addPoly",
        "Use Skia.Path.Polygon() or Skia.PathBuilder.Make().addPoly() "
        "instead.");
    auto jsiPoints = arguments[0].asObject(runtime).asArray(runtime);
    auto close = arguments[1].getBool();
    auto pointsSize = static_cast<int>(jsiPoints.size(runtime));
    std::vector<SkPoint> points;
    points.reserve(pointsSize);
    for (int i = 0; i < pointsSize; i++) {
      auto pt =
          JsiSkPoint::fromValue(runtime, jsiPoints.getValueAtIndex(runtime, i));
      points.push_back(*pt);
    }
    getObject()->addPolygon(SkSpan<const SkPoint>(points.data(), points.size()),
                            close);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(arcToOval) {
    warnDeprecatedPathMethod(
        runtime, "arcToOval",
        "Use Skia.PathBuilder.Make().arcToOval() instead.");
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto start = arguments[1].asNumber();
    auto sweep = arguments[2].asNumber();
    auto forceMoveTo = arguments[3].getBool();
    getObject()->arcTo(*rect, start, sweep, forceMoveTo);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(arcToRotated) {
    warnDeprecatedPathMethod(
        runtime, "arcToRotated",
        "Use Skia.PathBuilder.Make().arcToRotated() instead.");
    SkScalar rx = arguments[0].asNumber();
    SkScalar ry = arguments[1].asNumber();
    SkScalar xAxisRotate = arguments[2].asNumber();
    auto useSmallArc = arguments[3].getBool();
    auto isCCW = arguments[4].getBool();
    SkScalar x = arguments[5].asNumber();
    SkScalar y = arguments[6].asNumber();
    auto arcSize = useSmallArc ? SkPathBuilder::kSmall_ArcSize
                               : SkPathBuilder::kLarge_ArcSize;
    auto sweep = isCCW ? SkPathDirection::kCCW : SkPathDirection::kCW;
    getObject()->arcTo(SkPoint::Make(rx, ry), xAxisRotate, arcSize, sweep,
                       SkPoint::Make(x, y));
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rArcTo) {
    warnDeprecatedPathMethod(runtime, "rArcTo",
                             "Use Skia.PathBuilder.Make().rArcTo() instead.");
    SkScalar rx = arguments[0].asNumber();
    SkScalar ry = arguments[1].asNumber();
    SkScalar xAxisRotate = arguments[2].asNumber();
    auto useSmallArc = arguments[3].getBool();
    auto isCCW = arguments[4].getBool();
    SkScalar dx = arguments[5].asNumber();
    SkScalar dy = arguments[6].asNumber();
    auto arcSize = useSmallArc ? SkPathBuilder::kSmall_ArcSize
                               : SkPathBuilder::kLarge_ArcSize;
    auto sweep = isCCW ? SkPathDirection::kCCW : SkPathDirection::kCW;
    SkVector dxdy(dx, dy);
    SkPoint r(rx, ry);
    getObject()->rArcTo(r, xAxisRotate, arcSize, sweep, dxdy);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(arcToTangent) {
    warnDeprecatedPathMethod(
        runtime, "arcToTangent",
        "Use Skia.PathBuilder.Make().arcToTangent() instead.");
    SkScalar x1 = arguments[0].asNumber();
    SkScalar y1 = arguments[1].asNumber();
    SkScalar x2 = arguments[2].asNumber();
    SkScalar y2 = arguments[3].asNumber();
    SkScalar r = arguments[4].asNumber();
    getObject()->arcTo(SkPoint::Make(x1, y1), SkPoint::Make(x2, y2), r);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(setFillType) {
    warnDeprecatedPathMethod(
        runtime, "setFillType",
        "Use Skia.PathBuilder.Make().setFillType() instead.");
    auto ft = arguments[0].asNumber();
    getObject()->setFillType(static_cast<SkPathFillType>(static_cast<int>(ft)));
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(setIsVolatile) {
    warnDeprecatedPathMethod(
        runtime, "setIsVolatile",
        "Use Skia.PathBuilder.Make().setIsVolatile() instead.");
    auto v = arguments[0].getBool();
    getObject()->setIsVolatile(v);
    return thisValue.getObject(runtime);
  }

  // Mutable transform methods (deprecated)

  JSI_HOST_FUNCTION(transform) {
    warnDeprecatedPathMethod(
        runtime, "transform",
        "Use Skia.PathBuilder.Make().transform() instead.");
    auto m3 = *JsiSkMatrix::fromValue(runtime, arguments[0]);
    getObject()->transform(m3);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(offset) {
    warnDeprecatedPathMethod(runtime, "offset",
                             "Use Skia.PathBuilder.Make().offset() instead.");
    SkScalar dx = arguments[0].asNumber();
    SkScalar dy = arguments[1].asNumber();
    getObject()->offset(dx, dy);
    return thisValue.getObject(runtime);
  }

  // Mutable path operations (deprecated)

  JSI_HOST_FUNCTION(simplify) {
    warnDeprecatedPathMethod(runtime, "simplify",
                             "Use Skia.Path.Simplify(path) instead.");
    auto path = asPath();
    auto result = ::Simplify(path);
    if (result.has_value()) {
      *getObject() = SkPathBuilder(result.value());
    }
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(op) {
    warnDeprecatedPathMethod(runtime, "op",
                             "Use Skia.Path.MakeFromOp() instead.");
    auto path2 = JsiSkPath::fromValue(runtime, arguments[0]);
    auto pathOp =
        static_cast<SkPathOp>(static_cast<int>(arguments[1].asNumber()));
    auto p1 = asPath();
    auto p2 = path2->snapshot();
    auto result = ::Op(p1, p2, pathOp);
    if (result.has_value()) {
      *getObject() = SkPathBuilder(result.value());
    }
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(makeAsWinding) {
    warnDeprecatedPathMethod(runtime, "makeAsWinding",
                             "Use Skia.Path.AsWinding(path) instead.");
    auto path = asPath();
    auto result = ::AsWinding(path);
    if (result.has_value()) {
      *getObject() = SkPathBuilder(result.value());
    }
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(dash) {
    warnDeprecatedPathMethod(
        runtime, "dash", "Use Skia.Path.Dash(path, on, off, phase) instead.");
    auto path = asPath();
    SkScalar on = arguments[0].asNumber();
    SkScalar off = arguments[1].asNumber();
    auto phase = arguments[2].asNumber();
    SkScalar intervals[] = {on, off};
    auto pe = SkDashPathEffect::Make(SkSpan(intervals, 2), phase);
    if (pe) {
      SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
      SkPathBuilder resultBuilder;
      if (pe->filterPath(&resultBuilder, path, &rec)) {
        *getObject() = std::move(resultBuilder);
      }
    }
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(stroke) {
    warnDeprecatedPathMethod(runtime, "stroke",
                             "Use Skia.Path.Stroke(path, opts) instead.");
    auto path = asPath();
    SkPaint p;
    p.setStyle(SkPaint::kStroke_Style);

    if (count > 0 && !arguments[0].isUndefined()) {
      auto opts = arguments[0].asObject(runtime);

      auto jsiCap = opts.getProperty(runtime, "cap");
      if (!jsiCap.isUndefined()) {
        p.setStrokeCap(
            static_cast<SkPaint::Cap>(static_cast<int>(jsiCap.asNumber())));
      }

      auto jsiJoin = opts.getProperty(runtime, "join");
      if (!jsiJoin.isUndefined()) {
        p.setStrokeJoin(
            static_cast<SkPaint::Join>(static_cast<int>(jsiJoin.asNumber())));
      }

      auto jsiWidth = opts.getProperty(runtime, "width");
      if (!jsiWidth.isUndefined()) {
        p.setStrokeWidth(jsiWidth.asNumber());
      }

      auto jsiMiterLimit = opts.getProperty(runtime, "miter_limit");
      if (!jsiMiterLimit.isUndefined()) {
        p.setStrokeMiter(jsiMiterLimit.asNumber());
      }
    }

    SkPathBuilder resultBuilder;
    auto success = skpathutils::FillPathWithPaint(path, p, &resultBuilder);
    if (success) {
      *getObject() = std::move(resultBuilder);
    }
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(trim) {
    warnDeprecatedPathMethod(
        runtime, "trim",
        "Use Skia.Path.Trim(path, start, end, isComplement) instead.");
    auto path = asPath();
    float start =
        std::clamp(static_cast<float>(arguments[0].asNumber()), 0.0f, 1.0f);
    float end =
        std::clamp(static_cast<float>(arguments[1].asNumber()), 0.0f, 1.0f);
    auto isComplement = arguments[2].getBool();
    auto mode = isComplement ? SkTrimPathEffect::Mode::kInverted
                             : SkTrimPathEffect::Mode::kNormal;
    auto pe = SkTrimPathEffect::Make(start, end, mode);
    if (pe) {
      SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
      SkPathBuilder resultBuilder;
      if (pe->filterPath(&resultBuilder, path, &rec)) {
        *getObject() = std::move(resultBuilder);
      }
    }
    return thisValue.getObject(runtime);
  }

  // Query methods

  JSI_HOST_FUNCTION(computeTightBounds) {
    auto path = asPath();
    auto result = path.computeTightBounds();
    auto hostObjectInstance = std::make_shared<JsiSkRect>(getContext(), result);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(getBounds) {
    auto result = getObject()->computeBounds();
    auto hostObjectInstance = std::make_shared<JsiSkRect>(getContext(), result);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(contains) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    return jsi::Value(asPath().contains(x, y));
  }

  JSI_HOST_FUNCTION(getFillType) {
    auto fillType = getObject()->fillType();
    return jsi::Value(static_cast<int>(fillType));
  }

  JSI_HOST_FUNCTION(isVolatile) { return jsi::Value(asPath().isVolatile()); }

  JSI_HOST_FUNCTION(getPoint) {
    auto index = arguments[0].asNumber();
    auto point = asPath().getPoint(index);
    auto hostObjectInstance = std::make_shared<JsiSkPoint>(getContext(), point);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(isEmpty) { return jsi::Value(getObject()->isEmpty()); }

  JSI_HOST_FUNCTION(countPoints) {
    auto points = asPath().countPoints();
    return jsi::Value(points);
  }

  JSI_HOST_FUNCTION(getLastPt) {
    auto last = getObject()->getLastPt();
    auto point = jsi::Object(runtime);
    if (last.has_value()) {
      point.setProperty(runtime, "x", static_cast<double>(last->fX));
      point.setProperty(runtime, "y", static_cast<double>(last->fY));
    } else {
      point.setProperty(runtime, "x", 0.0);
      point.setProperty(runtime, "y", 0.0);
    }
    return point;
  }

  JSI_HOST_FUNCTION(toSVGString) {
    auto path = asPath();
    auto s = SkParsePath::ToSVGString(path);
    return jsi::String::createFromUtf8(runtime, s.c_str());
  }

  JSI_HOST_FUNCTION(equals) {
    auto p1 = JsiSkPath::fromValue(runtime, arguments[0]);
    auto p2 = JsiSkPath::fromValue(runtime, arguments[1]);
    return jsi::Value(p1->snapshot() == p2->snapshot());
  }

  JSI_HOST_FUNCTION(copy) {
    auto path = asPath();
    auto hostObjectInstance = std::make_shared<JsiSkPath>(getContext(), path);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(isInterpolatable) {
    auto path2 = JsiSkPath::fromValue(runtime, arguments[0]);
    auto p1 = asPath();
    auto p2 = path2->snapshot();
    return p1.isInterpolatable(p2);
  }

  JSI_HOST_FUNCTION(interpolate) {
    auto path2 = JsiSkPath::fromValue(runtime, arguments[0]);
    auto weight = arguments[1].asNumber();
    auto p1 = asPath();
    auto p2 = path2->snapshot();
    SkPath result;
    auto succeed = p1.interpolate(p2, weight, &result);
    if (!succeed) {
      return jsi::Value::null();
    }
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(result));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(toCmds) {
    auto path = asPath();
    std::vector<jsi::Array> cmdList;
    SkPoint pts[4];
    SkPath::Iter iter(path, false);
    SkPath::Verb verb;

    while ((verb = iter.next(pts)) != SkPath::kDone_Verb) {
      switch (verb) {
      case SkPath::kMove_Verb: {
        auto cmd = jsi::Array(runtime, 3);
        cmd.setValueAtIndex(runtime, 0, static_cast<double>(MOVE));
        cmd.setValueAtIndex(runtime, 1, static_cast<double>(pts[0].x()));
        cmd.setValueAtIndex(runtime, 2, static_cast<double>(pts[0].y()));
        cmdList.push_back(std::move(cmd));
        break;
      }
      case SkPath::kLine_Verb: {
        auto cmd = jsi::Array(runtime, 3);
        cmd.setValueAtIndex(runtime, 0, static_cast<double>(LINE));
        cmd.setValueAtIndex(runtime, 1, static_cast<double>(pts[1].x()));
        cmd.setValueAtIndex(runtime, 2, static_cast<double>(pts[1].y()));
        cmdList.push_back(std::move(cmd));
        break;
      }
      case SkPath::kQuad_Verb: {
        auto cmd = jsi::Array(runtime, 5);
        cmd.setValueAtIndex(runtime, 0, static_cast<double>(QUAD));
        cmd.setValueAtIndex(runtime, 1, static_cast<double>(pts[1].x()));
        cmd.setValueAtIndex(runtime, 2, static_cast<double>(pts[1].y()));
        cmd.setValueAtIndex(runtime, 3, static_cast<double>(pts[2].x()));
        cmd.setValueAtIndex(runtime, 4, static_cast<double>(pts[2].y()));
        cmdList.push_back(std::move(cmd));
        break;
      }
      case SkPath::kConic_Verb: {
        auto cmd = jsi::Array(runtime, 6);
        cmd.setValueAtIndex(runtime, 0, static_cast<double>(CONIC));
        cmd.setValueAtIndex(runtime, 1, static_cast<double>(pts[1].x()));
        cmd.setValueAtIndex(runtime, 2, static_cast<double>(pts[1].y()));
        cmd.setValueAtIndex(runtime, 3, static_cast<double>(pts[2].x()));
        cmd.setValueAtIndex(runtime, 4, static_cast<double>(pts[2].y()));
        cmd.setValueAtIndex(runtime, 5,
                            static_cast<double>(iter.conicWeight()));
        cmdList.push_back(std::move(cmd));
        break;
      }
      case SkPath::kCubic_Verb: {
        auto cmd = jsi::Array(runtime, 7);
        cmd.setValueAtIndex(runtime, 0, static_cast<double>(CUBIC));
        cmd.setValueAtIndex(runtime, 1, static_cast<double>(pts[1].x()));
        cmd.setValueAtIndex(runtime, 2, static_cast<double>(pts[1].y()));
        cmd.setValueAtIndex(runtime, 3, static_cast<double>(pts[2].x()));
        cmd.setValueAtIndex(runtime, 4, static_cast<double>(pts[2].y()));
        cmd.setValueAtIndex(runtime, 5, static_cast<double>(pts[3].x()));
        cmd.setValueAtIndex(runtime, 6, static_cast<double>(pts[3].y()));
        cmdList.push_back(std::move(cmd));
        break;
      }
      case SkPath::kClose_Verb: {
        auto cmd = jsi::Array(runtime, 1);
        cmd.setValueAtIndex(runtime, 0, static_cast<double>(CLOSE));
        cmdList.push_back(std::move(cmd));
        break;
      }
      default:
        break;
      }
    }

    // Create the jsi::Array with the exact size
    auto cmds = jsi::Array(runtime, cmdList.size());
    for (size_t i = 0; i < cmdList.size(); ++i) {
      cmds.setValueAtIndex(runtime, i, cmdList[i]);
    }

    return cmds;
  }

  EXPORT_JSI_API_TYPENAME(JsiSkPath, Path)

  JSI_EXPORT_FUNCTIONS(
      // Mutable building methods
      JSI_EXPORT_FUNC(JsiSkPath, moveTo), JSI_EXPORT_FUNC(JsiSkPath, rMoveTo),
      JSI_EXPORT_FUNC(JsiSkPath, lineTo), JSI_EXPORT_FUNC(JsiSkPath, rLineTo),
      JSI_EXPORT_FUNC(JsiSkPath, quadTo), JSI_EXPORT_FUNC(JsiSkPath, rQuadTo),
      JSI_EXPORT_FUNC(JsiSkPath, conicTo), JSI_EXPORT_FUNC(JsiSkPath, rConicTo),
      JSI_EXPORT_FUNC(JsiSkPath, cubicTo), JSI_EXPORT_FUNC(JsiSkPath, rCubicTo),
      JSI_EXPORT_FUNC(JsiSkPath, close), JSI_EXPORT_FUNC(JsiSkPath, reset),
      JSI_EXPORT_FUNC(JsiSkPath, rewind), JSI_EXPORT_FUNC(JsiSkPath, addPath),
      JSI_EXPORT_FUNC(JsiSkPath, addArc), JSI_EXPORT_FUNC(JsiSkPath, addOval),
      JSI_EXPORT_FUNC(JsiSkPath, addRect), JSI_EXPORT_FUNC(JsiSkPath, addRRect),
      JSI_EXPORT_FUNC(JsiSkPath, addCircle),
      JSI_EXPORT_FUNC(JsiSkPath, addPoly),
      JSI_EXPORT_FUNC(JsiSkPath, arcToOval),
      JSI_EXPORT_FUNC(JsiSkPath, arcToRotated),
      JSI_EXPORT_FUNC(JsiSkPath, rArcTo),
      JSI_EXPORT_FUNC(JsiSkPath, arcToTangent),
      JSI_EXPORT_FUNC(JsiSkPath, setFillType),
      JSI_EXPORT_FUNC(JsiSkPath, setIsVolatile),
      // Mutable transform methods
      JSI_EXPORT_FUNC(JsiSkPath, transform), JSI_EXPORT_FUNC(JsiSkPath, offset),
      // Mutable path operations
      JSI_EXPORT_FUNC(JsiSkPath, simplify), JSI_EXPORT_FUNC(JsiSkPath, op),
      JSI_EXPORT_FUNC(JsiSkPath, makeAsWinding),
      JSI_EXPORT_FUNC(JsiSkPath, dash), JSI_EXPORT_FUNC(JsiSkPath, stroke),
      JSI_EXPORT_FUNC(JsiSkPath, trim),
      // Query methods
      JSI_EXPORT_FUNC(JsiSkPath, computeTightBounds),
      JSI_EXPORT_FUNC(JsiSkPath, getBounds),
      JSI_EXPORT_FUNC(JsiSkPath, contains),
      JSI_EXPORT_FUNC(JsiSkPath, getFillType),
      JSI_EXPORT_FUNC(JsiSkPath, isVolatile),
      JSI_EXPORT_FUNC(JsiSkPath, getPoint), JSI_EXPORT_FUNC(JsiSkPath, isEmpty),
      JSI_EXPORT_FUNC(JsiSkPath, countPoints),
      JSI_EXPORT_FUNC(JsiSkPath, getLastPt),
      JSI_EXPORT_FUNC(JsiSkPath, toSVGString),
      JSI_EXPORT_FUNC(JsiSkPath, equals), JSI_EXPORT_FUNC(JsiSkPath, copy),
      JSI_EXPORT_FUNC(JsiSkPath, isInterpolatable),
      JSI_EXPORT_FUNC(JsiSkPath, interpolate),
      JSI_EXPORT_FUNC(JsiSkPath, toCmds), JSI_EXPORT_FUNC(JsiSkPath, dispose))

  JsiSkPath(std::shared_ptr<RNSkPlatformContext> context, SkPathBuilder builder)
      : JsiSkWrappingSharedPtrHostObject<SkPathBuilder>(
            std::move(context),
            std::make_shared<SkPathBuilder>(std::move(builder))) {}

  // Convenience: construct from SkPath
  JsiSkPath(std::shared_ptr<RNSkPlatformContext> context, const SkPath &path)
      : JsiSkPath(std::move(context), SkPathBuilder(path)) {}

  size_t getMemoryPressure() const override {
    auto builder = getObject();
    if (!builder)
      return 0;

    return builder->snapshot().approximateBytesUsed();
  }

  std::string getObjectType() const override { return "JsiSkPath"; }

  static SkPath pathFromValue(jsi::Runtime &runtime, const jsi::Value &obj) {
    return fromValue(runtime, obj)->snapshot();
  }

  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            const SkPath &path) {
    auto hostObjectInstance = std::make_shared<JsiSkPath>(context, path);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, context);
  }

  static jsi::Value toValue(jsi::Runtime &runtime,
                            std::shared_ptr<RNSkPlatformContext> context,
                            SkPath &&path) {
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(context, std::move(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, context);
  }
};

} // namespace RNSkia
