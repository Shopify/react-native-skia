"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkRSXform = void 0;
var _Host = require("./Host");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class JsiSkRSXform extends _Host.BaseHostObject {
  static fromValue(rsxform) {
    if (rsxform instanceof JsiSkRSXform) {
      return rsxform.ref;
    }
    return Float32Array.of(rsxform.scos, rsxform.ssin, rsxform.tx, rsxform.ty);
  }
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "RSXform");
    _defineProperty(this, "dispose", () => {
      // nothing to do here, RSXform is a Float32Array
    });
  }
  set(scos, ssin, tx, ty) {
    this.ref[0] = scos;
    this.ref[1] = ssin;
    this.ref[2] = tx;
    this.ref[3] = ty;
  }
  get scos() {
    return this.ref[0];
  }
  get ssin() {
    return this.ref[1];
  }
  get tx() {
    return this.ref[2];
  }
  get ty() {
    return this.ref[3];
  }
}
exports.JsiSkRSXform = JsiSkRSXform;
//# sourceMappingURL=JsiSkRSXform.js.map