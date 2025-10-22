#pragma once

#include <memory>
#include <utility>
#include <vector>

#include "JsiSkFont.h"
#include "JsiSkHostObjects.h"
#include "JsiSkImage.h"
#include "JsiSkImageInfo.h"
#include "JsiSkMatrix.h"
#include "JsiSkPaint.h"
#include "JsiSkPath.h"
#include "JsiSkPicture.h"
#include "JsiSkPoint.h"
#include "JsiSkRRect.h"
#include "JsiSkRSXform.h"
#include "JsiSkSVG.h"
#include "JsiSkTextBlob.h"
#include "JsiSkVertices.h"
#include "JsiSkColor.h"
#include "JsiSkImageFilter.h"

#include "RNSkTypedArray.h"

#include <jsi/jsi.h>

#include "JsiArgParser.h"
#include "JsiArgParserTypes.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdocumentation"

#include "include/core/SkCanvas.h"
#include "include/core/SkFont.h"
#include "include/core/SkPaint.h"
#include "include/core/SkPath.h"
#include "include/core/SkPicture.h"
#include "include/core/SkRegion.h"
#include "include/core/SkSurface.h"
#include "include/core/SkTypeface.h"

#if !defined(SK_GRAPHITE)
#include "include/gpu/ganesh/GrDirectContext.h"
#endif

#pragma clang diagnostic pop

// ArgParser specializations for types used in JsiSkCanvas
// Must be outside namespace RNSkia since the macros define the namespace
JSI_ARG_PARSER_SK_SP(SkImage, JsiSkImage)
JSI_ARG_PARSER_SHARED_PTR(SkPaint, JsiSkPaint)
JSI_ARG_PARSER_SHARED_PTR(SkRect, JsiSkRect)
JSI_ARG_PARSER_SHARED_PTR(SkRRect, JsiSkRRect)
JSI_ARG_PARSER_SHARED_PTR(SkPath, JsiSkPath)
JSI_ARG_PARSER_SHARED_PTR(SkPoint, JsiSkPoint)
JSI_ARG_PARSER_SK_SP(SkPicture, JsiSkPicture)
JSI_ARG_PARSER_SK_SP(SkTextBlob, JsiSkTextBlob)
JSI_ARG_PARSER_SK_SP(SkVertices, JsiSkVertices)
JSI_ARG_PARSER_SHARED_PTR(SkFont, JsiSkFont)
JSI_ARG_PARSER_SK_SP(SkSVGDOM, JsiSkSVG)
JSI_ARG_PARSER_SHARED_PTR(SkMatrix, JsiSkMatrix)
JSI_ARG_PARSER_SK_SP(SkImageFilter, JsiSkImageFilter)

