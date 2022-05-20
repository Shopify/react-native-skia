import type {
  CanvasKit,
  ColorFilter,
  ImageFilter,
  MaskFilter,
  Paint,
  PathEffect,
  Shader,
} from "canvaskit-wasm";

import type { SkColor } from "../../Color";
import type { SkColorFilter } from "../../ColorFilter";
import type { SkImageFilter } from "../../ImageFilter";
import type { SkMaskFilter } from "../../MaskFilter";
import type {
  BlendMode,
  SkPaint,
  StrokeCap,
  StrokeJoin,
  PaintStyle,
} from "../../Paint";
import type { SkPathEffect } from "../../PathEffect";
import type { SkShader } from "../../Shader";

import { HostObject, toValue } from "./Host";

export class JsiSkPaint extends HostObject<Paint, "Paint"> implements SkPaint {
  constructor(CanvasKit: CanvasKit, ref: Paint) {
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
    this.ref.setBlendMode({ value: blendMode });
  }

  setColor(color: SkColor) {
    this.ref.setColor(color);
  }

  setColorFilter(filter: SkColorFilter | null) {
    this.ref.setColorFilter(toValue<ColorFilter>(filter));
  }

  setImageFilter(filter: SkImageFilter | null) {
    this.ref.setImageFilter(toValue<ImageFilter>(filter));
  }

  setMaskFilter(filter: SkMaskFilter | null) {
    this.ref.setMaskFilter(toValue<MaskFilter>(filter));
  }

  setPathEffect(effect: SkPathEffect | null) {
    this.ref.setPathEffect(toValue<PathEffect>(effect));
  }

  setShader(shader: SkShader | null) {
    this.ref.setShader(toValue<Shader>(shader));
  }

  setStrokeCap(cap: StrokeCap) {
    this.ref.setStrokeCap({ value: cap });
  }

  setStrokeJoin(join: StrokeJoin) {
    this.ref.setStrokeJoin({ value: join });
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
