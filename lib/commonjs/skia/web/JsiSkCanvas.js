"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkCanvas = void 0;
var _types = require("../types");
var _Host = require("./Host");
var _JsiSkPaint = require("./JsiSkPaint");
var _JsiSkRect = require("./JsiSkRect");
var _JsiSkRRect = require("./JsiSkRRect");
var _JsiSkImage = require("./JsiSkImage");
var _JsiSkVertices = require("./JsiSkVertices");
var _JsiSkPath = require("./JsiSkPath");
var _JsiSkFont = require("./JsiSkFont");
var _JsiSkTextBlob = require("./JsiSkTextBlob");
var _JsiSkPicture = require("./JsiSkPicture");
var _JsiSkMatrix = require("./JsiSkMatrix");
var _JsiSkImageFilter = require("./JsiSkImageFilter");
var _JsiSkPoint = require("./JsiSkPoint");
var _JsiSkRSXform = require("./JsiSkRSXform");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class JsiSkCanvas extends _Host.HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Canvas");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  drawRect(rect, paint) {
    this.ref.drawRect(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, rect), _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawImage(image, x, y, paint) {
    this.ref.drawImage(_JsiSkImage.JsiSkImage.fromValue(image), x, y, paint ? _JsiSkPaint.JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageRect(img, src, dest, paint, fastSample) {
    this.ref.drawImageRect(_JsiSkImage.JsiSkImage.fromValue(img), _JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, src), _JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, dest), _JsiSkPaint.JsiSkPaint.fromValue(paint), fastSample);
  }
  drawImageCubic(img, left, top, B, C, paint) {
    this.ref.drawImageCubic(_JsiSkImage.JsiSkImage.fromValue(img), left, top, B, C, paint ? _JsiSkPaint.JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageOptions(img, left, top, fm, mm, paint) {
    this.ref.drawImageOptions(_JsiSkImage.JsiSkImage.fromValue(img), left, top, (0, _Host.getEnum)(this.CanvasKit, "FilterMode", fm), (0, _Host.getEnum)(this.CanvasKit, "MipmapMode", mm), paint ? _JsiSkPaint.JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageNine(img, center, dest, filter, paint) {
    this.ref.drawImageNine(_JsiSkImage.JsiSkImage.fromValue(img), Array.from(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, center)), _JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, dest), (0, _Host.getEnum)(this.CanvasKit, "FilterMode", filter), paint ? _JsiSkPaint.JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageRectCubic(img, src, dest, B, C, paint) {
    this.ref.drawImageRectCubic(_JsiSkImage.JsiSkImage.fromValue(img), _JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, src), _JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, dest), B, C, paint ? _JsiSkPaint.JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageRectOptions(img, src, dest, fm, mm, paint) {
    this.ref.drawImageRectOptions(_JsiSkImage.JsiSkImage.fromValue(img), _JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, src), _JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, dest), (0, _Host.getEnum)(this.CanvasKit, "FilterMode", fm), (0, _Host.getEnum)(this.CanvasKit, "MipmapMode", mm), paint ? _JsiSkPaint.JsiSkPaint.fromValue(paint) : paint);
  }
  drawPaint(paint) {
    this.ref.drawPaint(_JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawLine(x0, y0, x1, y1, paint) {
    this.ref.drawLine(x0, y0, x1, y1, _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawCircle(cx, cy, radius, paint) {
    this.ref.drawCircle(cx, cy, radius, _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawVertices(verts, mode, paint) {
    this.ref.drawVertices(_JsiSkVertices.JsiSkVertices.fromValue(verts), (0, _Host.getEnum)(this.CanvasKit, "BlendMode", mode), _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawPatch(cubics, colors, texs, mode, paint) {
    this.ref.drawPatch(cubics.map(({
      x,
      y
    }) => [x, y]).flat(), colors, texs ? texs.flatMap(p => Array.from(_JsiSkPoint.JsiSkPoint.fromValue(p))) : texs, mode ? (0, _Host.getEnum)(this.CanvasKit, "BlendMode", mode) : null, paint ? _JsiSkPaint.JsiSkPaint.fromValue(paint) : undefined);
  }
  restoreToCount(saveCount) {
    this.ref.restoreToCount(saveCount);
  }
  drawPoints(mode, points, paint) {
    this.ref.drawPoints((0, _Host.getEnum)(this.CanvasKit, "PointMode", mode), points.map(({
      x,
      y
    }) => [x, y]).flat(), _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawArc(oval, startAngle, sweepAngle, useCenter, paint) {
    this.ref.drawArc(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, oval), startAngle, sweepAngle, useCenter, _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawRRect(rrect, paint) {
    this.ref.drawRRect(_JsiSkRRect.JsiSkRRect.fromValue(this.CanvasKit, rrect), _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawDRRect(outer, inner, paint) {
    this.ref.drawDRRect(_JsiSkRRect.JsiSkRRect.fromValue(this.CanvasKit, outer), _JsiSkRRect.JsiSkRRect.fromValue(this.CanvasKit, inner), _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawOval(oval, paint) {
    this.ref.drawOval(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, oval), _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawPath(path, paint) {
    this.ref.drawPath(_JsiSkPath.JsiSkPath.fromValue(path), _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawText(str, x, y, paint, font) {
    this.ref.drawText(str, x, y, _JsiSkPaint.JsiSkPaint.fromValue(paint), _JsiSkFont.JsiSkFont.fromValue(font));
  }
  drawTextBlob(blob, x, y, paint) {
    this.ref.drawTextBlob(_JsiSkTextBlob.JsiSkTextBlob.fromValue(blob), x, y, _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawGlyphs(glyphs, positions, x, y, font, paint) {
    this.ref.drawGlyphs(glyphs, positions.map(p => [p.x, p.y]).flat(), x, y, _JsiSkFont.JsiSkFont.fromValue(font), _JsiSkPaint.JsiSkPaint.fromValue(paint));
  }
  drawSvg(svg, _width, _height) {
    const image = this.CanvasKit.MakeImageFromCanvasImageSource(svg.ref);
    this.ref.drawImage(image, 0, 0);
  }
  save() {
    return this.ref.save();
  }
  saveLayer(paint, bounds, backdrop, flags) {
    return this.ref.saveLayer(paint ? _JsiSkPaint.JsiSkPaint.fromValue(paint) : undefined, bounds ? _JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, bounds) : bounds, backdrop ? _JsiSkImageFilter.JsiSkImageFilter.fromValue(backdrop) : backdrop, flags);
  }
  restore() {
    this.ref.restore();
  }
  rotate(rotationInDegrees, rx, ry) {
    this.ref.rotate(rotationInDegrees, rx, ry);
  }
  scale(sx, sy) {
    this.ref.scale(sx, sy);
  }
  skew(sx, sy) {
    this.ref.skew(sx, sy);
  }
  translate(dx, dy) {
    this.ref.translate(dx, dy);
  }
  drawColor(color, blendMode) {
    this.ref.drawColor(color, blendMode ? (0, _Host.getEnum)(this.CanvasKit, "BlendMode", blendMode) : undefined);
  }
  clear(color) {
    this.ref.clear(color);
  }
  clipPath(path, op, doAntiAlias) {
    this.ref.clipPath(_JsiSkPath.JsiSkPath.fromValue(path), (0, _Host.getEnum)(this.CanvasKit, "PathOp", op), doAntiAlias);
  }
  clipRect(rect, op, doAntiAlias) {
    this.ref.clipRect(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, rect), (0, _Host.getEnum)(this.CanvasKit, "PathOp", op), doAntiAlias);
  }
  clipRRect(rrect, op, doAntiAlias) {
    this.ref.clipRRect(_JsiSkRRect.JsiSkRRect.fromValue(this.CanvasKit, rrect), (0, _Host.getEnum)(this.CanvasKit, "PathOp", op), doAntiAlias);
  }
  concat(m) {
    this.ref.concat(Array.isArray(m) ? m : _JsiSkMatrix.JsiSkMatrix.fromValue(m));
  }
  drawPicture(skp) {
    this.ref.drawPicture(_JsiSkPicture.JsiSkPicture.fromValue(skp));
  }
  drawAtlas(atlas, srcs, dsts, paint, blendMode, colors, sampling) {
    const src = srcs.flatMap(s => Array.from(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, s)));
    const dst = dsts.flatMap(s => Array.from(_JsiSkRSXform.JsiSkRSXform.fromValue(s)));
    let cls;
    if (colors) {
      cls = new Uint32Array(colors.length);
      for (let i = 0; i < colors.length; i++) {
        const [r, g, b, a] = colors[i];
        cls[i] = this.CanvasKit.ColorAsInt(r * 255, g * 255, b * 255, a * 255);
      }
    }
    let ckSampling = {
      filter: this.CanvasKit.FilterMode.Linear,
      mipmap: this.CanvasKit.MipmapMode.None
    };
    if (sampling && (0, _types.isCubicSampling)(sampling)) {
      ckSampling = sampling;
    } else if (sampling) {
      ckSampling = {
        filter: (0, _Host.getEnum)(this.CanvasKit, "FilterMode", sampling.filter),
        mipmap: sampling.mipmap ? (0, _Host.getEnum)(this.CanvasKit, "MipmapMode", sampling.mipmap) : this.CanvasKit.MipmapMode.None
      };
    }
    this.ref.drawAtlas(_JsiSkImage.JsiSkImage.fromValue(atlas), src, dst, _JsiSkPaint.JsiSkPaint.fromValue(paint), blendMode ? (0, _Host.getEnum)(this.CanvasKit, "BlendMode", blendMode) : this.CanvasKit.BlendMode.DstOver, cls, ckSampling);
  }
  readPixels(srcX, srcY, imageInfo) {
    const pxInfo = {
      width: imageInfo.width,
      height: imageInfo.height,
      colorSpace: this.CanvasKit.ColorSpace.SRGB,
      alphaType: (0, _Host.getEnum)(this.CanvasKit, "AlphaType", imageInfo.alphaType),
      colorType: (0, _Host.getEnum)(this.CanvasKit, "ColorType", imageInfo.colorType)
    };
    return this.ref.readPixels(srcX, srcY, pxInfo);
  }
}
exports.JsiSkCanvas = JsiSkCanvas;
//# sourceMappingURL=JsiSkCanvas.js.map