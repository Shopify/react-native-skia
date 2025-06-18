function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { toMatrix3 } from "../types";
import { HostObject } from "./Host";
const isMatrixHostObject = obj => !Array.isArray(obj);
export class JsiSkMatrix extends HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Matrix");
    _defineProperty(this, "dispose", () => {
      // Do nothing - the matrix is represenetd by a Float32Array
    });
  }
  preMultiply(matrix) {
    this.ref.set(this.CanvasKit.Matrix.multiply(this.ref, matrix));
  }
  postMultiply(matrix) {
    this.ref.set(this.CanvasKit.Matrix.multiply(matrix, this.ref));
  }
  concat(matrix) {
    this.preMultiply(
    // eslint-disable-next-line no-nested-ternary
    isMatrixHostObject(matrix) ? JsiSkMatrix.fromValue(matrix) : matrix.length === 16 ? toMatrix3(matrix) : [...matrix]);
    return this;
  }
  translate(x, y) {
    this.preMultiply(this.CanvasKit.Matrix.translated(x, y));
    return this;
  }
  postTranslate(x, y) {
    this.postMultiply(this.CanvasKit.Matrix.translated(x, y));
    return this;
  }
  scale(x, y) {
    this.preMultiply(this.CanvasKit.Matrix.scaled(x, y !== null && y !== void 0 ? y : x));
    return this;
  }
  postScale(x, y) {
    this.postMultiply(this.CanvasKit.Matrix.scaled(x, y !== null && y !== void 0 ? y : x));
    return this;
  }
  skew(x, y) {
    this.preMultiply(this.CanvasKit.Matrix.skewed(x, y));
    return this;
  }
  postSkew(x, y) {
    this.postMultiply(this.CanvasKit.Matrix.skewed(x, y));
    return this;
  }
  rotate(value) {
    this.preMultiply(this.CanvasKit.Matrix.rotated(value));
    return this;
  }
  postRotate(value) {
    this.postMultiply(this.CanvasKit.Matrix.rotated(value));
    return this;
  }
  identity() {
    this.ref.set(this.CanvasKit.Matrix.identity());
    return this;
  }
  get() {
    return Array.from(this.ref);
  }
}
//# sourceMappingURL=JsiSkMatrix.js.map