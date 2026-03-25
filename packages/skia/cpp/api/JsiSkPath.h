#pragma once

#include <algorithm>
#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkMatrix.h"
#include "JsiSkPoint.h"
#include "JsiSkRRect.h"
#include "JsiSkRect.h"

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
#include "include/utils/SkTextUtils.h"

#include "include/pathops/SkPathOps.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPath : public JsiSkWrappingSharedPtrHostObject<SkPathBuilder> {
private:
  static const int MOVE = 0;
  static const int LINE = 1;
  static const int QUAD = 2;
  static const int CONIC = 3;
  static const int CUBIC = 4;
  static const int CLOSE = 5;

  float pinT(double value) {
    // Clamp the double value between 0 and 1 and then cast it to float
    return static_cast<float>(std::clamp(value, 0.0, 1.0));
  }

  // Returns a snapshot SkPath for read-only operations.
  SkPath asPath() const { return getObject()->snapshot(); }

public:
  JSI_HOST_FUNCTION(addPath) {
    auto src = JsiSkPath::fromValue(runtime, arguments[0]);
    auto matrix =
        count > 1 && !arguments[1].isUndefined() && !arguments[1].isNull()
            ? JsiSkMatrix::fromValue(runtime, arguments[1])
            : nullptr;
    auto mode = count > 2 && arguments[2].isBool() && arguments[2].getBool()
                    ? SkPath::kExtend_AddPathMode
                    : SkPath::kAppend_AddPathMode;
    // SkPathBuilder::addPath takes const SkPath&, so snapshot the source.
    SkPath srcPath = src->snapshot();
    if (matrix == nullptr) {
      getObject()->addPath(srcPath, mode);
    } else {
      getObject()->addPath(srcPath, *matrix, mode);
    }
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addArc) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto start = arguments[1].asNumber();
    auto sweep = arguments[2].asNumber();
    getObject()->addArc(*rect, start, sweep);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addOval) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    unsigned startIndex = count < 3 ? 1 : arguments[2].asNumber();
    getObject()->addOval(*rect, direction, startIndex);
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
    auto p = SkSpan(points.data(), points.size());
    getObject()->addPolygon(p, close);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addRect) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    getObject()->addRect(*rect, direction);
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
    auto x = arguments[5].asNumber();
    auto y = arguments[6].asNumber();
    getObject()->rArcTo(SkPoint::Make(rx, ry), xAxisRotate, arcSize, sweep,
                        SkVector::Make(x, y));
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

  JSI_HOST_FUNCTION(computeTightBounds) {
    auto tightBounds = getObject()->computeTightBounds();
    SkRect result = tightBounds.has_value() ? *tightBounds : SkRect::MakeEmpty();
    auto hostObjectInstance = std::make_shared<JsiSkRect>(getContext(), result);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  // TODO-API: Should this be a property?
  JSI_HOST_FUNCTION(getBounds) {
    auto result = getObject()->computeBounds();
    auto hostObjectInstance = std::make_shared<JsiSkRect>(getContext(), result);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
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

  JSI_HOST_FUNCTION(contains) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    return jsi::Value(asPath().contains(x, y));
  }

  JSI_HOST_FUNCTION(dash) {
    SkScalar on = arguments[0].asNumber();
    SkScalar off = arguments[1].asNumber();
    auto phase = arguments[2].asNumber();
    SkScalar intervals[] = {on, off};
    auto i = SkSpan(intervals, 2);
    auto pe = SkDashPathEffect::Make(i, phase);
    if (!pe) {
      // TODO: SkDebugf("Invalid args to dash()\n");
      return jsi::Value(false);
    }
    SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
    SkPath path = asPath();
    SkPathBuilder result;
    if (pe->filterPath(&result, path, &rec, nullptr)) {
      *getObject() = std::move(result);
      return jsi::Value(true);
    }
    SkDebugf("Could not make dashed path\n");
    return jsi::Value(false);
  }

  JSI_HOST_FUNCTION(equals) {
    auto p1 = JsiSkPath::fromValue(runtime, arguments[0]);
    auto p2 = JsiSkPath::fromValue(runtime, arguments[1]);
    return jsi::Value(p1->snapshot() == p2->snapshot());
  }

  // TODO-API: Property?
  JSI_HOST_FUNCTION(getFillType) {
    auto fillType = getObject()->fillType();
    return jsi::Value(static_cast<int>(fillType));
  }

  // TODO-API: Property?
  JSI_HOST_FUNCTION(setFillType) {
    auto ft = (SkPathFillType)arguments[0].asNumber();
    getObject()->setFillType(ft);
    return thisValue.getObject(runtime);
  }

  // TODO-API: Property?
  JSI_HOST_FUNCTION(setIsVolatile) {
    auto v = arguments[0].getBool();
    getObject()->setIsVolatile(v);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(isVolatile) {
    return jsi::Value(asPath().isVolatile());
  }

  JSI_HOST_FUNCTION(transform) {
    auto m3 = *JsiSkMatrix::fromValue(runtime, arguments[0]);
    getObject()->transform(m3);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(stroke) {
    SkPath path = asPath();
    auto opts = arguments[0].asObject(runtime);
    SkPaint p;
    p.setStyle(SkPaint::kStroke_Style);

    auto jsiCap = opts.getProperty(runtime, "cap");
    if (!jsiCap.isUndefined()) {
      auto cap = (SkPaint::Cap)jsiCap.asNumber();
      p.setStrokeCap(cap);
    }

    auto jsiJoin = opts.getProperty(runtime, "join");
    if (!jsiJoin.isUndefined()) {
      auto join = (SkPaint::Join)jsiJoin.asNumber();
      p.setStrokeJoin(join);
    }

    auto jsiWidth = opts.getProperty(runtime, "width");
    if (!jsiWidth.isUndefined()) {
      auto width = jsiWidth.asNumber();
      p.setStrokeWidth(width);
    }

    auto jsiMiterLimit = opts.getProperty(runtime, "miter_limit");
    if (!jsiMiterLimit.isUndefined()) {
      auto miter_limit = opts.getProperty(runtime, "miter_limit").asNumber();
      p.setStrokeMiter(miter_limit);
    }

    auto jsiPrecision = opts.getProperty(runtime, "precision");
    auto precision = jsiPrecision.isUndefined() ? 1 : jsiPrecision.asNumber();
    SkPathBuilder resultBuilder;
    auto result =
        skpathutils::FillPathWithPaint(path, p, &resultBuilder, nullptr, precision);
    if (result) {
      *getObject() = std::move(resultBuilder);
    }
    return result ? thisValue.getObject(runtime) : jsi::Value::null();
  }

  JSI_HOST_FUNCTION(trim) {
    auto start = pinT(arguments[0].asNumber());
    auto end = pinT(arguments[1].asNumber());
    auto isComplement = arguments[2].getBool();
    SkPath path = asPath();
    auto mode = isComplement ? SkTrimPathEffect::Mode::kInverted
                             : SkTrimPathEffect::Mode::kNormal;
    auto pe = SkTrimPathEffect::Make(start, end, mode);
    SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
    if (!pe) {
      return thisValue.getObject(runtime);
    }
    SkPathBuilder result;
    if (pe->filterPath(&result, path, &rec, nullptr)) {
      *getObject() = std::move(result);
      return thisValue.getObject(runtime);
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(getPoint) {
    auto index = arguments[0].asNumber();
    auto point = asPath().getPoint(index);
    auto hostObjectInstance = std::make_shared<JsiSkPoint>(getContext(), point);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(toSVGString) {
    SkPath path = asPath();
    auto s = SkParsePath::ToSVGString(path);
    return jsi::String::createFromUtf8(runtime, s.c_str());
  }

  JSI_HOST_FUNCTION(makeAsWinding) {
    SkPath path = asPath();
    SkPath out;
    if (AsWinding(path, &out)) {
      *getObject() = SkPathBuilder(out);
      return thisValue.getObject(runtime);
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(isEmpty) { return jsi::Value(getObject()->isEmpty()); }

  JSI_HOST_FUNCTION(offset) {
    SkScalar dx = arguments[0].asNumber();
    SkScalar dy = arguments[1].asNumber();
    getObject()->offset(dx, dy);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(moveTo) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->moveTo(x, y);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rMoveTo) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->rMoveTo(x, y);
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

  JSI_HOST_FUNCTION(reset) {
    getObject()->reset();
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(rewind) {
    // SkPathBuilder has no rewind(); reset() is the equivalent.
    getObject()->reset();
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

  JSI_HOST_FUNCTION(rQuadTo) {
    auto x1 = arguments[0].asNumber();
    auto y1 = arguments[1].asNumber();
    auto x2 = arguments[2].asNumber();
    auto y2 = arguments[3].asNumber();
    getObject()->rQuadTo(x1, y1, x2, y2);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(addCircle) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    auto r = arguments[2].asNumber();
    getObject()->addCircle(x, y, r);
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(getLastPt) {
    auto last = getObject()->getLastPt();
    auto point = jsi::Object(runtime);
    if (last.has_value()) {
      point.setProperty(runtime, "x", static_cast<double>(last->fX));
      point.setProperty(runtime, "y", static_cast<double>(last->fY));
    } else {
      point.setProperty(runtime, "x", static_cast<double>(0));
      point.setProperty(runtime, "y", static_cast<double>(0));
    }
    return point;
  }

  JSI_HOST_FUNCTION(setLastPoint) {
    SkScalar x = arguments[0].asNumber();
    SkScalar y = arguments[1].asNumber();
    getObject()->setLastPoint(SkPoint::Make(x, y));
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(setPoint) {
    auto index = static_cast<int>(arguments[0].asNumber());
    SkScalar x = arguments[1].asNumber();
    SkScalar y = arguments[2].asNumber();
    getObject()->setPoint(index, SkPoint::Make(x, y));
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(close) {
    getObject()->close();
    return thisValue.getObject(runtime);
  }

  JSI_HOST_FUNCTION(simplify) {
    SkPath path = asPath();
    SkPath result;
    if (Simplify(path, &result)) {
      *getObject() = SkPathBuilder(result);
      return jsi::Value(true);
    }
    return jsi::Value(false);
  }

  JSI_HOST_FUNCTION(countPoints) {
    auto points = getObject()->countPoints();
    return jsi::Value(points);
  }

  JSI_HOST_FUNCTION(copy) {
    SkPath pathCopy = asPath();
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), SkPathBuilder(pathCopy));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(op) {
    auto path2 = JsiSkPath::fromValue(runtime, arguments[0]);
    int pathOp = arguments[1].asNumber();
    SkPath self = asPath();
    SkPath other = path2->snapshot();
    SkPath result;
    if (Op(self, other, SkPathOp(pathOp), &result)) {
      *getObject() = SkPathBuilder(result);
      return jsi::Value(true);
    }
    return jsi::Value(false);
  }

  JSI_HOST_FUNCTION(isInterpolatable) {
    auto path2 = JsiSkPath::fromValue(runtime, arguments[0]);
    SkPath self = asPath();
    SkPath other = path2->snapshot();
    return jsi::Value(self.isInterpolatable(other));
  }

  JSI_HOST_FUNCTION(interpolate) {
    auto path2 = JsiSkPath::fromValue(runtime, arguments[0]);
    auto weight = arguments[1].asNumber();
    SkPath self = asPath();
    SkPath other = path2->snapshot();
    if (count > 2 && !arguments[2].isUndefined()) {
      auto path3 = JsiSkPath::fromValue(runtime, arguments[2]);
      SkPath out = path3->snapshot();
      auto succeed = self.interpolate(other, weight, &out);
      if (!succeed) {
        return nullptr;
      }
      *path3 = SkPathBuilder(out);
      return arguments[2].asObject(runtime);
    }
    SkPath result;
    auto succeed = self.interpolate(other, weight, &result);
    if (!succeed) {
      return nullptr;
    }
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), SkPathBuilder(std::move(result)));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(toCmds) {
    SkPath path = asPath();
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
      JSI_EXPORT_FUNC(JsiSkPath, addPath), JSI_EXPORT_FUNC(JsiSkPath, addArc),
      JSI_EXPORT_FUNC(JsiSkPath, addOval), JSI_EXPORT_FUNC(JsiSkPath, addPoly),
      JSI_EXPORT_FUNC(JsiSkPath, addRect), JSI_EXPORT_FUNC(JsiSkPath, addRRect),
      JSI_EXPORT_FUNC(JsiSkPath, arcToOval),
      JSI_EXPORT_FUNC(JsiSkPath, arcToRotated),
      JSI_EXPORT_FUNC(JsiSkPath, rArcTo),
      JSI_EXPORT_FUNC(JsiSkPath, arcToTangent),
      JSI_EXPORT_FUNC(JsiSkPath, computeTightBounds),
      JSI_EXPORT_FUNC(JsiSkPath, getBounds),
      JSI_EXPORT_FUNC(JsiSkPath, conicTo), JSI_EXPORT_FUNC(JsiSkPath, rConicTo),
      JSI_EXPORT_FUNC(JsiSkPath, contains), JSI_EXPORT_FUNC(JsiSkPath, dash),
      JSI_EXPORT_FUNC(JsiSkPath, equals),
      JSI_EXPORT_FUNC(JsiSkPath, getFillType),
      JSI_EXPORT_FUNC(JsiSkPath, setFillType),
      JSI_EXPORT_FUNC(JsiSkPath, setIsVolatile),
      JSI_EXPORT_FUNC(JsiSkPath, isVolatile),
      JSI_EXPORT_FUNC(JsiSkPath, transform), JSI_EXPORT_FUNC(JsiSkPath, stroke),
      JSI_EXPORT_FUNC(JsiSkPath, trim), JSI_EXPORT_FUNC(JsiSkPath, getPoint),
      JSI_EXPORT_FUNC(JsiSkPath, toSVGString),
      JSI_EXPORT_FUNC(JsiSkPath, makeAsWinding),
      JSI_EXPORT_FUNC(JsiSkPath, isEmpty), JSI_EXPORT_FUNC(JsiSkPath, offset),
      JSI_EXPORT_FUNC(JsiSkPath, moveTo), JSI_EXPORT_FUNC(JsiSkPath, rMoveTo),
      JSI_EXPORT_FUNC(JsiSkPath, lineTo), JSI_EXPORT_FUNC(JsiSkPath, rLineTo),
      JSI_EXPORT_FUNC(JsiSkPath, cubicTo), JSI_EXPORT_FUNC(JsiSkPath, rCubicTo),
      JSI_EXPORT_FUNC(JsiSkPath, reset), JSI_EXPORT_FUNC(JsiSkPath, rewind),
      JSI_EXPORT_FUNC(JsiSkPath, quadTo), JSI_EXPORT_FUNC(JsiSkPath, rQuadTo),
      JSI_EXPORT_FUNC(JsiSkPath, addCircle),
      JSI_EXPORT_FUNC(JsiSkPath, getLastPt),
      JSI_EXPORT_FUNC(JsiSkPath, setLastPoint),
      JSI_EXPORT_FUNC(JsiSkPath, setPoint),
      JSI_EXPORT_FUNC(JsiSkPath, close),
      JSI_EXPORT_FUNC(JsiSkPath, simplify),
      JSI_EXPORT_FUNC(JsiSkPath, countPoints), JSI_EXPORT_FUNC(JsiSkPath, copy),
      JSI_EXPORT_FUNC(JsiSkPath, op),
      JSI_EXPORT_FUNC(JsiSkPath, isInterpolatable),
      JSI_EXPORT_FUNC(JsiSkPath, interpolate),
      JSI_EXPORT_FUNC(JsiSkPath, toCmds), JSI_EXPORT_FUNC(JsiSkPath, dispose))

  // Primary constructor: takes a SkPathBuilder directly.
  JsiSkPath(std::shared_ptr<RNSkPlatformContext> context, SkPathBuilder builder)
      : JsiSkWrappingSharedPtrHostObject<SkPathBuilder>(
            std::move(context),
            std::make_shared<SkPathBuilder>(std::move(builder))) {}

  // Convenience constructor: construct from an existing SkPath.
  JsiSkPath(std::shared_ptr<RNSkPlatformContext> context, const SkPath &path)
      : JsiSkPath(std::move(context), SkPathBuilder(path)) {}

  size_t getMemoryPressure() const override {
    auto builder = getObject();
    if (!builder)
      return 0;

    // Snapshot to get an SkPath for approximateBytesUsed().
    return builder->snapshot().approximateBytesUsed();
  }

  std::string getObjectType() const override { return "JsiSkPath"; }

  // Helper: extract an SkPath snapshot from a JSI value holding a JsiSkPath.
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