namespace RNSkia {

namespace jsi = facebook::jsi;

class JsiSkCanvas : public JsiSkHostObject {
public:
  JSI_HOST_FUNCTION(drawPaint) {
    ArgParser parser(runtime, arguments, count);
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawPaint(*paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawLine) {
    ArgParser parser(runtime, arguments, count);
    auto x1 = parser.next<float>();
    auto y1 = parser.next<float>();
    auto x2 = parser.next<float>();
    auto y2 = parser.next<float>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawLine(x1, y1, x2, y2, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawRect) {
    ArgParser parser(runtime, arguments, count);
    auto rect = parser.next<std::shared_ptr<SkRect>>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawRect(*rect, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawImage) {
    ArgParser parser(runtime, arguments, count);
    auto image = parser.next<sk_sp<SkImage>>();
    auto x = parser.next<float>();
    auto y = parser.next<float>();
    auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
    _canvas->drawImage(image, x, y, SkSamplingOptions(),
                       paint.has_value() ? paint.value().get() : nullptr);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawImageRect) {
    ArgParser parser(runtime, arguments, count);
    auto image = parser.next<sk_sp<SkImage>>();
    auto src = parser.next<std::shared_ptr<SkRect>>();
    auto dest = parser.next<std::shared_ptr<SkRect>>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    auto fastSample = parser.next<std::optional<bool>>();
    _canvas->drawImageRect(image, *src, *dest, SkSamplingOptions(), paint.get(),
                           fastSample.value_or(false) ? SkCanvas::kFast_SrcRectConstraint
                                                      : SkCanvas::kStrict_SrcRectConstraint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawImageCubic) {
    ArgParser parser(runtime, arguments, count);
    auto image = parser.next<sk_sp<SkImage>>();
    auto x = parser.next<float>();
    auto y = parser.next<float>();
    auto B = parser.next<float>();
    auto C = parser.next<float>();
    auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
    _canvas->drawImage(image, x, y, SkSamplingOptions({B, C}),
                       paint.has_value() ? paint.value().get() : nullptr);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawImageOptions) {
    ArgParser parser(runtime, arguments, count);
    auto image = parser.next<sk_sp<SkImage>>();
    auto x = parser.next<float>();
    auto y = parser.next<float>();
    auto fm = parser.next<SkFilterMode>();
    auto mm = parser.next<SkMipmapMode>();
    auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
    _canvas->drawImage(image, x, y, SkSamplingOptions(fm, mm),
                       paint.has_value() ? paint.value().get() : nullptr);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawImageNine) {
    ArgParser parser(runtime, arguments, count);
    auto image = parser.next<sk_sp<SkImage>>();
    auto center = parser.next<std::shared_ptr<SkRect>>();
    auto dest = parser.next<std::shared_ptr<SkRect>>();
    auto fm = parser.next<SkFilterMode>();
    auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
    _canvas->drawImageNine(image.get(), center->round(), *dest, fm,
                           paint.has_value() ? paint.value().get() : nullptr);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawImageRectCubic) {
    ArgParser parser(runtime, arguments, count);
    auto image = parser.next<sk_sp<SkImage>>();
    auto src = parser.next<std::shared_ptr<SkRect>>();
    auto dest = parser.next<std::shared_ptr<SkRect>>();
    auto B = parser.next<float>();
    auto C = parser.next<float>();
    auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
    auto constraint =
        SkCanvas::kStrict_SrcRectConstraint; // TODO: get from caller
    _canvas->drawImageRect(image.get(), *src, *dest, SkSamplingOptions({B, C}),
                           paint.has_value() ? paint.value().get() : nullptr, constraint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawImageRectOptions) {
    ArgParser parser(runtime, arguments, count);
    auto image = parser.next<sk_sp<SkImage>>();
    auto src = parser.next<std::shared_ptr<SkRect>>();
    auto dest = parser.next<std::shared_ptr<SkRect>>();
    auto filter = parser.next<SkFilterMode>();
    auto mipmap = parser.next<SkMipmapMode>();
    auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
    auto constraint = SkCanvas::kStrict_SrcRectConstraint;
    _canvas->drawImageRect(image.get(), *src, *dest, {filter, mipmap},
                           paint.has_value() ? paint.value().get() : nullptr, constraint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawCircle) {
    ArgParser parser(runtime, arguments, count);
    auto cx = parser.next<float>();
    auto cy = parser.next<float>();
    auto radius = parser.next<float>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawCircle(cx, cy, radius, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawArc) {
    ArgParser parser(runtime, arguments, count);
    auto oval = parser.next<std::shared_ptr<SkRect>>();
    auto startAngle = parser.next<float>();
    auto sweepAngle = parser.next<float>();
    auto useCenter = parser.next<bool>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawArc(*oval, startAngle, sweepAngle, useCenter, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawRRect) {
    ArgParser parser(runtime, arguments, count);
    auto rect = parser.next<std::shared_ptr<SkRRect>>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawRRect(*rect, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawDRRect) {
    ArgParser parser(runtime, arguments, count);
    auto outer = parser.next<std::shared_ptr<SkRRect>>();
    auto inner = parser.next<std::shared_ptr<SkRRect>>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawDRRect(*outer, *inner, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawOval) {
    ArgParser parser(runtime, arguments, count);
    auto rect = parser.next<std::shared_ptr<SkRect>>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawOval(*rect, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(restoreToCount) {
    ArgParser parser(runtime, arguments, count);
    auto c = parser.next<int>();
    _canvas->restoreToCount(c);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(getSaveCount) {
    return static_cast<int>(_canvas->getSaveCount());
  }

  JSI_HOST_FUNCTION(getTotalMatrix) {
    auto matrix = std::make_shared<JsiSkMatrix>(getContext(), _canvas->getTotalMatrix());
    return JSI_CREATE_HOST_OBJECT_WITH_MEMORY_PRESSURE(runtime, matrix, getContext());
  }

  JSI_HOST_FUNCTION(drawPoints) {
    ArgParser parser(runtime, arguments, count);
    auto pointMode = parser.next<SkCanvas::PointMode>();
    auto jsiPoints = parser.next<jsi::Array>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();

    auto pointsSize = jsiPoints.size(runtime);
    if (pointsSize == 0) {
      throw std::invalid_argument("Points array must not be empty");
    }

    std::vector<SkPoint> points;
    points.reserve(pointsSize);
    for (int i = 0; i < pointsSize; i++) {
      std::shared_ptr<SkPoint> point = JsiSkPoint::fromValue(
          runtime, jsiPoints.getValueAtIndex(runtime, i).asObject(runtime));
      points.push_back(*point.get());
    }

    auto p = SkSpan(points.data(), points.size());
    _canvas->drawPoints(pointMode, p, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawVertices) {
    ArgParser parser(runtime, arguments, count);
    auto vertices = parser.next<sk_sp<SkVertices>>();
    auto blendMode = parser.next<SkBlendMode>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawVertices(vertices, blendMode, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawPatch) {
    ArgParser parser(runtime, arguments, count);
    auto jsiCubics = parser.next<jsi::Array>();
    auto jsiColors = parser.next<std::optional<jsi::Array>>();
    auto jsiTexs = parser.next<std::optional<jsi::Array>>();
    auto blendMode = parser.next<SkBlendMode>();
    auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();

    // Parse cubics
    auto cubicsSize = jsiCubics.size(runtime);
    if (cubicsSize != 12) {
      throw std::invalid_argument(
          "Cubic points array must contain exactly 12 points");
    }

    std::vector<SkPoint> cubics;
    cubics.reserve(cubicsSize);
    for (int i = 0; i < cubicsSize; i++) {
      std::shared_ptr<SkPoint> point = JsiSkPoint::fromValue(
          runtime, jsiCubics.getValueAtIndex(runtime, i).asObject(runtime));
      cubics.push_back(*point.get());
    }

    // Parse colors (optional)
    std::vector<SkColor> colors;
    if (jsiColors.has_value()) {
      auto colorsSize = jsiColors.value().size(runtime);
      if (colorsSize != 4) {
        throw std::invalid_argument(
            "Colors array must contain exactly 4 colors");
      }

      colors.reserve(colorsSize);
      for (int i = 0; i < colorsSize; i++) {
        SkColor color = JsiSkColor::fromValue(
            runtime, jsiColors.value().getValueAtIndex(runtime, i));
        colors.push_back(color);
      }
    }

    // Parse texture coordinates (optional)
    std::vector<SkPoint> texs;
    if (jsiTexs.has_value()) {
      auto texsSize = jsiTexs.value().size(runtime);
      if (texsSize != 4) {
        throw std::invalid_argument(
            "Texture coordinates array must contain exactly 4 points");
      }

      texs.reserve(texsSize);
      for (int i = 0; i < texsSize; i++) {
        auto point = JsiSkPoint::fromValue(
            runtime, jsiTexs.value().getValueAtIndex(runtime, i).asObject(runtime));
        texs.push_back(*point.get());
      }
    }

    if (paint.has_value()) {
      _canvas->drawPatch(cubics.data(), colors.empty() ? nullptr : colors.data(),
                         texs.empty() ? nullptr : texs.data(), blendMode,
                         *paint.value());
    } else {
      SkPaint defaultPaint;
      _canvas->drawPatch(cubics.data(), colors.empty() ? nullptr : colors.data(),
                         texs.empty() ? nullptr : texs.data(), blendMode,
                         defaultPaint);
    }
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawPath) {
    ArgParser parser(runtime, arguments, count);
    auto path = parser.next<std::shared_ptr<SkPath>>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawPath(*path, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawText) {
    ArgParser parser(runtime, arguments, count);
    auto textVal = parser.next<std::string>();
    auto x = parser.next<SkScalar>();
    auto y = parser.next<SkScalar>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    auto font = parser.next<std::shared_ptr<SkFont>>();
    _canvas->drawSimpleText(textVal.c_str(), textVal.length(), SkTextEncoding::kUTF8, x, y,
                            *font, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawTextBlob) {
    ArgParser parser(runtime, arguments, count);
    auto blob = parser.next<sk_sp<SkTextBlob>>();
    auto x = parser.next<SkScalar>();
    auto y = parser.next<SkScalar>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    _canvas->drawTextBlob(blob, x, y, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawGlyphs) {
    ArgParser parser(runtime, arguments, count);
    auto jsiGlyphs = parser.next<jsi::Array>();
    auto jsiPositions = parser.next<jsi::Array>();
    auto x = parser.next<SkScalar>();
    auto y = parser.next<SkScalar>();
    auto font = parser.next<std::shared_ptr<SkFont>>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();

    SkPoint origin = SkPoint::Make(x, y);

    int glyphsSize = static_cast<int>(jsiGlyphs.size(runtime));
    int pointsSize = static_cast<int>(jsiPositions.size(runtime));

    if (glyphsSize != pointsSize) {
      throw std::invalid_argument(
          "Glyphs and positions arrays must have the same length");
    }

    std::vector<SkGlyphID> glyphs;
    glyphs.reserve(glyphsSize);
    for (int i = 0; i < glyphsSize; i++) {
      glyphs.push_back(jsiGlyphs.getValueAtIndex(runtime, i).asNumber());
    }

    std::vector<SkPoint> positions;
    positions.reserve(pointsSize);
    for (int i = 0; i < pointsSize; i++) {
      std::shared_ptr<SkPoint> point = JsiSkPoint::fromValue(
          runtime, jsiPositions.getValueAtIndex(runtime, i).asObject(runtime));
      positions.push_back(*point.get());
    }

    auto g = SkSpan(glyphs.data(), glyphs.size());
    auto p = SkSpan(positions.data(), positions.size());
    _canvas->drawGlyphs(g, p, origin, *font, *paint);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawSvg) {
    ArgParser parser(runtime, arguments, count);
    auto svgdom = parser.next<sk_sp<SkSVGDOM>>();
    auto w = parser.next<std::optional<SkScalar>>();
    auto h = parser.next<std::optional<SkScalar>>();

    if (w.has_value() && h.has_value()) {
      svgdom->setContainerSize(SkSize::Make(w.value(), h.value()));
    } else {
      auto canvasSize = _canvas->getBaseLayerSize();
      svgdom->setContainerSize(SkSize::Make(canvasSize));
    }
    svgdom->render(_canvas);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(clipPath) {
    ArgParser parser(runtime, arguments, count);
    auto path = parser.next<std::shared_ptr<SkPath>>();
    auto op = parser.next<SkClipOp>();
    auto doAntiAlias = parser.next<bool>();
    _canvas->clipPath(*path, op, doAntiAlias);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(clipRect) {
    ArgParser parser(runtime, arguments, count);
    auto rect = parser.next<std::shared_ptr<SkRect>>();
    auto op = parser.next<SkClipOp>();
    auto doAntiAlias = parser.next<bool>();
    _canvas->clipRect(*rect, op, doAntiAlias);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(clipRRect) {
    ArgParser parser(runtime, arguments, count);
    auto rrect = parser.next<std::shared_ptr<SkRRect>>();
    auto op = parser.next<SkClipOp>();
    auto doAntiAlias = parser.next<bool>();
    _canvas->clipRRect(*rrect, op, doAntiAlias);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(save) { return jsi::Value(_canvas->save()); }

  JSI_HOST_FUNCTION(saveLayer) {
    ArgParser parser(runtime, arguments, count);
    auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
    auto bounds = parser.next<std::optional<std::shared_ptr<SkRect>>>();
    auto backdrop = parser.next<std::optional<sk_sp<SkImageFilter>>>();
    auto flags = parser.next<std::optional<SkCanvas::SaveLayerFlags>>();
    return jsi::Value(_canvas->saveLayer(
        SkCanvas::SaveLayerRec(bounds.has_value() ? bounds.value().get() : nullptr,
                              paint.has_value() ? paint.value().get() : nullptr,
                              backdrop.has_value() ? backdrop.value().get() : nullptr,
                              flags.value_or(0))));
  }

  JSI_HOST_FUNCTION(restore) {
    _canvas->restore();
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(rotate) {
    ArgParser parser(runtime, arguments, count);
    auto degrees = parser.next<SkScalar>();
    auto rx = parser.next<SkScalar>();
    auto ry = parser.next<SkScalar>();
    _canvas->rotate(degrees, rx, ry);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(translate) {
    ArgParser parser(runtime, arguments, count);
    auto dx = parser.next<SkScalar>();
    auto dy = parser.next<SkScalar>();
    _canvas->translate(dx, dy);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(scale) {
    ArgParser parser(runtime, arguments, count);
    auto sx = parser.next<SkScalar>();
    auto sy = parser.next<SkScalar>();
    _canvas->scale(sx, sy);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(skew) {
    ArgParser parser(runtime, arguments, count);
    auto sx = parser.next<SkScalar>();
    auto sy = parser.next<SkScalar>();
    _canvas->skew(sx, sy);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawColor) {
    ArgParser parser(runtime, arguments, count);
    auto cl = parser.next<SkColor>();
    auto mode = parser.next<std::optional<SkBlendMode>>();
    if (mode.has_value()) {
      _canvas->drawColor(cl, mode.value());
    } else {
      _canvas->drawColor(cl);
    }
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(clear) {
    ArgParser parser(runtime, arguments, count);
    auto cl = parser.next<SkColor>();
    _canvas->clear(cl);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(concat) {
    ArgParser parser(runtime, arguments, count);
    auto matrix = parser.next<std::shared_ptr<SkMatrix>>();
    _canvas->concat(*matrix);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawPicture) {
    ArgParser parser(runtime, arguments, count);
    auto picture = parser.next<sk_sp<SkPicture>>();
    _canvas->drawPicture(picture);
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(drawAtlas) {
    ArgParser parser(runtime, arguments, count);
    auto atlas = parser.next<sk_sp<SkImage>>();
    auto rects = parser.next<jsi::Array>();
    auto transforms = parser.next<jsi::Array>();
    auto paint = parser.next<std::shared_ptr<SkPaint>>();
    auto blendMode = parser.next<std::optional<SkBlendMode>>();
    auto colorsArray = parser.next<std::optional<jsi::Array>>();
    auto samplingValue = parser.next<std::optional<jsi::Value>>();

    int rectsSize = static_cast<int>(rects.size(runtime));
    int xformsSize = static_cast<int>(transforms.size(runtime));

    if (xformsSize != rectsSize) {
      throw std::invalid_argument(
          "Transforms and rects arrays must have the same length");
    }

    std::vector<SkRect> skRects;
    skRects.reserve(rectsSize);
    for (int i = 0; i < rectsSize; i++) {
      auto rect = JsiSkRect::fromValue(
          runtime, rects.getValueAtIndex(runtime, i).asObject(runtime));
      skRects.push_back(*rect);
    }

    std::vector<SkRSXform> xforms;
    xforms.reserve(xformsSize);
    for (int i = 0; i < xformsSize; i++) {
      auto xform = JsiSkRSXform::fromValue(
          runtime, transforms.getValueAtIndex(runtime, i).asObject(runtime));
      xforms.push_back(*xform);
    }

    std::vector<SkColor> colors;
    if (colorsArray.has_value()) {
      int colorsSize = static_cast<int>(colorsArray.value().size(runtime));
      if (colorsSize != rectsSize) {
        throw std::invalid_argument(
            "Colors array must have the same length as rects/transforms");
      }

      colors.reserve(colorsSize);
      for (int i = 0; i < colorsSize; i++) {
        auto val = colorsArray.value().getValueAtIndex(runtime, i).asObject(runtime);
        float r = val.getProperty(runtime, "0").asNumber();
        float g = val.getProperty(runtime, "1").asNumber();
        float b = val.getProperty(runtime, "2").asNumber();
        float a = val.getProperty(runtime, "3").asNumber();

        uint8_t r8 = static_cast<uint8_t>(r * 255);
        uint8_t g8 = static_cast<uint8_t>(g * 255);
        uint8_t b8 = static_cast<uint8_t>(b * 255);
        uint8_t a8 = static_cast<uint8_t>(a * 255);

        SkColor color = SkColorSetARGB(a8, r8, g8, b8);
        colors.push_back(color);
      }
    }

    SkSamplingOptions sampling(SkFilterMode::kLinear);
    if (samplingValue.has_value()) {
      sampling = SamplingOptionsFromValue(runtime, samplingValue.value());
    }

    auto x = SkSpan(xforms.data(), xforms.size());
    auto t = SkSpan(skRects.data(), skRects.size());
    auto c = SkSpan(colors.data(), colors.size());
    _canvas->drawAtlas(atlas.get(), x, t, c, blendMode.value_or(SkBlendMode::kDstOver),
                       sampling, nullptr, paint.get());
    return jsi::Value::undefined();
  }

  JSI_HOST_FUNCTION(readPixels) {
    ArgParser parser(runtime, arguments, count);
    auto srcX = parser.next<int>();
    auto srcY = parser.next<int>();
    auto infoValue = parser.next<jsi::Value>();
    auto destValue = parser.next<std::optional<jsi::Value>>();
    auto bytesPerRowOpt = parser.next<std::optional<size_t>>();

    auto info = JsiSkImageInfo::fromValue(runtime, infoValue);
    if (!info) {
      return jsi::Value::null();
    }

    size_t bytesPerRow = bytesPerRowOpt.value_or(info->minRowBytes());

    auto dest = destValue.has_value()
            ? RNSkTypedArray::getTypedArray(runtime, destValue.value(), *info)
            : RNSkTypedArray::getTypedArray(runtime, jsi::Value::null(), *info);

    if (!dest.isObject()) {
      return jsi::Value::null();
    }

    jsi::ArrayBuffer buffer =
        dest.asObject(runtime)
            .getProperty(runtime, jsi::PropNameID::forAscii(runtime, "buffer"))
            .asObject(runtime)
            .getArrayBuffer(runtime);
    auto bfrPtr = reinterpret_cast<void *>(buffer.data(runtime));

    if (!_canvas->readPixels(*info, bfrPtr, bytesPerRow, srcX, srcY)) {
      return jsi::Value::null();
    }
    return dest;
  }

  JSI_EXPORT_FUNCTIONS(JSI_EXPORT_FUNC(JsiSkCanvas, drawPaint),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawLine),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawRect),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawImage),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawImageRect),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawImageCubic),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawImageOptions),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawImageNine),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawImageRectCubic),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawImageRectOptions),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawCircle),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawArc),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawRRect),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawDRRect),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawOval),
                       JSI_EXPORT_FUNC(JsiSkCanvas, restoreToCount),
                       JSI_EXPORT_FUNC(JsiSkCanvas, getSaveCount),
                       JSI_EXPORT_FUNC(JsiSkCanvas, getTotalMatrix),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawPoints),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawPatch),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawPath),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawVertices),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawText),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawTextBlob),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawGlyphs),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawSvg),
                       JSI_EXPORT_FUNC(JsiSkCanvas, clipPath),
                       JSI_EXPORT_FUNC(JsiSkCanvas, clipRect),
                       JSI_EXPORT_FUNC(JsiSkCanvas, clipRRect),
                       JSI_EXPORT_FUNC(JsiSkCanvas, save),
                       JSI_EXPORT_FUNC(JsiSkCanvas, saveLayer),
                       JSI_EXPORT_FUNC(JsiSkCanvas, restore),
                       JSI_EXPORT_FUNC(JsiSkCanvas, rotate),
                       JSI_EXPORT_FUNC(JsiSkCanvas, translate),
                       JSI_EXPORT_FUNC(JsiSkCanvas, scale),
                       JSI_EXPORT_FUNC(JsiSkCanvas, skew),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawColor),
                       JSI_EXPORT_FUNC(JsiSkCanvas, clear),
                       JSI_EXPORT_FUNC(JsiSkCanvas, concat),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawPicture),
                       JSI_EXPORT_FUNC(JsiSkCanvas, drawAtlas),
                       JSI_EXPORT_FUNC(JsiSkCanvas, readPixels))

  size_t getMemoryPressure() const override { return 1024; }

  explicit JsiSkCanvas(std::shared_ptr<RNSkPlatformContext> context)
      : JsiSkHostObject(std::move(context)) {}

  JsiSkCanvas(std::shared_ptr<RNSkPlatformContext> context, SkCanvas *canvas)
      : JsiSkCanvas(std::move(context)) {
    setCanvas(canvas);
  }

  void setCanvas(SkCanvas *canvas) { _canvas = canvas; }
  SkCanvas *getCanvas() { return _canvas; }

private:
  SkCanvas *_canvas;
};
} // namespace RNSkia