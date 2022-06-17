import type { CanvasKit, Paint } from "canvaskit-wasm";

import { StrokeJoin } from "../types";
import type {
  BlendMode,
  SkColor,
  SkColorFilter,
  SkImageFilter,
  SkPaint,
  SkShader,
  StrokeCap,
  PaintStyle,
  SkMaskFilter,
  SkPathEffect,
} from "../types";

import { HostObject, toNullableValue, ckEnum } from "./Host";

// Fixme: there is an issue in canvaskit where form strokeJoin the external declaration
// doesn't match the order of the enum
// The current implementation relies on the enum order to be identical between the C++ and the JS code.
// See: https://github.com/google/skia/blob/main/modules/canvaskit/externs.js#L965
const strokeJoinMap = {
  [StrokeJoin.Miter]: { value: 0 },
  [StrokeJoin.Round]: { value: 1 },
  [StrokeJoin.Bevel]: { value: 2 },
} as const;

export class JsiSkPaint extends HostObject<Paint, "Paint"> implements SkPaint {
  constructor(CanvasKit: CanvasKit, ref: Paint) {
    ref.setAntiAlias(true);
    super(CanvasKit, ref, "Paint");
  }

  copy() {
    return new JsiSkPaint(this.CanvasKit, this.ref.copy());
  }

  getColor() {
    return this.ref.getColor();
  }

  getStrokeCap() {
    return this.ref.getStrokeCap().value;
  }

  getStrokeJoin() {
    return this.ref.getStrokeJoin().value;
  }

  getStrokeMiter() {
    return this.ref.getStrokeMiter();
  }

  getStrokeWidth() {
    return this.ref.getStrokeWidth();
  }

  setAlphaf(alpha: number) {
    this.ref.setAlphaf(alpha);
  }

  setAntiAlias(aa: boolean) {
    this.ref.setAntiAlias(aa);
  }

  setBlendMode(blendMode: BlendMode) {
    this.ref.setBlendMode(ckEnum(blendMode));
  }

  setColor(color: SkColor) {
    this.ref.setColor(color);
  }

  setColorFilter(filter: SkColorFilter | null) {
    this.ref.setColorFilter(toNullableValue(filter));
  }

  setImageFilter(filter: SkImageFilter | null) {
    this.ref.setImageFilter(toNullableValue(filter));
  }

  setMaskFilter(filter: SkMaskFilter | null) {
    this.ref.setMaskFilter(toNullableValue(filter));
  }

  setPathEffect(effect: SkPathEffect | null) {
    this.ref.setPathEffect(toNullableValue(effect));
  }

  setShader(shader: SkShader | null) {
    this.ref.setShader(toNullableValue(shader));
  }

  setStrokeCap(cap: StrokeCap) {
    this.ref.setStrokeCap(ckEnum(cap));
  }

  setStrokeJoin(join: StrokeJoin) {
    this.ref.setStrokeJoin(strokeJoinMap[join]);
  }

  setStrokeMiter(limit: number) {
    this.ref.setStrokeMiter(limit);
  }

  setStrokeWidth(width: number) {
    this.ref.setStrokeWidth(width);
  }

  setStyle(style: PaintStyle) {
    this.ref.setStyle({ value: style });
  }
}
