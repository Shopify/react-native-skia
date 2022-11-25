import type { CanvasKit, Paint } from "canvaskit-wasm";

import type {
  StrokeJoin,
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

import { HostObject, ckEnum } from "./Host";
import { JsiSkColorFilter } from "./JsiSkColorFilter";
import { JsiSkImageFilter } from "./JsiSkImageFilter";
import { JsiSkMaskFilter } from "./JsiSkMaskFilter";
import { JsiSkPathEffect } from "./JsiSkPathEffect";
import { JsiSkShader } from "./JsiSkShader";

// We would like to extend CanvasKit with a couple of getters (getAlphaf, getShader, ...)
// We polyfill this behavior on web by keeping track of refs.
interface Refs {
  hasColor: boolean;
  shader: SkShader | null;
  pathEffect: SkPathEffect | null;
  maskFilter: SkMaskFilter | null;
  imageFilter: SkImageFilter | null;
  colorFilter: SkColorFilter | null;
}

export class JsiSkPaint extends HostObject<Paint, "Paint"> implements SkPaint {
  refs: Refs;

  constructor(CanvasKit: CanvasKit, from?: JsiSkPaint) {
    const ref = from ? from.ref.copy() : new CanvasKit.Paint();
    super(CanvasKit, ref, "Paint");
    this.refs = from
      ? { ...from.refs }
      : {
          shader: null,
          hasColor: false,
          pathEffect: null,
          maskFilter: null,
          imageFilter: null,
          colorFilter: null,
        };
  }

  copy() {
    return new JsiSkPaint(this.CanvasKit, this);
  }

  reset() {
    this.ref = new this.CanvasKit.Paint();
  }

  getAssignedColor() {
    if (this.refs.hasColor) {
      return this.getColor();
    }
    return null;
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

  getAlphaf() {
    return this.getColor()[3];
  }

  setAntiAlias(aa: boolean) {
    this.ref.setAntiAlias(aa);
  }

  setBlendMode(blendMode: BlendMode) {
    this.ref.setBlendMode(ckEnum(blendMode));
  }

  setColor(color: SkColor) {
    this.ref.setColor(color);
    this.refs.hasColor = true;
  }

  setColorFilter(filter: SkColorFilter | null) {
    this.refs.colorFilter = filter;
    this.ref.setColorFilter(filter ? JsiSkColorFilter.fromValue(filter) : null);
  }

  getColorFilter() {
    return this.refs.colorFilter;
  }

  setImageFilter(filter: SkImageFilter | null) {
    this.refs.imageFilter = filter;
    this.ref.setImageFilter(filter ? JsiSkImageFilter.fromValue(filter) : null);
  }

  getImageFilter() {
    return this.refs.imageFilter;
  }

  setMaskFilter(filter: SkMaskFilter | null) {
    this.refs.maskFilter = filter;
    this.ref.setMaskFilter(filter ? JsiSkMaskFilter.fromValue(filter) : null);
  }

  getMaskFilter() {
    return this.refs.maskFilter;
  }

  setPathEffect(effect: SkPathEffect | null) {
    this.refs.pathEffect = effect;
    this.ref.setPathEffect(effect ? JsiSkPathEffect.fromValue(effect) : null);
  }

  getPathEffect() {
    return this.refs.pathEffect;
  }

  setShader(shader: SkShader | null) {
    this.refs.shader = shader;
    this.ref.setShader(shader ? JsiSkShader.fromValue(shader) : null);
  }

  getShader() {
    return this.refs.shader;
  }

  setStrokeCap(cap: StrokeCap) {
    this.ref.setStrokeCap(ckEnum(cap));
  }

  setStrokeJoin(join: StrokeJoin) {
    this.ref.setStrokeJoin(ckEnum(join));
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
