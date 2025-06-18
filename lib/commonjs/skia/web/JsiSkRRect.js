"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkRRect = void 0;
var _Host = require("./Host");
var _JsiSkRect = require("./JsiSkRect");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class JsiSkRRect extends _Host.BaseHostObject {
  static fromValue(CanvasKit, rect) {
    if (rect instanceof _JsiSkRect.JsiSkRect) {
      return rect.ref;
    }
    if ("topLeft" in rect && "topRight" in rect && "bottomRight" in rect && "bottomLeft" in rect) {
      return Float32Array.of(rect.rect.x, rect.rect.y, rect.rect.x + rect.rect.width, rect.rect.y + rect.rect.height, rect.topLeft.x, rect.topLeft.y, rect.topRight.x, rect.topRight.y, rect.bottomRight.x, rect.bottomRight.y, rect.bottomLeft.x, rect.bottomLeft.y);
    }
    return CanvasKit.RRectXY(_JsiSkRect.JsiSkRect.fromValue(CanvasKit, rect.rect), rect.rx, rect.ry);
  }
  constructor(CanvasKit, rect, rx, ry) {
    // based on https://github.com/google/skia/blob/main/src/core/SkRRect.cpp#L51
    if (rx === Infinity || ry === Infinity) {
      rx = ry = 0;
    }
    if (rect.width < rx + rx || rect.height < ry + ry) {
      // At most one of these two divides will be by zero, and neither numerator is zero.
      const scale = Math.min(rect.width / (rx + rx), rect.height / (ry + ry));
      rx *= scale;
      ry *= scale;
    }
    const ref = CanvasKit.RRectXY(_JsiSkRect.JsiSkRect.fromValue(CanvasKit, rect), rx, ry);
    super(CanvasKit, ref, "RRect");
    _defineProperty(this, "dispose", () => {
      // Float32Array
    });
  }
  get rx() {
    return this.ref[4];
  }
  get ry() {
    return this.ref[5];
  }
  get rect() {
    return new _JsiSkRect.JsiSkRect(this.CanvasKit, Float32Array.of(this.ref[0], this.ref[1], this.ref[2], this.ref[3]));
  }
}
exports.JsiSkRRect = JsiSkRRect;
//# sourceMappingURL=JsiSkRRect.js.map