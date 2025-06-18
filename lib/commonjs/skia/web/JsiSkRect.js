"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkRect = void 0;
var _Host = require("./Host");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class JsiSkRect extends _Host.BaseHostObject {
  static fromValue(CanvasKit, rect) {
    if (rect instanceof JsiSkRect) {
      return rect.ref;
    }
    return CanvasKit.XYWHRect(rect.x, rect.y, rect.width, rect.height);
  }
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Rect");
    _defineProperty(this, "dispose", () => {
      // Float32Array
    });
  }
  setXYWH(x, y, width, height) {
    this.ref[0] = x;
    this.ref[1] = y;
    this.ref[2] = x + width;
    this.ref[3] = y + height;
  }
  get x() {
    return this.ref[0];
  }
  get y() {
    return this.ref[1];
  }
  get width() {
    return this.ref[2] - this.ref[0];
  }
  get height() {
    return this.ref[3] - this.ref[1];
  }
}
exports.JsiSkRect = JsiSkRect;
//# sourceMappingURL=JsiSkRect.js.map