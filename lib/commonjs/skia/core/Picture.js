"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPicture = void 0;
var _Skia = require("../Skia");
var _types = require("../types");
/**
 * Memoizes and returns an SkPicture that can be drawn to another canvas.
 * @param rect Picture bounds
 * @param cb Callback for drawing to the canvas
 * @returns SkPicture
 */
const createPicture = (cb, rect) => {
  "worklet";

  const recorder = _Skia.Skia.PictureRecorder();
  let bounds;
  if (rect) {
    bounds = (0, _types.isRect)(rect) ? rect : _Skia.Skia.XYWHRect(0, 0, rect.width, rect.height);
  }
  const canvas = recorder.beginRecording(bounds);
  cb(canvas);
  return recorder.finishRecordingAsPicture();
};
exports.createPicture = createPicture;
//# sourceMappingURL=Picture.js.map