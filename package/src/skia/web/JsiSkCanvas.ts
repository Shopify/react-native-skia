import type { Canvas, Image, Paint, CanvasKit } from "canvaskit-wasm";

import type {
  BlendMode,
  ClipOp,
  FilterMode,
  MipmapMode,
  PointMode,
  SaveLayerFlag,
  SkCanvas,
  SkColor,
  SkFont,
  SkImage,
  SkImageFilter,
  SkMatrix,
  SkPaint,
  SkPath,
  SkPicture,
  SkPoint,
  SkRect,
  SkRRect,
  SkSVG,
  SkTextBlob,
  SkVertices,
} from "../types";

import {
  ckEnum,
  HostObject,
  toValue,
  toUndefinedableValue,
  toOptionalValue,
} from "./Host";
import { JsiSkRect } from "./JsiSkRect";

export class JsiSkCanvas
  extends HostObject<Canvas, "Canvas">
  implements SkCanvas
{
  constructor(CanvasKit: CanvasKit, ref: Canvas) {
    super(CanvasKit, ref, "Canvas");
  }

  drawRect(rect: SkRect, paint: SkPaint) {
    this.ref.drawRect(
      JsiSkRect.fromValue(this.CanvasKit, rect).ref,
      toValue<Paint>(paint)
    );
  }

  drawImage(image: SkImage, x: number, y: number, paint?: SkPaint) {
    this.ref.drawImage(toValue<Image>(image), x, y, toOptionalValue(paint));
  }

  drawImageRect(
    img: SkImage,
    src: SkRect,
    dest: SkRect,
    paint: SkPaint,
    fastSample?: boolean
  ) {
    this.ref.drawImageRect(
      toValue<Image>(img),
      JsiSkRect.fromValue(this.CanvasKit, src).ref,
      JsiSkRect.fromValue(this.CanvasKit, dest).ref,
      toValue<Paint>(paint),
      fastSample
    );
  }

  drawImageCubic(
    img: SkImage,
    left: number,
    top: number,
    B: number,
    C: number,
    paint?: SkPaint | null
  ) {
    this.ref.drawImageCubic(
      toValue(img),
      left,
      top,
      B,
      C,
      toOptionalValue(paint)
    );
  }

  drawImageOptions(
    img: SkImage,
    left: number,
    top: number,
    fm: FilterMode,
    mm: MipmapMode,
    paint?: SkPaint | null
  ) {
    this.ref.drawImageOptions(
      toValue(img),
      left,
      top,
      ckEnum(fm),
      ckEnum(mm),
      toOptionalValue(paint)
    );
  }

  drawImageNine(
    img: SkImage,
    center: SkRect,
    dest: SkRect,
    filter: FilterMode,
    paint?: SkPaint | null
  ) {
    this.ref.drawImageNine(
      toValue(img),
      toValue(center),
      toValue(dest),
      ckEnum(filter),
      toOptionalValue(paint)
    );
  }

  drawImageRectCubic(
    img: SkImage,
    src: SkRect,
    dest: SkRect,
    B: number,
    C: number,
    paint?: SkPaint | null
  ) {
    this.ref.drawImageRectCubic(
      toValue<Image>(img),
      JsiSkRect.fromValue(this.CanvasKit, src).ref,
      JsiSkRect.fromValue(this.CanvasKit, dest).ref,
      B,
      C,
      toOptionalValue(paint)
    );
  }

  drawImageRectOptions(
    img: SkImage,
    src: SkRect,
    dest: SkRect,
    fm: FilterMode,
    mm: MipmapMode,
    paint?: SkPaint | null
  ) {
    this.ref.drawImageRectOptions(
      toValue<Image>(img),
      JsiSkRect.fromValue(this.CanvasKit, src).ref,
      JsiSkRect.fromValue(this.CanvasKit, dest).ref,
      ckEnum(fm),
      ckEnum(mm),
      toOptionalValue(paint)
    );
  }

  drawPaint(paint: SkPaint) {
    this.ref.drawPaint(toValue(paint));
  }

  drawLine(x0: number, y0: number, x1: number, y1: number, paint: SkPaint) {
    this.ref.drawLine(x0, y0, x1, y1, toValue(paint));
  }

  drawCircle(cx: number, cy: number, radius: number, paint: SkPaint) {
    this.ref.drawCircle(cx, cy, radius, toValue(paint));
  }

  drawVertices(verts: SkVertices, mode: BlendMode, paint: SkPaint) {
    this.ref.drawVertices(toValue(verts), ckEnum(mode), toValue(paint));
  }

  drawPatch(
    cubics: SkPoint[],
    colors?: SkColor[] | null,
    texs?: SkPoint[] | null,
    mode?: BlendMode | null,
    paint?: SkPaint
  ) {
    this.ref.drawPatch(
      cubics.map(({ x, y }) => [x, y]).flat(),
      colors,
      toOptionalValue(texs),
      mode ? ckEnum(mode) : null,
      toUndefinedableValue(paint)
    );
  }

  restoreToCount(saveCount: number) {
    this.ref.restoreToCount(saveCount);
  }

  drawPoints(mode: PointMode, points: SkPoint[], paint: SkPaint) {
    this.ref.drawPoints(
      ckEnum(mode),
      points.map(({ x, y }) => [x, y]).flat(),
      toValue(paint)
    );
  }

  drawArc(
    oval: SkRect,
    startAngle: number,
    sweepAngle: number,
    useCenter: boolean,
    paint: SkPaint
  ) {
    this.ref.drawArc(
      toValue(oval),
      startAngle,
      sweepAngle,
      useCenter,
      toValue(paint)
    );
  }

  drawRRect(rrect: SkRRect, paint: SkPaint) {
    this.ref.drawRRect(toValue(rrect), toValue(paint));
  }

  drawDRRect(outer: SkRRect, inner: SkRRect, paint: SkPaint) {
    this.ref.drawDRRect(toValue(outer), toValue(inner), toValue(paint));
  }

  drawOval(oval: SkRect, paint: SkPaint) {
    this.ref.drawOval(toValue(oval), toValue(paint));
  }

  drawPath(path: SkPath, paint: SkPaint) {
    this.ref.drawPath(toValue(path), toValue(paint));
  }

  drawText(str: string, x: number, y: number, paint: SkPaint, font: SkFont) {
    this.ref.drawText(str, x, y, toValue(paint), toValue(font));
  }

  drawTextBlob(blob: SkTextBlob, x: number, y: number, paint: SkPaint) {
    this.ref.drawTextBlob(toValue(blob), x, y, toValue(paint));
  }

  drawGlyphs(
    glyphs: number[],
    positions: SkPoint[],
    x: number,
    y: number,
    font: SkFont,
    paint: SkPaint
  ) {
    this.ref.drawGlyphs(
      glyphs,
      toValue(positions),
      x,
      y,
      toValue(font),
      toValue(paint)
    );
  }

  drawSvg(_svgDom: SkSVG, _width?: number, _height?: number) {
    throw new Error("drawSvg is not implemented on React Native Web");
  }

  save() {
    return this.ref.save();
  }

  saveLayer(
    paint?: SkPaint,
    bounds?: SkRect | null,
    backdrop?: SkImageFilter | null,
    flags?: SaveLayerFlag
  ) {
    return this.ref.saveLayer(
      toUndefinedableValue(paint),
      toOptionalValue(bounds),
      toOptionalValue(backdrop),
      flags
    );
  }

  restore() {
    this.ref.restore();
  }

  rotate(rotationInDegrees: number, rx: number, ry: number) {
    this.ref.rotate(rotationInDegrees, rx, ry);
  }

  scale(sx: number, sy: number) {
    this.ref.scale(sx, sy);
  }

  skew(sx: number, sy: number) {
    this.ref.skew(sx, sy);
  }

  translate(dx: number, dy: number) {
    this.ref.translate(dx, dy);
  }

  drawColor(color: SkColor, blendMode?: BlendMode) {
    this.ref.drawColor(color, blendMode ? ckEnum(blendMode) : undefined);
  }

  clear(color: SkColor) {
    this.ref.clear(color);
  }

  clipPath(path: SkPath, op: ClipOp, doAntiAlias: boolean) {
    this.ref.clipPath(toValue(path), ckEnum(op), doAntiAlias);
  }

  clipRect(rect: SkRect, op: ClipOp, doAntiAlias: boolean) {
    this.ref.clipRect(toValue(rect), ckEnum(op), doAntiAlias);
  }

  clipRRect(rrect: SkRRect, op: ClipOp, doAntiAlias: boolean) {
    this.ref.clipRRect(toValue(rrect), ckEnum(op), doAntiAlias);
  }

  concat(m: SkMatrix) {
    this.ref.concat(toValue(m));
  }

  drawPicture(skp: SkPicture) {
    this.ref.drawPicture(toValue(skp));
  }
}
