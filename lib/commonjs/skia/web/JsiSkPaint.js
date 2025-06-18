"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkPaint = void 0;
var _Host = require("./Host");
var _JsiSkColorFilter = require("./JsiSkColorFilter");
var _JsiSkImageFilter = require("./JsiSkImageFilter");
var _JsiSkMaskFilter = require("./JsiSkMaskFilter");
var _JsiSkPathEffect = require("./JsiSkPathEffect");
var _JsiSkShader = require("./JsiSkShader");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class JsiSkPaint extends _Host.HostObject {
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
    this.ref.setBlendMode((0, _Host.getEnum)(this.CanvasKit, "BlendMode", blendMode));
  }
  setColor(color) {
    this.ref.setColor(color);
  }
  setColorFilter(filter) {
    this.ref.setColorFilter(filter ? _JsiSkColorFilter.JsiSkColorFilter.fromValue(filter) : null);
  }
  setImageFilter(filter) {
    this.ref.setImageFilter(filter ? _JsiSkImageFilter.JsiSkImageFilter.fromValue(filter) : null);
  }
  setMaskFilter(filter) {
    this.ref.setMaskFilter(filter ? _JsiSkMaskFilter.JsiSkMaskFilter.fromValue(filter) : null);
  }
  setPathEffect(effect) {
    this.ref.setPathEffect(effect ? _JsiSkPathEffect.JsiSkPathEffect.fromValue(effect) : null);
  }
  setShader(shader) {
    this.ref.setShader(shader ? _JsiSkShader.JsiSkShader.fromValue(shader) : null);
  }
  setStrokeCap(cap) {
    this.ref.setStrokeCap((0, _Host.getEnum)(this.CanvasKit, "StrokeCap", cap));
  }
  setStrokeJoin(join) {
    this.ref.setStrokeJoin((0, _Host.getEnum)(this.CanvasKit, "StrokeJoin", join));
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
exports.JsiSkPaint = JsiSkPaint;
//# sourceMappingURL=JsiSkPaint.js.map