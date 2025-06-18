function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { HostObject, getEnum, throwNotImplementedOnRNWeb } from "./Host";
import { JsiSkPaint } from "./JsiSkPaint";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkRect } from "./JsiSkRect";
import { JsiSkTypeface } from "./JsiSkTypeface";
export class JsiSkFont extends HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Font");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  measureText(_text, _paint) {
    return throwNotImplementedOnRNWeb();
  }
  getTextWidth(text, paint) {
    const ids = this.getGlyphIDs(text);
    const widths = this.getGlyphWidths(ids, paint);
    return widths.reduce((a, b) => a + b, 0);
  }
  getMetrics() {
    const result = this.ref.getMetrics();
    return {
      ascent: result.ascent,
      descent: result.descent,
      leading: result.leading,
      bounds: result.bounds ? new JsiSkRect(this.CanvasKit, result.bounds) : undefined
    };
  }
  getGlyphIDs(str, numCodePoints) {
    // TODO: Fix return value in the C++ implementation
    return [...this.ref.getGlyphIDs(str, numCodePoints)];
  }

  // TODO: Fix return value in the C++ implementation, it return float32
  getGlyphWidths(glyphs, paint) {
    return [...this.ref.getGlyphWidths(glyphs, paint ? JsiSkPaint.fromValue(paint) : null)];
  }
  getGlyphIntercepts(glyphs, positions, top, bottom) {
    return [...this.ref.getGlyphIntercepts(glyphs, positions.map(p => Array.from(JsiSkPoint.fromValue(p))).flat(), top, bottom)];
  }
  getScaleX() {
    return this.ref.getScaleX();
  }
  getSize() {
    return this.ref.getSize();
  }
  getSkewX() {
    return this.ref.getSkewX();
  }
  isEmbolden() {
    return this.ref.isEmbolden();
  }
  getTypeface() {
    const tf = this.ref.getTypeface();
    return tf ? new JsiSkTypeface(this.CanvasKit, tf) : null;
  }
  setEdging(edging) {
    this.ref.setEdging(getEnum(this.CanvasKit, "FontEdging", edging));
  }
  setEmbeddedBitmaps(embeddedBitmaps) {
    this.ref.setEmbeddedBitmaps(embeddedBitmaps);
  }
  setHinting(hinting) {
    this.ref.setHinting(getEnum(this.CanvasKit, "FontHinting", hinting));
  }
  setLinearMetrics(linearMetrics) {
    this.ref.setLinearMetrics(linearMetrics);
  }
  setScaleX(sx) {
    this.ref.setScaleX(sx);
  }
  setSize(points) {
    this.ref.setSize(points);
  }
  setSkewX(sx) {
    this.ref.setSkewX(sx);
  }
  setEmbolden(embolden) {
    this.ref.setEmbolden(embolden);
  }
  setSubpixel(subpixel) {
    this.ref.setSubpixel(subpixel);
  }
  setTypeface(face) {
    this.ref.setTypeface(face ? JsiSkTypeface.fromValue(face) : null);
  }
}
//# sourceMappingURL=JsiSkFont.js.map