function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { HostObject, getEnum } from "./Host";
import { JsiSkColorFilter } from "./JsiSkColorFilter";
import { JsiSkImageFilter } from "./JsiSkImageFilter";
import { JsiSkMaskFilter } from "./JsiSkMaskFilter";
import { JsiSkPathEffect } from "./JsiSkPathEffect";
import { JsiSkShader } from "./JsiSkShader";
export class JsiSkPaint extends HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Paint");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  copy() {
    return new JsiSkPaint(this.CanvasKit, this.ref.copy());
  }
  assign(paint) {
    this.ref = paint.ref.copy();
  }
  reset() {
    this.ref = new this.CanvasKit.Paint();
  }
  getAlphaf() {
    return this.getColor()[3];
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
  setAlphaf(alpha) {
    this.ref.setAlphaf(alpha);
  }
  setAntiAlias(aa) {
    this.ref.setAntiAlias(aa);
  }
  setDither(dither) {
    this.ref.setDither(dither);
  }
  setBlendMode(blendMode) {
    this.ref.setBlendMode(getEnum(this.CanvasKit, "BlendMode", blendMode));
  }
  setColor(color) {
    this.ref.setColor(color);
  }
  setColorFilter(filter) {
    this.ref.setColorFilter(filter ? JsiSkColorFilter.fromValue(filter) : null);
  }
  setImageFilter(filter) {
    this.ref.setImageFilter(filter ? JsiSkImageFilter.fromValue(filter) : null);
  }
  setMaskFilter(filter) {
    this.ref.setMaskFilter(filter ? JsiSkMaskFilter.fromValue(filter) : null);
  }
  setPathEffect(effect) {
    this.ref.setPathEffect(effect ? JsiSkPathEffect.fromValue(effect) : null);
  }
  setShader(shader) {
    this.ref.setShader(shader ? JsiSkShader.fromValue(shader) : null);
  }
  setStrokeCap(cap) {
    this.ref.setStrokeCap(getEnum(this.CanvasKit, "StrokeCap", cap));
  }
  setStrokeJoin(join) {
    this.ref.setStrokeJoin(getEnum(this.CanvasKit, "StrokeJoin", join));
  }
  setStrokeMiter(limit) {
    this.ref.setStrokeMiter(limit);
  }
  setStrokeWidth(width) {
    this.ref.setStrokeWidth(width);
  }
  setStyle(style) {
    this.ref.setStyle({
      value: style
    });
  }
}
//# sourceMappingURL=JsiSkPaint.js.map