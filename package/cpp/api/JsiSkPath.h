#pragma once

#include <map>

#include "JsiSkHostObjects.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkParsePath.h>
#include <SkPath.h>
#include <SkPathOps.h>
#include <SkPathTypes.h>
#include <SkTextUtils.h>

#pragma clang diagnostic pop

#include <jsi/jsi.h>

namespace RNSkia {

using namespace facebook;

class JsiSkPath : public JsiSkWrappingSharedPtrHostObject<SkPath> {
public:
  JsiSkPath(RNSkPlatformContext *context)
      : JsiSkWrappingSharedPtrHostObject<SkPath>(context,
                                                 std::make_shared<SkPath>()) {
    install(context);
  };

  /**
    Returns the underlying object from a host object of this type
   */
  static std::shared_ptr<SkPath> fromValue(jsi::Runtime &runtime,
                                           const jsi::Value &obj) {
    return obj.asObject(runtime)
        .asHostObject<JsiSkPath>(runtime)
        .get()
        ->getObject();
  }

  /**
   * Creates the function for construction a new instance of the SkPath
   * wrapper
   * @param context Platform context
   * @return A function for creating a new host object wrapper for the SkPath
   * class
   */
  static const jsi::HostFunctionType createCtor(RNSkPlatformContext *context) {
    return JSI_FUNC_SIGNATURE {
      // argument can be provided as an svg path string
      return jsi::Object::createFromHostObject(
          runtime, std::make_shared<JsiSkPath>(context));
    };
  }

private:
  void install(RNSkPlatformContext *context) {
    installFunction(
        "moveTo", JSI_FUNC_SIGNATURE {
          SkScalar x = arguments[0].asNumber();
          SkScalar y = arguments[1].asNumber();
          getObject()->moveTo(x, y);
          return jsi::Value::undefined();
        });

    installFunction(
        "lineTo", JSI_FUNC_SIGNATURE {
          SkScalar x = arguments[0].asNumber();
          SkScalar y = arguments[1].asNumber();
          getObject()->lineTo(x, y);
          return jsi::Value::undefined();
        });

    installFunction(
        "arcTo", JSI_FUNC_SIGNATURE {
          auto rx = arguments[0].asNumber();
          auto ry = arguments[1].asNumber();
          auto xAxisRotate = arguments[2].asNumber();
          auto largeArc = arguments[3].getBool();
          auto sweep = arguments[4].getBool();
          auto x = arguments[5].asNumber();
          auto y = arguments[6].asNumber();
          getObject()->arcTo(
              rx, ry, xAxisRotate,
              largeArc ? SkPath::kLarge_ArcSize : SkPath::kSmall_ArcSize,
              sweep ? SkPathDirection::kCW : SkPathDirection::kCCW, x, y);
          return jsi::Value::undefined();
        });

    installFunction(
        "cubicTo", JSI_FUNC_SIGNATURE {
          auto x1 = arguments[0].asNumber();
          auto y1 = arguments[1].asNumber();
          auto x2 = arguments[2].asNumber();
          auto y2 = arguments[3].asNumber();
          auto x3 = arguments[4].asNumber();
          auto y3 = arguments[5].asNumber();
          getObject()->cubicTo(x1, y1, x2, y2, x3, y3);
          return jsi::Value::undefined();
        });

    installFunction(
        "quadTo", JSI_FUNC_SIGNATURE {
          auto x1 = arguments[0].asNumber();
          auto y1 = arguments[1].asNumber();
          auto x2 = arguments[2].asNumber();
          auto y2 = arguments[3].asNumber();
          getObject()->quadTo(x1, y1, x2, y2);
          return jsi::Value::undefined();
        });

    installFunction(
        "addRect", JSI_FUNC_SIGNATURE {
          auto x = arguments[0].asNumber();
          auto y = arguments[1].asNumber();
          auto w = arguments[2].asNumber();
          auto h = arguments[3].asNumber();
          getObject()->addRect(SkRect::MakeXYWH(x, y, w, h));
          return jsi::Value::undefined();
        });

    installFunction(
        "addRoundRect", JSI_FUNC_SIGNATURE {
          auto x = arguments[0].asNumber();
          auto y = arguments[1].asNumber();
          auto w = arguments[2].asNumber();
          auto h = arguments[3].asNumber();
          auto rx = arguments[4].asNumber();
          auto ry = arguments[5].asNumber();
          getObject()->addRoundRect(SkRect::MakeXYWH(x, y, w, h), rx, ry);
          return jsi::Value::undefined();
        });

    installFunction(
        "addCircle", JSI_FUNC_SIGNATURE {
          auto x = arguments[0].asNumber();
          auto y = arguments[1].asNumber();
          auto r = arguments[2].asNumber();
          getObject()->addCircle(x, y, r);
          return jsi::Value::undefined();
        });

    installFunction(
        "getLastPt", JSI_FUNC_SIGNATURE {
          SkPoint last;
          getObject()->getLastPt(&last);
          auto point = jsi::Object(runtime);
          point.setProperty(runtime, "x", getJsNumber(last.fX));
          point.setProperty(runtime, "y", getJsNumber(last.fY));
          return point;
        });

    installFunction(
        "close", JSI_FUNC_SIGNATURE {
          getObject()->close();
          return jsi::Value::undefined();
        });

    installFunction(
        "simplify", JSI_FUNC_SIGNATURE {
          SkPath result;
          if (Simplify(*getObject(), &result)) {
            getObject()->swap(result);
            return jsi::Value(true);
          }
          return jsi::Value(false);
        });

    installFunction(
        "fromText", JSI_FUNC_SIGNATURE {
          auto text = arguments[0].asString(runtime).utf8(runtime);
          auto x = arguments[1].asNumber();
          auto y = arguments[2].asNumber();
          auto font = JsiSkFont::fromValue(runtime, arguments[3]);
          SkPath result;
          SkTextUtils::GetPath(text.c_str(), strlen(text.c_str()),
                               SkTextEncoding::kUTF8, x, y, *font, &result);

          getObject()->swap(result);
          return jsi::Value::undefined();
        });

    installFunction(
        "fromSvgPath", JSI_FUNC_SIGNATURE {
          auto svgString = arguments[0].asString(runtime).utf8(runtime);
          SkPath result;

          if (!SkParsePath::FromSVGString(svgString.c_str(), &result)) {
            jsi::detail::throwJSError(runtime, "Could not parse Svg path");
            return jsi::Value(false);
          }

          getObject()->swap(result);

          return jsi::Value(true);
        });

    installFunction(
        "fromPath", JSI_FUNC_SIGNATURE {
          auto otherPath = JsiSkPath::fromValue(runtime, arguments[0]);
          SkPath nextPath = SkPath(*otherPath);
          getObject()->swap(nextPath);
          return jsi::Value::undefined();
        });

    installFunction(
        "op", JSI_FUNC_SIGNATURE {
          auto path2 = JsiSkPath::fromValue(runtime, arguments[0]);
          int pathOp = arguments[1].asNumber();
          SkPath result;
          if (Op(*getObject(), *path2, SkPathOp(pathOp), &result)) {
            getObject()->swap(result);
            return jsi::Value(true);
          }
          return jsi::Value(false);
        });
  }
};

} // namespace RNSkia
