"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CanvasKitWebGLBufferImpl = void 0;
var _types = require("../types");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class CanvasKitWebGLBufferImpl extends _types.CanvasKitWebGLBuffer {
  constructor(surface, source) {
    super();
    this.surface = surface;
    this.source = source;
    _defineProperty(this, "image", null);
  }
  toImage() {
    if (this.image === null) {
      this.image = this.surface.makeImageFromTextureSource(this.source);
    }
    if (this.image === null) {
      throw new Error("Failed to create image from texture source");
    }
    this.surface.updateTextureFromSource(this.image, this.source);
    return this.image;
  }
}
exports.CanvasKitWebGLBufferImpl = CanvasKitWebGLBufferImpl;
//# sourceMappingURL=CanvasKitWebGLBufferImpl.js.map