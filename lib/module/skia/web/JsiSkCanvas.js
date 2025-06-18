function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { isCubicSampling } from "../types";
import { getEnum, HostObject } from "./Host";
import { JsiSkPaint } from "./JsiSkPaint";
import { JsiSkRect } from "./JsiSkRect";
import { JsiSkRRect } from "./JsiSkRRect";
import { JsiSkImage } from "./JsiSkImage";
import { JsiSkVertices } from "./JsiSkVertices";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkFont } from "./JsiSkFont";
import { JsiSkTextBlob } from "./JsiSkTextBlob";
import { JsiSkPicture } from "./JsiSkPicture";
import { JsiSkMatrix } from "./JsiSkMatrix";
import { JsiSkImageFilter } from "./JsiSkImageFilter";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkRSXform } from "./JsiSkRSXform";
export class JsiSkCanvas extends HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Canvas");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  drawRect(rect, paint) {
    this.ref.drawRect(JsiSkRect.fromValue(this.CanvasKit, rect), JsiSkPaint.fromValue(paint));
  }
  drawImage(image, x, y, paint) {
    this.ref.drawImage(JsiSkImage.fromValue(image), x, y, paint ? JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageRect(img, src, dest, paint, fastSample) {
    this.ref.drawImageRect(JsiSkImage.fromValue(img), JsiSkRect.fromValue(this.CanvasKit, src), JsiSkRect.fromValue(this.CanvasKit, dest), JsiSkPaint.fromValue(paint), fastSample);
  }
  drawImageCubic(img, left, top, B, C, paint) {
    this.ref.drawImageCubic(JsiSkImage.fromValue(img), left, top, B, C, paint ? JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageOptions(img, left, top, fm, mm, paint) {
    this.ref.drawImageOptions(JsiSkImage.fromValue(img), left, top, getEnum(this.CanvasKit, "FilterMode", fm), getEnum(this.CanvasKit, "MipmapMode", mm), paint ? JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageNine(img, center, dest, filter, paint) {
    this.ref.drawImageNine(JsiSkImage.fromValue(img), Array.from(JsiSkRect.fromValue(this.CanvasKit, center)), JsiSkRect.fromValue(this.CanvasKit, dest), getEnum(this.CanvasKit, "FilterMode", filter), paint ? JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageRectCubic(img, src, dest, B, C, paint) {
    this.ref.drawImageRectCubic(JsiSkImage.fromValue(img), JsiSkRect.fromValue(this.CanvasKit, src), JsiSkRect.fromValue(this.CanvasKit, dest), B, C, paint ? JsiSkPaint.fromValue(paint) : paint);
  }
  drawImageRectOptions(img, src, dest, fm, mm, paint) {
    this.ref.drawImageRectOptions(JsiSkImage.fromValue(img), JsiSkRect.fromValue(this.CanvasKit, src), JsiSkRect.fromValue(this.CanvasKit, dest), getEnum(this.CanvasKit, "FilterMode", fm), getEnum(this.CanvasKit, "MipmapMode", mm), paint ? JsiSkPaint.fromValue(paint) : paint);
  }
  drawPaint(paint) {
    this.ref.drawPaint(JsiSkPaint.fromValue(paint));
  }
  drawLine(x0, y0, x1, y1, paint) {
    this.ref.drawLine(x0, y0, x1, y1, JsiSkPaint.fromValue(paint));
  }
  drawCircle(cx, cy, radius, paint) {
    this.ref.drawCircle(cx, cy, radius, JsiSkPaint.fromValue(paint));
  }
  drawVertices(verts, mode, paint) {
    this.ref.drawVertices(JsiSkVertices.fromValue(verts), getEnum(this.CanvasKit, "BlendMode", mode), JsiSkPaint.fromValue(paint));
  }
  drawPatch(cubics, colors, texs, mode, paint) {
    this.ref.drawPatch(cubics.map(({
      x,
      y
    }) => [x, y]).flat(), colors, texs ? texs.flatMap(p => Array.from(JsiSkPoint.fromValue(p))) : texs, mode ? getEnum(this.CanvasKit, "BlendMode", mode) : null, paint ? JsiSkPaint.fromValue(paint) : undefined);
  }
  restoreToCount(saveCount) {
    this.ref.restoreToCount(saveCount);
  }
  drawPoints(mode, points, paint) {
    this.ref.drawPoints(getEnum(this.CanvasKit, "PointMode", mode), points.map(({
      x,
      y
    }) => [x, y]).flat(), JsiSkPaint.fromValue(paint));
  }
  drawArc(oval, startAngle, sweepAngle, useCenter, paint) {
    this.ref.drawArc(JsiSkRect.fromValue(this.CanvasKit, oval), startAngle, sweepAngle, useCenter, JsiSkPaint.fromValue(paint));
  }
  drawRRect(rrect, paint) {
    this.ref.drawRRect(JsiSkRRect.fromValue(this.CanvasKit, rrect), JsiSkPaint.fromValue(paint));
  }
  drawDRRect(outer, inner, paint) {
    this.ref.drawDRRect(JsiSkRRect.fromValue(this.CanvasKit, outer), JsiSkRRect.fromValue(this.CanvasKit, inner), JsiSkPaint.fromValue(paint));
  }
  drawOval(oval, paint) {
    this.ref.drawOval(JsiSkRect.fromValue(this.CanvasKit, oval), JsiSkPaint.fromValue(paint));
  }
  drawPath(path, paint) {
    this.ref.drawPath(JsiSkPath.fromValue(path), JsiSkPaint.fromValue(paint));
  }
  drawText(str, x, y, paint, font) {
    this.ref.drawText(str, x, y, JsiSkPaint.fromValue(paint), JsiSkFont.fromValue(font));
  }
  drawTextBlob(blob, x, y, paint) {
    this.ref.drawTextBlob(JsiSkTextBlob.fromValue(blob), x, y, JsiSkPaint.fromValue(paint));
  }
  drawGlyphs(glyphs, positions, x, y, font, paint) {
    this.ref.drawGlyphs(glyphs, positions.map(p => [p.x, p.y]).flat(), x, y, JsiSkFont.fromValue(font), JsiSkPaint.fromValue(paint));
  }
  drawSvg(svg, _width, _height) {
    const image = this.CanvasKit.MakeImageFromCanvasImageSource(svg.ref);
    this.ref.drawImage(image, 0, 0);
  }
  save() {
    return this.ref.save();
  }
  saveLayer(paint, bounds, backdrop, flags) {
    return this.ref.saveLayer(paint ? JsiSkPaint.fromValue(paint) : undefined, bounds ? JsiSkRect.fromValue(this.CanvasKit, bounds) : bounds, backdrop ? JsiSkImageFilter.fromValue(backdrop) : backdrop, flags);
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
    this.ref.drawColor(color, blendMode ? getEnum(this.CanvasKit, "BlendMode", blendMode) : undefined);
  }
  clear(color) {
    this.ref.clear(color);
  }
  clipPath(path, op, doAntiAlias) {
    this.ref.clipPath(JsiSkPath.fromValue(path), getEnum(this.CanvasKit, "PathOp", op), doAntiAlias);
  }
  clipRect(rect, op, doAntiAlias) {
    this.ref.clipRect(JsiSkRect.fromValue(this.CanvasKit, rect), getEnum(this.CanvasKit, "PathOp", op), doAntiAlias);
  }
  clipRRect(rrect, op, doAntiAlias) {
    this.ref.clipRRect(JsiSkRRect.fromValue(this.CanvasKit, rrect), getEnum(this.CanvasKit, "PathOp", op), doAntiAlias);
  }
  concat(m) {
    this.ref.concat(Array.isArray(m) ? m : JsiSkMatrix.fromValue(m));
  }
  drawPicture(skp) {
    this.ref.drawPicture(JsiSkPicture.fromValue(skp));
  }
  drawAtlas(atlas, srcs, dsts, paint, blendMode, colors, sampling) {
    const src = srcs.flatMap(s => Array.from(JsiSkRect.fromValue(this.CanvasKit, s)));
    const dst = dsts.flatMap(s => Array.from(JsiSkRSXform.fromValue(s)));
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
    if (sampling && isCubicSampling(sampling)) {
      ckSampling = sampling;
    } else if (sampling) {
      ckSampling = {
        filter: getEnum(this.CanvasKit, "FilterMode", sampling.filter),
        mipmap: sampling.mipmap ? getEnum(this.CanvasKit, "MipmapMode", sampling.mipmap) : this.CanvasKit.MipmapMode.None
      };
    }
    this.ref.drawAtlas(JsiSkImage.fromValue(atlas), src, dst, JsiSkPaint.fromValue(paint), blendMode ? getEnum(this.CanvasKit, "BlendMode", blendMode) : this.CanvasKit.BlendMode.DstOver, cls, ckSampling);
  }
  readPixels(srcX, srcY, imageInfo) {
    const pxInfo = {
      width: imageInfo.width,
      height: imageInfo.height,
      colorSpace: this.CanvasKit.ColorSpace.SRGB,
      alphaType: getEnum(this.CanvasKit, "AlphaType", imageInfo.alphaType),
      colorType: getEnum(this.CanvasKit, "ColorType", imageInfo.colorType)
    };
    return this.ref.readPixels(srcX, srcY, pxInfo);
  }
}
//# sourceMappingURL=JsiSkCanvas.js.map