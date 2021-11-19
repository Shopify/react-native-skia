#pragma once

#include <map>

#include <jsi/jsi.h>
#include "JsiSkHostObjects.h"
#include "JsiSkTypes.h"
#include "JsiSkPoint.h"
#include "JsiSkRect.h"
#include "JsiSkRRect.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkParsePath.h>
#include <SkPath.h>
#include <SkPathOps.h>
#include <SkPathTypes.h>
#include <SkTextUtils.h>
#include <SkDashPathEffect.h>
#include <SkTrimPathEffect.h>
#include <SkStrokeRec.h>

#pragma clang diagnostic pop

namespace RNSkia {

using namespace facebook;

class JsiSkPath : public JsiSkWrappingSharedPtrHostObject<SkPath> {
   public:
    JsiSkPath(RNSkPlatformContext *context, SkPath path)
        : JsiSkWrappingSharedPtrHostObject<SkPath>(
              context,
              std::make_shared<SkPath>(path)) {
        install(context);
    };

    /**
      Returns the underlying object from a host object of this type
     */
    static std::shared_ptr<SkPath> fromValue(
        jsi::Runtime &runtime,
        const jsi::Value &obj) {
        return obj.asObject(runtime)
            .asHostObject<JsiSkPath>(runtime)
            .get()
            ->getObject();
    }

