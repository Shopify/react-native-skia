#pragma once

#include "JsiSkCanvas.h"
#include "JsiSkFont.h"
#include "JsiSkHostObjects.h"
#include "JsiSkImage.h"
#include "JsiSkMatrix.h"
#include "JsiSkPaint.h"
#include "JsiSkPath.h"
#include "JsiSkPoint.h"
#include "JsiSkRRect.h"
#include "JsiSkSvg.h"
#include "JsiSkTypes.h"

#include <jsi/jsi.h>
#include <map>

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include <SkCanvas.h>
#include <SkFont.h>
#include <SkPaint.h>
#include <SkPath.h>
#include <SkRegion.h>
#include <SkSurface.h>
#include <SkTypeface.h>

#pragma clang diagnostic pop

namespace RNSkia {
using namespace facebook;

class JsiSkCanvas : public JsiSkHostObject {
public:
  JsiSkCanvas(RNSkPlatformContext *context) : JsiSkHostObject(context) {
    installFunction(
        "drawPaint", JSI_FUNC_SIGNATURE {
          auto paint = JsiSkPaint::fromValue(runtime, arguments[0]);
          _canvas->drawPaint(*paint);
          return jsi::Value::undefined();
        });

    installFunction(
        "drawLine", JSI_FUNC_SIGNATURE {
          SkScalar x1 = arguments[0].asNumber();
          SkScalar y1 = arguments[1].asNumber();
          SkScalar x2 = arguments[2].asNumber();
          SkScalar y2 = arguments[3].asNumber();

          auto paint = JsiSkPaint::fromValue(runtime, arguments[4]);
          _canvas->drawLine(x1, y1, x2, y2, *paint);

          return jsi::Value::undefined();
        });

    installFunction(
        "drawRect", JSI_FUNC_SIGNATURE {
          auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
          auto paint = JsiSkPaint::fromValue(runtime, arguments[1]);
          _canvas->drawRect(*rect, *paint);
          return jsi::Value::undefined();
        });

    installFunction(
        "drawImage", JSI_FUNC_SIGNATURE {
          auto image = JsiSkImage::fromValue(runtime, arguments[0]);
          auto x = arguments[1].asNumber();
          auto y = arguments[2].asNumber();
          std::shared_ptr<SkPaint> paint;
          if (count == 4) {
            paint = JsiSkPaint::fromValue(runtime, arguments[3]);
          }
          _canvas->drawImage(image, x, y, SkSamplingOptions(), paint.get());
          return jsi::Value::undefined();
        });

    installFunction(
    "drawImageRect", JSI_FUNC_SIGNATURE {
      auto image = JsiSkImage::fromValue(runtime, arguments[0]);
      auto src = JsiSkRect::fromValue(runtime, arguments[1]);
      auto dest = JsiSkRect::fromValue(runtime, arguments[2]);
      auto paint = JsiSkPaint::fromValue(runtime, arguments[3]);
      auto fastSample = arguments[4].getBool();
      _canvas->drawImageRect(image, *src, *dest, SkSamplingOptions(),
                             paint.get(), fastSample ? SkCanvas::kFast_SrcRectConstraint:
                                          SkCanvas::kStrict_SrcRectConstraint);
      return jsi::Value::undefined();
    });

      installFunction(
      "drawImageCubic", JSI_FUNC_SIGNATURE {
          auto image = JsiSkImage::fromValue(runtime, arguments[0]);
          auto x = arguments[1].asNumber();
          auto y = arguments[2].asNumber();
          float B = arguments[3].asNumber();
          float C = arguments[4].asNumber();
          std::shared_ptr<SkPaint> paint;
          if (count == 6) {
              if (!arguments[5].isNull()) {
                  paint = JsiSkPaint::fromValue(runtime, arguments[5]);
              }
          }
          _canvas->drawImage(image, x, y, SkSamplingOptions({ B, C }), paint.get());
          return jsi::Value::undefined();
      });

      installFunction(
      "drawImageOptions", JSI_FUNC_SIGNATURE {
          auto image = JsiSkImage::fromValue(runtime, arguments[0]);
          auto x = arguments[1].asNumber();
          auto y = arguments[2].asNumber();
          auto fm = (SkFilterMode)arguments[3].asNumber();
          auto mm = (SkMipmapMode)arguments[4].asNumber();
          std::shared_ptr<SkPaint> paint;
          if (count == 6) {
              if (!arguments[5].isNull()) {
                  paint = JsiSkPaint::fromValue(runtime, arguments[5]);
              }
          }
          _canvas->drawImage(image, x, y, SkSamplingOptions(fm, mm), paint.get());
          return jsi::Value::undefined();
      });

      installFunction(
      "drawImageNine", JSI_FUNC_SIGNATURE {
          auto image = JsiSkImage::fromValue(runtime, arguments[0]);
          auto center = JsiSkRect::fromValue(runtime, arguments[1]);
          auto dest = JsiSkRect::fromValue(runtime, arguments[2]);
          auto fm = (SkFilterMode)arguments[3].asNumber();
          std::shared_ptr<SkPaint> paint;
          if (count == 5) {
              if (!arguments[4].isNull()) {
                  paint = JsiSkPaint::fromValue(runtime, arguments[4]);
              }
          }
          _canvas->drawImageNine(image.get(), center->round(), *dest, fm, paint.get());
          return jsi::Value::undefined();
      });

      installFunction(
      "drawImageRectCubic", JSI_FUNC_SIGNATURE {
          auto image = JsiSkImage::fromValue(runtime, arguments[0]);
          auto src = JsiSkRect::fromValue(runtime, arguments[1]);
          auto dest = JsiSkRect::fromValue(runtime, arguments[2]);
          float B = arguments[3].asNumber();
          float C = arguments[4].asNumber();
          std::shared_ptr<SkPaint> paint;
          if (count == 6) {
              if (!arguments[5].isNull()) {
                  paint = JsiSkPaint::fromValue(runtime, arguments[5]);
              }
          }
          auto constraint = SkCanvas::kStrict_SrcRectConstraint;  // TODO: get from caller
          _canvas->drawImageRect(image.get(), *src, *dest, SkSamplingOptions({ B, C }), paint.get(), constraint);
          return jsi::Value::undefined();
      });

      installFunction(
      "drawImageRectOptions", JSI_FUNC_SIGNATURE {
          auto image = JsiSkImage::fromValue(runtime, arguments[0]);
          auto src = JsiSkRect::fromValue(runtime, arguments[1]);
          auto dest = JsiSkRect::fromValue(runtime, arguments[2]);
          auto filter = (SkFilterMode)arguments[3].asNumber();
          auto mipmap = (SkMipmapMode)arguments[4].asNumber();
          std::shared_ptr<SkPaint> paint;
          if (count == 6) {
              if (!arguments[5].isNull()) {
                  paint = JsiSkPaint::fromValue(runtime, arguments[5]);
              }
          }
          auto constraint = SkCanvas::kStrict_SrcRectConstraint;
          _canvas->drawImageRect(image.get(), *src, *dest, {filter, mipmap}, paint.get(), constraint);
          return jsi::Value::undefined();
      });

    installFunction(
        "drawCircle", JSI_FUNC_SIGNATURE {
          SkScalar cx = arguments[0].asNumber();
          SkScalar cy = arguments[1].asNumber();
          SkScalar radius = arguments[2].asNumber();

          auto paint = JsiSkPaint::fromValue(runtime, arguments[3]);
          _canvas->drawCircle(cx, cy, radius, *paint);

          return jsi::Value::undefined();
        });

    installFunction(
        "drawArc", JSI_FUNC_SIGNATURE {
          auto oval = JsiSkRect::fromValue(runtime, arguments[0]);

          SkScalar startAngle = arguments[1].asNumber();
          SkScalar sweepAngle = arguments[2].asNumber();
          bool useCenter = arguments[3].getBool();

          auto paint = JsiSkPaint::fromValue(runtime, arguments[4]);
          _canvas->drawArc(*oval, startAngle, sweepAngle, useCenter, *paint);

          return jsi::Value::undefined();
        });

    installFunction(
        "drawRRect", JSI_FUNC_SIGNATURE {
          auto rect = JsiSkRRect::fromValue(runtime, arguments[0]);
          auto paint = JsiSkPaint::fromValue(runtime, arguments[1]);

          _canvas->drawRRect(*rect, *paint);

          return jsi::Value::undefined();
        });

    installFunction(
        "drawDRRect", JSI_FUNC_SIGNATURE {
          auto outer = JsiSkRRect::fromValue(runtime, arguments[0]);
          auto inner = JsiSkRRect::fromValue(runtime, arguments[1]);
          auto paint = JsiSkPaint::fromValue(runtime, arguments[2]);

          _canvas->drawDRRect(*outer, *inner, *paint);

          return jsi::Value::undefined();
        });

    installFunction(
        "drawOval", JSI_FUNC_SIGNATURE {
          auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
          auto paint = JsiSkPaint::fromValue(runtime, arguments[1]);

          _canvas->drawOval(*rect, *paint);

          return jsi::Value::undefined();
        });

    installFunction(
        "drawOval", JSI_FUNC_SIGNATURE {
          auto c = arguments[0].asNumber();
          _canvas->restoreToCount(c);
          return jsi::Value::undefined();
        });

    installFunction(
        "getSaveCount", JSI_FUNC_SIGNATURE {
          return jsi::Value(getJsNumber(_canvas->getSaveCount()));
        });

    installFunction(
        "drawPoints", JSI_FUNC_SIGNATURE {
          auto pointMode = arguments[0].asNumber();

          std::vector<SkPoint> points;
          auto jsiPoints = arguments[1].asObject(runtime).asArray(runtime);
          auto pointsSize = jsiPoints.size(runtime);
          for (int i = 0; i < pointsSize; i++) {
            std::shared_ptr<SkPoint> point = JsiSkPoint::fromValue(
                runtime,
                jsiPoints.getValueAtIndex(runtime, i).asObject(runtime));
            points.push_back(*point.get());
          }

          auto paint = JsiSkPaint::fromValue(runtime, arguments[2]);

          _canvas->drawPoints((SkCanvas::PointMode)pointMode, pointsSize,
                              points.data(), *paint);

          return jsi::Value::undefined();
        });

    installFunction(
        "drawPatch", JSI_FUNC_SIGNATURE {
          std::vector<SkPoint> cubics;
          std::vector<SkColor> colors;
          std::vector<SkPoint> texs;

          auto jsiCubics = arguments[0].asObject(runtime).asArray(runtime);
          auto cubicsSize = jsiCubics.size(runtime);
          for (int i = 0; i < cubicsSize; i++) {
            std::shared_ptr<SkPoint> point = JsiSkPoint::fromValue(
                runtime,
                jsiCubics.getValueAtIndex(runtime, i).asObject(runtime));
            cubics.push_back(*point.get());
          }

          if (!arguments[1].isNull()) {
            auto jsiColors = arguments[1].asObject(runtime).asArray(runtime);
            auto colorsSize = jsiColors.size(runtime);
            for (int i = 0; i < colorsSize; i++) {
              SkColor color = jsiColors.getValueAtIndex(runtime, i).asNumber();
              colors.push_back(color);
            }
          }

          if (!arguments[2].isNull()) {
            auto jsiTexs = arguments[2].asObject(runtime).asArray(runtime);
            auto texsSize = jsiCubics.size(runtime);
            for (int i = 0; i < texsSize; i++) {
              auto point = JsiSkPoint::fromValue(
                  runtime,
                  jsiTexs.getValueAtIndex(runtime, i).asObject(runtime));
              texs.push_back(*point.get());
            }
          }

          auto &jsiBlendMode = arguments[3];

          auto paint = JsiSkPaint::fromValue(runtime, arguments[4]);

          if (jsiBlendMode.isNull()) {
            _canvas->drawPatch(cubics.data(), colors.data(), texs.data(),
                               *paint);
          } else {
            auto blendMode = (SkBlendMode)jsiBlendMode.asNumber();
            _canvas->drawPatch(cubics.data(), colors.data(), texs.data(),
                               blendMode, *paint);
          }
          return jsi::Value::undefined();
        });

    installFunction(
        "drawPath", JSI_FUNC_SIGNATURE {
          auto path = JsiSkPath::fromValue(runtime, arguments[0]);
          auto paint = JsiSkPaint::fromValue(runtime, arguments[1]);

          _canvas->drawPath(*path, *paint);

          return jsi::Value::undefined();
        });

    installFunction(
        "drawText", JSI_FUNC_SIGNATURE {
          auto textVal = arguments[0].asString(runtime).utf8(runtime);
          auto text = textVal.c_str();
          SkScalar x = arguments[1].asNumber();
          SkScalar y = arguments[2].asNumber();

          auto font = JsiSkFont::fromValue(runtime, arguments[3]);
          auto paint = JsiSkPaint::fromValue(runtime, arguments[4]);

          _canvas->drawSimpleText(text, strlen(text), SkTextEncoding::kUTF8, x,
                                  y, *font, *paint);

          return jsi::Value::undefined();
        });

    installFunction(
        "drawSvg", JSI_FUNC_SIGNATURE {
          auto svgdom = JsiSkSvg::fromValue(runtime, arguments[0]);
          if (count == 3) {
            // read size
            auto w = arguments[1].asNumber();
            auto h = arguments[2].asNumber();
            svgdom->setContainerSize(SkSize::Make(w, h));
          } else {
            auto canvasSize = _canvas->getBaseLayerSize();
            svgdom->setContainerSize(SkSize::Make(canvasSize));
          }
          svgdom->render(_canvas);
          return jsi::Value::undefined();
        });

    installFunction(
        "clipPath", JSI_FUNC_SIGNATURE {
          auto path = JsiSkPath::fromValue(runtime, arguments[0]);
          auto op = (SkClipOp)arguments[1].asNumber();
          auto doAntiAlias = arguments[2].getBool();
          _canvas->clipPath(*path, op, doAntiAlias);
          return jsi::Value::undefined();
        });

    installFunction(
        "clipRect", JSI_FUNC_SIGNATURE {
          auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
          auto op = (SkClipOp)arguments[1].asNumber();
          auto doAntiAlias = arguments[2].getBool();
          _canvas->clipRect(*rect, op, doAntiAlias);
          return jsi::Value::undefined();
        });

    installFunction(
        "clipRRect", JSI_FUNC_SIGNATURE {
          auto rrect = JsiSkRRect::fromValue(runtime, arguments[0]);
          auto op = (SkClipOp)arguments[1].asNumber();
          auto doAntiAlias = arguments[2].getBool();
          _canvas->clipRRect(*rrect, op, doAntiAlias);
          return jsi::Value::undefined();
        });

    installFunction(
        "save", JSI_FUNC_SIGNATURE { return jsi::Value(_canvas->save()); });

    installFunction(
        "saveLayerPaint", JSI_FUNC_SIGNATURE {
          auto paint = JsiSkPaint::fromValue(runtime, arguments[0]);
          return jsi::Value(_canvas->saveLayer(nullptr, paint.get()));
        });

    installFunction(
        "saveLayer", JSI_FUNC_SIGNATURE {
          SkPaint *paint =
              arguments[0].isUndefined()
                  ? nullptr
                  : JsiSkPaint::fromValue(runtime, arguments[0]).get();
          SkRect *bounds =
              arguments[1].isNull() || arguments[1].isUndefined()
                  ? nullptr
                  : JsiSkRect::fromValue(runtime, arguments[1]).get();
          SkImageFilter *backdrop =
              arguments[2].isNull() || count < 3
                  ? nullptr
                  : JsiSkImageFilter::fromValue(runtime, arguments[2]).get();
          SkCanvas::SaveLayerFlags flags =
              count < 4 ? 0 : arguments[3].asNumber();
          return jsi::Value(_canvas->saveLayer(
              SkCanvas::SaveLayerRec(bounds, paint, backdrop, flags)));
        });

    installFunction(
        "restore", JSI_FUNC_SIGNATURE {
          _canvas->restore();
          return jsi::Value::undefined();
        });

    installFunction(
        "rotate", JSI_FUNC_SIGNATURE {
          SkScalar degrees = arguments[0].asNumber();
          SkScalar rx = arguments[1].asNumber();
          SkScalar ry = arguments[2].asNumber();
          _canvas->rotate(degrees, rx, ry);
          return jsi::Value::undefined();
        });

    installFunction(
        "translate", JSI_FUNC_SIGNATURE {
          SkScalar dx = arguments[0].asNumber();
          SkScalar dy = arguments[1].asNumber();
          _canvas->translate(dx, dy);
          return jsi::Value::undefined();
        });

    installFunction(
        "scale", JSI_FUNC_SIGNATURE {
          SkScalar sx = arguments[0].asNumber();
          SkScalar sy = arguments[1].asNumber();
          _canvas->scale(sx, sy);
          return jsi::Value::undefined();
        });

    installFunction(
        "skew", JSI_FUNC_SIGNATURE {
          SkScalar sx = arguments[0].asNumber();
          SkScalar sy = arguments[1].asNumber();
          _canvas->skew(sx, sy);
          return jsi::Value::undefined();
        });

    installFunction(
        "drawColor", JSI_FUNC_SIGNATURE {
          SkColor cl = arguments[0].asNumber();
          if (count == 1) {
            _canvas->drawColor(cl);
          } else {
            auto mode = (SkBlendMode)arguments[1].asNumber();
            _canvas->drawColor(cl, mode);
          }
          return jsi::Value::undefined();
        });

    installFunction(
        "clear", JSI_FUNC_SIGNATURE {
          SkColor cl = arguments[0].asNumber();
          _canvas->clear(cl);
          return jsi::Value::undefined();
        });

    installFunction(
        "concat", JSI_FUNC_SIGNATURE {
          auto matrix = JsiSkMatrix::fromValue(runtime, arguments[0]);
          _canvas->concat(*matrix.get());
          return jsi::Value::undefined();
        });
  }

  void setCanvas(SkCanvas *canvas) { _canvas = canvas; }

  SkCanvas *getCanvas() { return _canvas; }

private:
  SkCanvas *_canvas;
};
} // namespace RNSkia
