"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkPictureRecorder = void 0;
var _Host = require("./Host");
var _JsiSkCanvas = require("./JsiSkCanvas");
var _JsiSkPicture = require("./JsiSkPicture");
var _JsiSkRect = require("./JsiSkRect");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class JsiSkPictureRecorder extends _Host.HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "PictureRecorder");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  beginRecording(bounds) {
    return new _JsiSkCanvas.JsiSkCanvas(this.CanvasKit, this.ref.beginRecording(bounds ? _JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, bounds) : Float32Array.of(0, 0, 2000000, 2000000)));
  }
  finishRecordingAsPicture() {
    return new _JsiSkPicture.JsiSkPicture(this.CanvasKit, this.ref.finishRecordingAsPicture());
  }
}
exports.JsiSkPictureRecorder = JsiSkPictureRecorder;
//# sourceMappingURL=JsiSkPictureRecorder.js.map