   private:
    void install(RNSkPlatformContext *context) {
        installFunction(
            "addArc", JSI_FUNC_SIGNATURE {
                auto rect = JsiSkRect::fromValue(runtime, arguments[0]).get();
                auto start = arguments[1].asNumber();
                auto sweep = arguments[2].asNumber();
                getObject()->addArc(*rect, start, sweep);
                return jsi::Value::undefined();
            });

        installFunction(
            "addOval", JSI_FUNC_SIGNATURE {
                auto rect = JsiSkRect::fromValue(runtime, arguments[0]).get();
                auto direction = SkPathDirection::kCW;
                if (count >= 2 && arguments[1].getBool()) {
                    direction = SkPathDirection::kCCW;
                }
                unsigned startIndex = count < 3 ? 0 :  arguments[2].asNumber();
                getObject()->addOval(*rect, direction, startIndex);
                return jsi::Value::undefined();
            });

        installFunction(
            "addPoly", JSI_FUNC_SIGNATURE {
                std::vector<SkPoint> points;
                auto jsiPoints =
                        arguments[0].asObject(runtime).asArray(runtime);
                auto pointsSize = jsiPoints.size(runtime);
                auto close = arguments[1].getBool();
                for (int i = 0; i < pointsSize; i++) {
                    std::shared_ptr<SkPoint> point = JsiSkPoint::fromValue(
                            runtime,
                            jsiPoints.getValueAtIndex(runtime, i).asObject(runtime)
                    );
                    points.push_back(*point.get());
                }
                getObject()->addPoly(points.data(), points.size(), close);
                return jsi::Value::undefined();
            });

        installFunction(
        "addRect", JSI_FUNC_SIGNATURE {
            auto rect = JsiSkRect::fromValue(runtime, arguments[0]).get();
            auto direction = SkPathDirection::kCW;
            if (count >= 2 && arguments[1].getBool()) {
                direction = SkPathDirection::kCCW;
            }
            getObject()->addRect(*rect, direction);
            return jsi::Value::undefined();
        });

        installFunction(
        "addRRect", JSI_FUNC_SIGNATURE {
            auto rrect = JsiSkRRect::fromValue(runtime, arguments[0]).get();
            auto direction = SkPathDirection::kCW;
            if (count >= 2 && arguments[1].getBool()) {
                direction = SkPathDirection::kCCW;
            }
            getObject()->addRRect(*rrect, direction);
            return jsi::Value::undefined();
        });

        installFunction(
        "arcToOval", JSI_FUNC_SIGNATURE {
            auto rect = JsiSkRect::fromValue(runtime, arguments[0]).get();
            auto start = arguments[1].asNumber();
            auto sweep = arguments[2].asNumber();
            auto forceMoveTo = arguments[3].getBool();
            getObject()->arcTo(*rect, start, sweep, forceMoveTo);
            return jsi::Value::undefined();
        });

        installFunction(
        "arcToOval", JSI_FUNC_SIGNATURE {
            auto rect = JsiSkRect::fromValue(runtime, arguments[0]).get();
            auto start = arguments[1].asNumber();
            auto sweep = arguments[2].asNumber();
            auto forceMoveTo = arguments[3].getBool();
            getObject()->arcTo(*rect, start, sweep, forceMoveTo);
            return jsi::Value::undefined();
        });

        installFunction(
        "arcToRotated", JSI_FUNC_SIGNATURE {
            auto rx = arguments[0].asNumber();
            auto ry = arguments[1].asNumber();
            auto xAxisRotate = arguments[2].asNumber();
            auto useSmallArc = arguments[3].getBool();
            auto arcSize = useSmallArc ? SkPath::ArcSize::kSmall_ArcSize : SkPath::ArcSize::kLarge_ArcSize;
            auto sweep = arguments[4].getBool() ? SkPathDirection::kCCW : SkPathDirection::kCW;
            auto x = arguments[5].asNumber();
            auto y = arguments[6].asNumber();
            getObject()->arcTo(rx, ry, xAxisRotate, arcSize, sweep, x, y);
            return jsi::Value::undefined();
        });

        installFunction(
        "rArcTo", JSI_FUNC_SIGNATURE {
            auto rx = arguments[0].asNumber();
            auto ry = arguments[1].asNumber();
            auto xAxisRotate = arguments[2].asNumber();
            auto useSmallArc = arguments[3].getBool();
            auto arcSize = useSmallArc ? SkPath::ArcSize::kSmall_ArcSize : SkPath::ArcSize::kLarge_ArcSize;
            auto sweep = arguments[4].getBool() ? SkPathDirection::kCCW : SkPathDirection::kCW;
            auto x = arguments[5].asNumber();
            auto y = arguments[6].asNumber();
            getObject()->rArcTo(rx, ry, xAxisRotate, arcSize, sweep, x, y);
            return jsi::Value::undefined();
        });

        installFunction(
        "arcToTangent", JSI_FUNC_SIGNATURE {
            auto x1 = arguments[0].asNumber();
            auto y1 = arguments[1].asNumber();
            auto x2 = arguments[1].asNumber();
            auto y2 = arguments[1].asNumber();
            auto r = arguments[1].asNumber();
            getObject()->arcTo(x1, y1, x2, y2, r);
            return jsi::Value::undefined();
        });

        installFunction(
        "computeTightBounds", JSI_FUNC_SIGNATURE {
            auto result = getObject()->computeTightBounds();
            return jsi::Object::createFromHostObject(
                    runtime,
                    std::make_shared<JsiSkRect>(context, result)
            );
        });

        installFunction(
        "getBounds", JSI_FUNC_SIGNATURE {
            auto result = getObject()->getBounds();
            return jsi::Object::createFromHostObject(
                    runtime,
                    std::make_shared<JsiSkRect>(context, result)
            );
        });

        installFunction(
        "conicTo", JSI_FUNC_SIGNATURE {
            auto x1 = arguments[0].asNumber();
            auto y1 = arguments[1].asNumber();
            auto x2 = arguments[1].asNumber();
            auto y2 = arguments[1].asNumber();
            auto w = arguments[1].asNumber();
            getObject()->conicTo(x1, y1, x2, y2, w);
            return jsi::Value::undefined();
        });

        installFunction(
        "rConicTo", JSI_FUNC_SIGNATURE {
            auto x1 = arguments[0].asNumber();
            auto y1 = arguments[1].asNumber();
            auto x2 = arguments[1].asNumber();
            auto y2 = arguments[1].asNumber();
            auto w = arguments[1].asNumber();
            getObject()->rConicTo(x1, y1, x2, y2, w);
            return jsi::Value::undefined();
        });

        installFunction(
        "contains", JSI_FUNC_SIGNATURE {
            auto x = arguments[0].asNumber();
            auto y = arguments[1].asNumber();
            return jsi::Value(getObject()->contains(x, y));
        });

        installFunction(
        "dash", JSI_FUNC_SIGNATURE {
            SkScalar on = arguments[0].asNumber();
            SkScalar off = arguments[1].asNumber();
            auto phase = arguments[2].asNumber();
            SkScalar intervals[] = { on, off };
            auto pe = SkDashPathEffect::Make(intervals, 2, phase);
            if (!pe) {
                //TODO: SkDebugf("Invalid args to dash()\n");
                return jsi::Value(false);
            }
            SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
            SkPath& path = *getObject();
            // TODO: why we don't need to swap here? In trim() which is the same API, we need to swap
            if (pe->filterPath(&path, path, &rec, nullptr)) {
                return jsi::Value(true);
            }
            SkDebugf("Could not make dashed path\n");
            return jsi::Value(false);
        });

        installFunction("equals", JSI_FUNC_SIGNATURE {
            auto p1 = JsiSkPath::fromValue(runtime, arguments[0]).get();
            auto p2 = JsiSkPath::fromValue(runtime, arguments[1]).get();
            return jsi::Value(p1 == p2);
        });

        installFunction("getFillType", JSI_FUNC_SIGNATURE {
            auto fillType = getObject()->getFillType();
            return jsi::Value(static_cast<int>(fillType));
        });

        installFunction("setFillType", JSI_FUNC_SIGNATURE {
            auto ft = (SkPathFillType)arguments[0].asNumber();
            getObject()->setFillType(ft);
            return jsi::Value::undefined();
        });

        installFunction("setIsVolatile", JSI_FUNC_SIGNATURE {
            auto v = arguments[0].getBool();
            getObject()->setIsVolatile(v);
            return jsi::Value::undefined();
        });

        installFunction("transform", JSI_FUNC_SIGNATURE {
            auto m3 =  *JsiSkMatrix::fromValue(runtime, arguments[0]);
            getObject()->transform(m3);
            return jsi::Value::undefined();
        });

        installFunction("stroke", JSI_FUNC_SIGNATURE {
            auto path = *getObject();
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
            auto result = p.getFillPath(path, &path, nullptr, precision);
            getObject()->swap(path);
            return jsi::Value(result);
        });

        installFunction("trim", JSI_FUNC_SIGNATURE {
            auto start = arguments[0].asNumber();
            auto end = arguments[1].asNumber();
            auto isComplement = arguments[2].getBool();
            auto path = *getObject();
            auto mode = isComplement ? SkTrimPathEffect::Mode::kInverted : SkTrimPathEffect::Mode::kNormal;
            auto pe = SkTrimPathEffect::Make(start, end, mode);
            if (!pe) {
                //SkDebugf("Invalid args to trim(): startT and stopT must be in [0,1]\n");
                return jsi::Value(false);
            }
            SkStrokeRec rec(SkStrokeRec::InitStyle::kHairline_InitStyle);
            if (pe->filterPath(&path, path, &rec, nullptr)) {
                getObject()->swap(path);
                return jsi::Value(true);
            }
            SkDebugf("Could not trim path\n");
            return jsi::Value(false);
        });

        installFunction("getPoint", JSI_FUNC_SIGNATURE {
            auto index = arguments[0].asNumber();
            auto point = getObject()->getPoint(index);
            return jsi::Object::createFromHostObject(
                    runtime,
                    std::make_shared<JsiSkPoint>(context, point)
            );
        });

        installFunction("toSVGString", JSI_FUNC_SIGNATURE {
            SkPath path = *getObject();
            SkString s;
            SkParsePath::ToSVGString(path, &s);
            return jsi::String::createFromUtf8(runtime, s.c_str());
        });

        installFunction("makeAsWinding", JSI_FUNC_SIGNATURE {
            SkPath out;
            if (AsWinding(*getObject(), &out)) {
                return jsi::Object::createFromHostObject(
                        runtime,
                        std::make_shared<JsiSkPath>(context, out));
            }
            return jsi::Value::null();
        });

        installFunction("isEmpty", JSI_FUNC_SIGNATURE {
            return jsi::Value(getObject()->isEmpty());
        });

        installFunction("isVolatile", JSI_FUNC_SIGNATURE {
            return jsi::Value(getObject()->isVolatile());
        });

        installFunction(
        "offset", JSI_FUNC_SIGNATURE {
            SkScalar dx = arguments[0].asNumber();
            SkScalar dy = arguments[1].asNumber();
            getObject()->offset(dx, dy);
            return jsi::Value::undefined();
        });

        installFunction("moveTo", JSI_FUNC_SIGNATURE {
            SkScalar x = arguments[0].asNumber();
            SkScalar y = arguments[1].asNumber();
            getObject()->moveTo(x, y);
            return jsi::Value::undefined();
        });

        installFunction( "rMoveTo", JSI_FUNC_SIGNATURE {
            SkScalar x = arguments[0].asNumber();
            SkScalar y = arguments[1].asNumber();
            getObject()->rMoveTo(x, y);
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
        "rLineTo", JSI_FUNC_SIGNATURE {
            SkScalar x = arguments[0].asNumber();
            SkScalar y = arguments[1].asNumber();
            getObject()->rLineTo(x, y);
            return jsi::Value::undefined();
        });

        installFunction("cubicTo", JSI_FUNC_SIGNATURE {
            auto x1 = arguments[0].asNumber();
            auto y1 = arguments[1].asNumber();
            auto x2 = arguments[2].asNumber();
            auto y2 = arguments[3].asNumber();
            auto x3 = arguments[4].asNumber();
            auto y3 = arguments[5].asNumber();
            getObject()->cubicTo(x1, y1, x2, y2, x3, y3);
            return jsi::Value::undefined();
        });

        installFunction("rCubicTo", JSI_FUNC_SIGNATURE {
            auto x1 = arguments[0].asNumber();
            auto y1 = arguments[1].asNumber();
            auto x2 = arguments[2].asNumber();
            auto y2 = arguments[3].asNumber();
            auto x3 = arguments[4].asNumber();
            auto y3 = arguments[5].asNumber();
            getObject()->rCubicTo(x1, y1, x2, y2, x3, y3);
            return jsi::Value::undefined();
        });

        installFunction("reset", JSI_FUNC_SIGNATURE {
            getObject()->reset();
            return jsi::Value::undefined();
        });

        installFunction("rewind", JSI_FUNC_SIGNATURE {
            getObject()->rewind();
            return jsi::Value::undefined();
        });

        installFunction("quadTo", JSI_FUNC_SIGNATURE {
            auto x1 = arguments[0].asNumber();
            auto y1 = arguments[1].asNumber();
            auto x2 = arguments[2].asNumber();
            auto y2 = arguments[3].asNumber();
            getObject()->quadTo(x1, y1, x2, y2);
            return jsi::Value::undefined();
        });

        installFunction("rQuadTo", JSI_FUNC_SIGNATURE {
            auto x1 = arguments[0].asNumber();
            auto y1 = arguments[1].asNumber();
            auto x2 = arguments[2].asNumber();
            auto y2 = arguments[3].asNumber();
            getObject()->rQuadTo(x1, y1, x2, y2);
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
            "countPoints", JSI_FUNC_SIGNATURE {
                auto points = getObject()->countPoints();
                return jsi::Value(points);
            });

        installFunction(
        "copy", JSI_FUNC_SIGNATURE {
            auto path = getObject().get();
            return jsi::Object::createFromHostObject(
                    runtime, std::make_shared<JsiSkPath>(context, SkPath(*path)));
        });

        installFunction(
            "fromText", JSI_FUNC_SIGNATURE {
                auto text = arguments[0].asString(runtime).utf8(runtime);
                auto x = arguments[1].asNumber();
                auto y = arguments[2].asNumber();
                auto font = JsiSkFont::fromValue(runtime, arguments[3]);
                SkPath result;
                SkTextUtils::GetPath(
                    text.c_str(),
                    strlen(text.c_str()),
                    SkTextEncoding::kUTF8,
                    x,
                    y,
                    *font,
                    &result);

                getObject()->swap(result);
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
