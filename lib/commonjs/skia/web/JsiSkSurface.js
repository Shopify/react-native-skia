"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkSurface = void 0;
var _Host = require("./Host");
var _JsiSkCanvas = require("./JsiSkCanvas");
var _JsiSkImage = require("./JsiSkImage");
var _JsiSkRect = require("./JsiSkRect");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class JsiSkSurface extends _Host.HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Surface");
    _defineProperty(this, "dispose", () => {
      this.ref.dispose();
    });
  }
  flush() {
    this.ref.flush();
  }
  width() {
    return this.ref.width();
  }
  height() {
    return this.ref.height();
  }
  getCanvas() {
    return new _JsiSkCanvas.JsiSkCanvas(this.CanvasKit, this.ref.getCanvas());
  }
  makeImageSnapshot(bounds) {
    const image = this.ref.makeImageSnapshot(bounds ? Array.from(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, bounds)) : undefined);
    return new _JsiSkImage.JsiSkImage(this.CanvasKit, image);
  }
  getNativeTextureUnstable() {
    console.warn("getBackendTexture is not implemented on Web");
    return null;
  }
}
exports.JsiSkSurface = JsiSkSurface;
//# sourceMappingURL=JsiSkSurface.js.map