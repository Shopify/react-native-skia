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
#include "include/core/SkPathTypes.h"
#include "include/core/SkString.h"
#include "include/utils/SkParsePath.h"

#include "include/pathops/SkPathOps.h"

#pragma clang diagnostic pop

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkPath : public JsiSkWrappingSharedPtrHostObject<SkPath> {
private:
  static const int MOVE = 0;
  static const int LINE = 1;
  static const int QUAD = 2;
  static const int CONIC = 3;
  static const int CUBIC = 4;
  static const int CLOSE = 5;

public:
  // Query methods

  JSI_HOST_FUNCTION(computeTightBounds) {
    auto result = getObject()->computeTightBounds();
    auto hostObjectInstance = std::make_shared<JsiSkRect>(getContext(), result);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(getBounds) {
    auto result = getObject()->getBounds();
    auto hostObjectInstance = std::make_shared<JsiSkRect>(getContext(), result);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(contains) {
    auto x = arguments[0].asNumber();
    auto y = arguments[1].asNumber();
    return jsi::Value(getObject()->contains(x, y));
  }

  JSI_HOST_FUNCTION(getFillType) {
    auto fillType = getObject()->getFillType();
    return jsi::Value(static_cast<int>(fillType));
  }

  JSI_HOST_FUNCTION(isVolatile) {
    return jsi::Value(getObject()->isVolatile());
  }

  JSI_HOST_FUNCTION(getPoint) {
    auto index = arguments[0].asNumber();
    auto point = getObject()->getPoint(index);
    auto hostObjectInstance = std::make_shared<JsiSkPoint>(getContext(), point);
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(isEmpty) { return jsi::Value(getObject()->isEmpty()); }

  JSI_HOST_FUNCTION(countPoints) {
    auto points = getObject()->countPoints();
    return jsi::Value(points);
  }

  JSI_HOST_FUNCTION(getLastPt) {
    SkPoint last;
    getObject()->getLastPt(&last);
    auto point = jsi::Object(runtime);
    point.setProperty(runtime, "x", static_cast<double>(last.fX));
    point.setProperty(runtime, "y", static_cast<double>(last.fY));
    return point;
  }

  JSI_HOST_FUNCTION(toSVGString) {
    SkPath path = *getObject();
    auto s = SkParsePath::ToSVGString(path);
    return jsi::String::createFromUtf8(runtime, s.c_str());
  }

  JSI_HOST_FUNCTION(equals) {
    auto p1 = JsiSkPath::fromValue(runtime, arguments[0]).get();
    auto p2 = JsiSkPath::fromValue(runtime, arguments[1]).get();
    return jsi::Value(p1 == p2);
  }

  JSI_HOST_FUNCTION(copy) {
    const auto *path = getObject().get();
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), SkPath(*path));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(isInterpolatable) {
    auto path2 = JsiSkPath::fromValue(runtime, arguments[0]);
    return getObject()->isInterpolatable(*path2);
  }

  JSI_HOST_FUNCTION(interpolate) {
    auto path2 = JsiSkPath::fromValue(runtime, arguments[0]);
    auto weight = arguments[1].asNumber();
    SkPath result;
    auto succeed = getObject()->interpolate(*path2, weight, &result);
    if (!succeed) {
      return jsi::Value::null();
    }
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(result));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  // Methods that return new paths (immutable)

  JSI_HOST_FUNCTION(transform) {
    auto m3 = *JsiSkMatrix::fromValue(runtime, arguments[0]);
    SkPath result;
    getObject()->transform(m3, &result);
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(result));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(offset) {
    SkScalar dx = arguments[0].asNumber();
    SkScalar dy = arguments[1].asNumber();
    SkPath result;
    getObject()->offset(dx, dy, &result);
    auto hostObjectInstance =
        std::make_shared<JsiSkPath>(getContext(), std::move(result));
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(
        runtime, hostObjectInstance, getContext());
  }

  JSI_HOST_FUNCTION(toCmds) {
    auto path = *getObject();
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
      // Query methods
      JSI_EXPORT_FUNC(JsiSkPath, computeTightBounds),
      JSI_EXPORT_FUNC(JsiSkPath, getBounds),
      JSI_EXPORT_FUNC(JsiSkPath, contains),
      JSI_EXPORT_FUNC(JsiSkPath, getFillType),
      JSI_EXPORT_FUNC(JsiSkPath, isVolatile),
      JSI_EXPORT_FUNC(JsiSkPath, getPoint),
      JSI_EXPORT_FUNC(JsiSkPath, isEmpty),
      JSI_EXPORT_FUNC(JsiSkPath, countPoints),
      JSI_EXPORT_FUNC(JsiSkPath, getLastPt),
      JSI_EXPORT_FUNC(JsiSkPath, toSVGString),
      JSI_EXPORT_FUNC(JsiSkPath, equals),
      JSI_EXPORT_FUNC(JsiSkPath, copy),
      JSI_EXPORT_FUNC(JsiSkPath, isInterpolatable),
      JSI_EXPORT_FUNC(JsiSkPath, interpolate),
      JSI_EXPORT_FUNC(JsiSkPath, toCmds),
      // Immutable transformation methods
      JSI_EXPORT_FUNC(JsiSkPath, transform),
      JSI_EXPORT_FUNC(JsiSkPath, offset),
      JSI_EXPORT_FUNC(JsiSkPath, dispose))

  JsiSkPath(std::shared_ptr<RNSkPlatformContext> context, SkPath path)
      : JsiSkWrappingSharedPtrHostObject<SkPath>(
            std::move(context), std::make_shared<SkPath>(std::move(path))) {}

  size_t getMemoryPressure() const override {
    auto path = getObject();
    if (!path)
      return 0;

    // SkPath provides approximateBytesUsed() to estimate memory usage
    return path->approximateBytesUsed();
  }

  std::string getObjectType() const override { return "JsiSkPath"; }

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
