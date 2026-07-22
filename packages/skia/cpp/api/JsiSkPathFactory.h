#pragma once

#include <algorithm>
#include <memory>
#include <utility>
#include <vector>

#include <jsi/jsi.h>

#include "JsiSkHostObjects.h"
#include "JsiSkMatrix.h"
#include "JsiSkNativeObjects.h"
#include "JsiSkPathEffect.h"
#include "JsiSkPoint.h"
#include "JsiSkRRect.h"
#include "JsiSkRect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkPath.h"
#include "include/core/SkPathBuilder.h"
#include "include/core/SkPathUtils.h"
#include "include/core/SkStrokeRec.h"
#include "include/effects/SkDashPathEffect.h"
#include "include/effects/SkTrimPathEffect.h"
#include "include/pathops/SkPathOps.h"
#include "include/utils/SkTextUtils.h"
#include "utils/RNSkLog.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPathFactory : public JsiSkNativeObject<JsiSkPathFactory> {

  static const int MOVE = 0;
  static const int LINE = 1;
  static const int QUAD = 2;
  static const int CONIC = 3;
  static const int CUBIC = 4;
  static const int CLOSE = 5;

public:
  static constexpr const char *CLASS_NAME = "PathFactory";

  JSI_HOST_FUNCTION(Make) {
    return makeJsiObject(runtime,
                         std::make_shared<JsiSkPath>(getContext(), SkPath()));
  }

  JSI_HOST_FUNCTION(MakeFromSVGString) {
    auto svgString = arguments[0].asString(runtime).utf8(runtime);
    auto result = SkParsePath::FromSVGString(svgString.c_str());
    if (!result.has_value()) {
      throw jsi::JSError(runtime, "Could not parse Svg path");
      return jsi::Value(nullptr);
    }
    return makeJsiObject(runtime, std::make_shared<JsiSkPath>(
                                      getContext(), std::move(result.value())));
  }

  JSI_HOST_FUNCTION(MakeFromOp) {
    auto one = JsiSkPath::fromValue(runtime, arguments[0])->snapshot();
    auto two = JsiSkPath::fromValue(runtime, arguments[1])->snapshot();
    SkPathOp op = (SkPathOp)arguments[2].asNumber();
    auto result = Op(one, two, op);
    if (!result.has_value()) {
      return jsi::Value(nullptr);
    }
    return makeJsiObject(runtime, std::make_shared<JsiSkPath>(
                                      getContext(), std::move(result.value())));
  }

  JSI_HOST_FUNCTION(MakeFromCmds) {
    SkPathBuilder builder;
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
        builder.moveTo(x, y);
        break;
      }
      case LINE: {
        if (cmd.size(runtime) < 3) {
          RNSkLogger::logToConsole("Invalid line command found");
          return jsi::Value::null();
        }
        auto x = cmd.getValueAtIndex(runtime, 1).asNumber();
        auto y = cmd.getValueAtIndex(runtime, 2).asNumber();
        builder.lineTo(x, y);
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
        builder.quadTo(x1, y1, x2, y2);
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
        builder.conicTo(x1, y1, x2, y2, w);
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
        builder.cubicTo(x1, y1, x2, y2, x3, y3);
        break;
      }
      case CLOSE: {
        builder.close();
        break;
      }
      default: {
        RNSkLogger::logToConsole("Found an unknown command");
        return jsi::Value::null();
      }
      }
    }
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), builder.snapshot()));
  }

  JSI_HOST_FUNCTION(MakeFromText) {
    auto text = arguments[0].asString(runtime).utf8(runtime);
    auto x = arguments[1].asNumber();
    auto y = arguments[2].asNumber();
    auto font = JsiSkFont::fromValue(runtime, arguments[3]);
    SkPath path;
    SkTextUtils::GetPath(text.c_str(), strlen(text.c_str()),
                         SkTextEncoding::kUTF8, x, y, *font, &path);
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), std::move(path)));
  }

  // Static shape factories
  JSI_HOST_FUNCTION(Rect) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    SkPathBuilder builder;
    builder.addRect(*rect, direction);
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), builder.snapshot()));
  }

  JSI_HOST_FUNCTION(Oval) {
    auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    unsigned startIndex = count < 3 ? 0 : arguments[2].asNumber();
    SkPathBuilder builder;
    builder.addOval(*rect, direction, startIndex);
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), builder.snapshot()));
  }

  JSI_HOST_FUNCTION(Circle) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    auto r = arguments[2].asNumber();
    SkPathBuilder builder;
    builder.addCircle(x, y, r);
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), builder.snapshot()));
  }

  JSI_HOST_FUNCTION(RRect) {
    auto rrect = JsiSkRRect::fromValue(runtime, arguments[0]);
    auto direction = SkPathDirection::kCW;
    if (count >= 2 && arguments[1].getBool()) {
      direction = SkPathDirection::kCCW;
    }
    SkPathBuilder builder;
    builder.addRRect(*rrect, direction);
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), builder.snapshot()));
  }

  JSI_HOST_FUNCTION(Line) {
    auto p1 = JsiSkPoint::fromValue(runtime, arguments[0].asObject(runtime));
    auto p2 = JsiSkPoint::fromValue(runtime, arguments[1].asObject(runtime));
    SkPathBuilder builder;
    builder.moveTo(*p1);
    builder.lineTo(*p2);
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), builder.snapshot()));
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
    SkPathBuilder builder;
    builder.addPolygon(SkSpan(points), close);
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), builder.snapshot()));
  }

  // Static path operations
  JSI_HOST_FUNCTION(Stroke) {
    auto srcPath = JsiSkPath::fromValue(runtime, arguments[0]);
    SkPath path = srcPath->snapshot();
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
      SkPathBuilder resultBuilder;
      auto ctm = SkMatrix::Scale(precision, precision);
      auto success =
          skpathutils::FillPathWithPaint(path, p, &resultBuilder, nullptr, ctm);
      if (success) {
        return makeJsiObject(
            runtime, std::make_shared<JsiSkPath>(getContext(),
                                                 resultBuilder.snapshot()));
      }
    } else {
      SkPathBuilder resultBuilder;
      auto success = skpathutils::FillPathWithPaint(path, p, &resultBuilder);
      if (success) {
        return makeJsiObject(
            runtime, std::make_shared<JsiSkPath>(getContext(),
                                                 resultBuilder.snapshot()));
      }
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(Trim) {
    auto srcPath = JsiSkPath::fromValue(runtime, arguments[0]);
    float start =
        std::clamp(static_cast<float>(arguments[1].asNumber()), 0.0f, 1.0f);
    float end =
        std::clamp(static_cast<float>(arguments[2].asNumber()), 0.0f, 1.0f);
    auto isComplement = arguments[3].getBool();
    // If requesting the full path in normal mode, just return a copy
    if (start <= 0 && end >= 1 && !isComplement) {
      SkPath result = srcPath->snapshot();
      return makeJsiObject(runtime, std::make_shared<JsiSkPath>(
                                        getContext(), std::move(result)));
    }
    SkPath path = srcPath->snapshot();
    auto mode = isComplement ? SkTrimPathEffect::Mode::kInverted
                             : SkTrimPathEffect::Mode::kNormal;
    auto pe = SkTrimPathEffect::Make(start, end, mode);
    if (!pe) {
      return jsi::Value::null();
    }
    SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
    SkPathBuilder resultBuilder;
    if (pe->filterPath(&resultBuilder, path, &rec)) {
      auto result = resultBuilder.detach();
      return makeJsiObject(runtime, std::make_shared<JsiSkPath>(
                                        getContext(), std::move(result)));
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(Simplify) {
    auto srcPath = JsiSkPath::fromValue(runtime, arguments[0]);
    auto result = ::Simplify(srcPath->snapshot());
    if (result.has_value()) {
      return makeJsiObject(
          runtime,
          std::make_shared<JsiSkPath>(getContext(), std::move(result.value())));
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
    SkPathBuilder resultBuilder;
    if (pe->filterPath(&resultBuilder, srcPath->snapshot(), &rec)) {
      auto result = resultBuilder.detach();
      return makeJsiObject(runtime, std::make_shared<JsiSkPath>(
                                        getContext(), std::move(result)));
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(AsWinding) {
    auto srcPath = JsiSkPath::fromValue(runtime, arguments[0]);
    auto result = ::AsWinding(srcPath->snapshot());
    if (result.has_value()) {
      return makeJsiObject(
          runtime,
          std::make_shared<JsiSkPath>(getContext(), std::move(result.value())));
    }
    return jsi::Value::null();
  }

  JSI_HOST_FUNCTION(Interpolate) {
    auto path1 = JsiSkPath::fromValue(runtime, arguments[0]);
    auto path2 = JsiSkPath::fromValue(runtime, arguments[1]);
    auto weight = arguments[2].asNumber();
    auto p1 = path1->snapshot();
    auto p2 = path2->snapshot();
    SkPath result;
    auto succeed = p1.interpolate(p2, weight, &result);
    if (!succeed) {
      return jsi::Value::null();
    }
    return makeJsiObject(
        runtime, std::make_shared<JsiSkPath>(getContext(), std::move(result)));
  }

  size_t getMemoryPressure() override { return 1024; }

  static void definePrototype(jsi::Runtime &runtime, jsi::Object &prototype) {
    installCommon(runtime, prototype);
    installHostMethod(runtime, prototype, "Make", &JsiSkPathFactory::Make);
    installHostMethod(runtime, prototype, "MakeFromSVGString",
                      &JsiSkPathFactory::MakeFromSVGString);
    installHostMethod(runtime, prototype, "MakeFromOp",
                      &JsiSkPathFactory::MakeFromOp);
    installHostMethod(runtime, prototype, "MakeFromCmds",
                      &JsiSkPathFactory::MakeFromCmds);
    installHostMethod(runtime, prototype, "MakeFromText",
                      &JsiSkPathFactory::MakeFromText);
    // Static shape factories
    installHostMethod(runtime, prototype, "Rect", &JsiSkPathFactory::Rect);
    installHostMethod(runtime, prototype, "Oval", &JsiSkPathFactory::Oval);
    installHostMethod(runtime, prototype, "Circle", &JsiSkPathFactory::Circle);
    installHostMethod(runtime, prototype, "RRect", &JsiSkPathFactory::RRect);
    installHostMethod(runtime, prototype, "Line", &JsiSkPathFactory::Line);
    installHostMethod(runtime, prototype, "Polygon",
                      &JsiSkPathFactory::Polygon);
    // Static path operations
    installHostMethod(runtime, prototype, "Stroke", &JsiSkPathFactory::Stroke);
    installHostMethod(runtime, prototype, "Trim", &JsiSkPathFactory::Trim);
    installHostMethod(runtime, prototype, "Simplify",
                      &JsiSkPathFactory::Simplify);
    installHostMethod(runtime, prototype, "Dash", &JsiSkPathFactory::Dash);
    installHostMethod(runtime, prototype, "AsWinding",
                      &JsiSkPathFactory::AsWinding);
    installHostMethod(runtime, prototype, "Interpolate",
                      &JsiSkPathFactory::Interpolate);
  }

  explicit JsiSkPathFactory(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkNativeObject<JsiSkPathFactory>(std::move(context)) {}
};

} // namespace RNSkia
