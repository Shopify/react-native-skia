#pragma once

#include <algorithm>
#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkMatrix.h"
#include "JsiSkPathEffect.h"
#include "JsiSkPoint.h"
#include "JsiSkRRect.h"
#include "JsiSkRect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "RNSkLog.h"
#include "include/core/SkPath.h"
#include "include/core/SkPathUtils.h"
#include "include/effects/SkDashPathEffect.h"
#include "include/effects/SkTrimPathEffect.h"
#include "include/pathops/SkPathOps.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPathFactory : public JsiSkHostObject {

  static const int MOVE = 0;
  static const int LINE = 1;
  static const int QUAD = 2;
  static const int CONIC = 3;
  static const int CUBIC = 4;
  static const int CLOSE = 5;

public:
  JSI_HOST_FUNCTION(Make) {
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), SkPath());
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(MakeFromSVGString) {
    auto svgString = arguments[0].asString(runtime).utf8(runtime);
    SkPath result;

    if (!SkParsePath::FromSVGString(svgString.c_str(), &result)) {
      throw jsi::JSError(runtime, "Could not parse Svg path");
      return jsi::Value(nullptr);
    }

    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(result));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
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
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(result));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(MakeFromCmds) {
    SkPath path;
    auto cmds = arguments[0].asObject(runtime).asArray(runtime);
    auto cmdCount = cmds.size(runtime);
    for (int i = 0; i < cmdCount; i++) {
      auto cmd =
          cmds.getValueAtIndex(runtime, i).asObject(runtime).asArray(runtime);
      if (cmd.size(runtime) < 1) {
        RNSkLogger::logToConsole("Invalid command found (got an empty array)");
        return jsi::Value::null();
      }
      auto verb = static_cast<int>(cmd.getValueAtIndex(runtime, 0).asNumber());
      switch (verb) {
      case MOVE: {
        if (cmd.size(runtime) < 3) {
          RNSkLogger::logToConsole("Invalid move command found");
          return jsi::Value::null();
        }
        auto x = cmd.getValueAtIndex(runtime, 1).asNumber();
        auto y = cmd.getValueAtIndex(runtime, 2).asNumber();
        path.moveTo(x, y);
        break;
      }
      case LINE: {
        if (cmd.size(runtime) < 3) {
          RNSkLogger::logToConsole("Invalid line command found");
          return jsi::Value::null();
        }
        auto x = cmd.getValueAtIndex(runtime, 1).asNumber();
        auto y = cmd.getValueAtIndex(runtime, 2).asNumber();
        path.lineTo(x, y);
        break;
      }
      case QUAD: {
        if (cmd.size(runtime) < 5) {
          RNSkLogger::logToConsole("Invalid line command found");
          return jsi::Value::null();
        }
        auto x1 = cmd.getValueAtIndex(runtime, 1).asNumber();
        auto y1 = cmd.getValueAtIndex(runtime, 2).asNumber();
        auto x2 = cmd.getValueAtIndex(runtime, 3).asNumber();
        auto y2 = cmd.getValueAtIndex(runtime, 4).asNumber();
        path.quadTo(x1, y1, x2, y2);
        break;
      }
      case CONIC: {
        if (cmd.size(runtime) < 6) {
          RNSkLogger::logToConsole("Invalid line command found");
          return jsi::Value::null();
        }
        auto x1 = cmd.getValueAtIndex(runtime, 1).asNumber();
        auto y1 = cmd.getValueAtIndex(runtime, 2).asNumber();
        auto x2 = cmd.getValueAtIndex(runtime, 3).asNumber();
        auto y2 = cmd.getValueAtIndex(runtime, 4).asNumber();
        auto w = cmd.getValueAtIndex(runtime, 5).asNumber();
        path.conicTo(x1, y1, x2, y2, w);
        break;
      }
      case CUBIC: {
        if (cmd.size(runtime) < 7) {
          RNSkLogger::logToConsole("Invalid line command found");
          return jsi::Value::null();
        }
        auto x1 = cmd.getValueAtIndex(runtime, 1).asNumber();
        auto y1 = cmd.getValueAtIndex(runtime, 2).asNumber();
        auto x2 = cmd.getValueAtIndex(runtime, 3).asNumber();
        auto y2 = cmd.getValueAtIndex(runtime, 4).asNumber();
        auto x3 = cmd.getValueAtIndex(runtime, 5).asNumber();
        auto y3 = cmd.getValueAtIndex(runtime, 6).asNumber();
        path.cubicTo(x1, y1, x2, y2, x3, y3);
        break;
      }
      case CLOSE: {
        path.close();
        break;
      }
      default: {
        RNSkLogger::logToConsole("Found an unknown command");
        return jsi::Value::null();
      }
      }
    }
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(MakeFromText) {
    auto text = arguments[0].asString(runtime).utf8(runtime);
    auto x = arguments[1].asNumber();
    auto y = arguments[2].asNumber();
    auto font = JsiSkFont::fromValue(runtime, arguments[3]);
    SkPath path;
    SkTextUtils::GetPath(text.c_str(), strlen(text.c_str()),
                         SkTextEncoding::kUTF8, x, y, *font, &path);
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  // Static shape factories
  JSI_HOST_FUNCTION(Rect) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    SkPath path;
    path.addRect(*rect, direction);
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(Oval) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    unsigned startIndex = count < 3 ? 0 : arguments[2].asNumber();
    SkPath path;
    path.addOval(*rect, direction, startIndex);
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(Circle) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    auto r = arguments[2].asNumber();
    SkPath path;
    path.addCircle(x, y, r);
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(RRect) {
    auto rrect = JsiSkRRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    SkPath path;
    path.addRRect(*rrect, direction);
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(Line) {
    auto p1 = JsiSkPoint::fromValue(
        runtime, arguments[0].asObject(runtime));
    auto p2 = JsiSkPoint::fromValue(
        runtime, arguments[1].asObject(runtime));
    SkPath path;
    path.moveTo(*p1);
    path.lineTo(*p2);
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(Polygon) {
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
    SkPath path;
    auto p = SkSpan(points.data(), points.size());
    path.addPoly(p, close);
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  // Static path operations
  JSI_HOST_FUNCTION(Stroke) {
    auto srcPath = JsiSkPath::fromValue(runtime, arguments[0]);
    SkPath path = *srcPath;
    SkPaint p;
    p.setStyle(SkPaint::kStroke_Style);

    if (count > 1 && !arguments[1].isUndefined()) {
      auto opts = arguments[1].asObject(runtime);

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
        auto miter_limit = jsiMiterLimit.asNumber();
        p.setStrokeMiter(miter_limit);
      }

      auto jsiPrecision = opts.getProperty(runtime, "precision");
      auto precision = jsiPrecision.isUndefined() ? 1 : jsiPrecision.asNumber();
      SkPath result;
      auto success =
          skpathutils::FillPathWithPaint(path, p, &result, nullptr, precision);
      if (success) {
        auto hostObjectInstance =
            std::make_shared<JsiSkPath>(getContext(), std::move(result));
        return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
            runtime, hostObjectInstance, getContext());
      }
    } else {
      SkPath result;
      auto success =
          skpathutils::FillPathWithPaint(path, p, &result, nullptr, 1);
      if (success) {
        auto hostObjectInstance =
            std::make_shared<JsiSkPath>(getContext(), std::move(result));
        return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
            runtime, hostObjectInstance, getContext());
      }
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(Trim) {
    auto srcPath = JsiSkPath::fromValue(runtime, arguments[0]);
    auto start = std::clamp(arguments[1].asNumber(), 0.0, 1.0);
    auto end = std::clamp(arguments[2].asNumber(), 0.0, 1.0);
    auto isComplement = arguments[3].getBool();
    SkPath path = *srcPath;
    auto mode = isComplement ? SkTrimPathEffect::Mode::kInverted
                             : SkTrimPathEffect::Mode::kNormal;
    auto pe = SkTrimPathEffect::Make(start, end, mode);
    if (!pe) {
      return jsi::Value::null();
    }
    SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
    SkPath result;
    if (pe->filterPath(&result, path, &rec, nullptr)) {
      auto hostObjectInstance =
          std::make_shared<JsiSkPath>(getContext(), std::move(result));
      return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
          runtime, hostObjectInstance, getContext());
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(Simplify) {
    auto srcPath = JsiSkPath::fromValue(runtime, arguments[0]);
    SkPath result;
    if (Simplify(*srcPath, &result)) {
      auto hostObjectInstance =
          std::make_shared<JsiSkPath>(getContext(), std::move(result));
      return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
          runtime, hostObjectInstance, getContext());
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(Dash) {
    auto srcPath = JsiSkPath::fromValue(runtime, arguments[0]);
    SkScalar on = arguments[1].asNumber();
    SkScalar off = arguments[2].asNumber();
    auto phase = arguments[3].asNumber();
    SkScalar intervals[] = {on, off};
    auto i = SkSpan(intervals, 2);
    auto pe = SkDashPathEffect::Make(i, phase);
    if (!pe) {
      return jsi::Value::null();
    }
    SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
    SkPath result;
    if (pe->filterPath(&result, *srcPath, &rec, nullptr)) {
      auto hostObjectInstance =
          std::make_shared<JsiSkPath>(getContext(), std::move(result));
      return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
          runtime, hostObjectInstance, getContext());
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(AsWinding) {
    auto srcPath = JsiSkPath::fromValue(runtime, arguments[0]);
    SkPath result;
    if (AsWinding(*srcPath, &result)) {
      auto hostObjectInstance =
          std::make_shared<JsiSkPath>(getContext(), std::move(result));
      return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
          runtime, hostObjectInstance, getContext());
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(Interpolate) {
    auto path1 = JsiSkPath::fromValue(runtime, arguments[0]);
    auto path2 = JsiSkPath::fromValue(runtime, arguments[1]);
    auto weight = arguments[2].asNumber();
    SkPath result;
    auto succeed = path1->interpolate(*path2, weight, &result);
    if (!succeed) {
      return jsi::Value::null();
    }
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(result));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  size_t getMemoryPressure() const override { return 1024; }

  std::string getObjectType() const override { return "JsiSkPathFactory"; }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkPathFactory, Make),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, MakeFromSVGString),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, MakeFromOp),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, MakeFromCmds),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, MakeFromText),
                       // Static shape factories
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Rect),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Oval),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Circle),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, RRect),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Line),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Polygon),
                       // Static path operations
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Stroke),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Trim),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Simplify),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Dash),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, AsWinding),
                       JSI_EXPORT_FUNC(JsiSkPathFactory, Interpolate))

  explicit JsiSkPathFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}
};

} // namespace RNSkia
