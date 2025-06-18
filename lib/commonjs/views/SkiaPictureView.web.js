"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SkiaPictureView = void 0;
var _SkiaBaseWebView = require("./SkiaBaseWebView");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class SkiaPictureView extends _SkiaBaseWebView.SkiaBaseWebView {
  constructor(props) {
    super(props);
    _defineProperty(this, "picture", null);
  }
  setPicture(picture) {
    this.picture = picture;
    this.redraw();
  }
  renderInCanvas(canvas) {
    if (this.props.picture) {
      canvas.drawPicture(this.props.picture);
    } else if (this.picture) {
      canvas.drawPicture(this.picture);
    }
  }
}
exports.SkiaPictureView = SkiaPictureView;
//# sourceMappingURL=SkiaPictureView.web.js.map