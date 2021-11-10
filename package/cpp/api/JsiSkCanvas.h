#pragma once

#include "JsiSkCanvas.h"
#include "JsiSkFont.h"
#include "JsiSkHostObjects.h"
#include "JsiSkImage.h"
#include "JsiSkPaint.h"
#include "JsiSkPath.h"
#include "JsiSkSvg.h"
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
        "drawPaint", JSI_FUNC_SIGNATURE {
          auto paint = JsiSkPaint::fromValue(runtime, arguments[0]);
          _canvas->drawPaint(*paint);
          return jsi::Value::undefined();
        });

    installFunction(
        "drawPoint", JSI_FUNC_SIGNATURE {
          SkScalar x = arguments[0].asNumber();
          SkScalar y = arguments[1].asNumber();

          auto paint = JsiSkPaint::fromValue(runtime, arguments[2]);
          _canvas->drawPoint(x, y, *paint);

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
          auto rect = JsiSkRect::fromValue(runtime, arguments[1]);
          std::shared_ptr<SkPaint> paint;
          if (count == 3) {
            paint = JsiSkPaint::fromValue(runtime, arguments[2]);
          }
          _canvas->drawImageRect(image, *rect, SkSamplingOptions(),
                                 paint.get());
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
        "drawRoundRect", JSI_FUNC_SIGNATURE {
          auto rect = JsiSkRect::fromValue(runtime, arguments[0]);

          SkScalar cx = arguments[1].asNumber();
          SkScalar cy = arguments[2].asNumber();

          auto paint = JsiSkPaint::fromValue(runtime, arguments[3]);
          _canvas->drawRoundRect(*rect, cx, cy, *paint);

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
          auto doAntiAlias = arguments[1].getBool();
          _canvas->clipPath(*path, doAntiAlias);
          return jsi::Value::undefined();
        });

    installFunction(
        "save", JSI_FUNC_SIGNATURE { return jsi::Value(_canvas->save()); });

    installFunction(
        "saveLayer", JSI_FUNC_SIGNATURE {
          auto rect = JsiSkRect::fromValue(runtime, arguments[0]);
          auto paint = JsiSkPaint::fromValue(runtime, arguments[1]);
          return jsi::Value(_canvas->saveLayer(rect.get(), paint.get()));
        });

    installFunction(
        "restore", JSI_FUNC_SIGNATURE {
          _canvas->restore();
          return jsi::Value::undefined();
        });

    installFunction(
        "rotate", JSI_FUNC_SIGNATURE {
          SkScalar degrees = arguments[0].asNumber();
          _canvas->rotate(degrees);
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
          _canvas->drawColor(cl);
          return jsi::Value::undefined();
        });
  }

  void setCanvas(SkCanvas *canvas) { _canvas = canvas; }

  SkCanvas *getCanvas() { return _canvas; }

private:
  SkCanvas *_canvas;
};
} // namespace RNSkia
