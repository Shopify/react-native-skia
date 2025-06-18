"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isOnMainThread = exports.drawAsPicture = exports.drawAsImageFromPicture = exports.drawAsImage = void 0;
var _skia = require("../skia");
var _Platform = require("../Platform");
var _Reconciler = require("../sksg/Reconciler");
// We call it main thread because on web main is JS thread
const isOnMainThread = () => {
  "worklet";

  return typeof _WORKLET !== "undefined" && _WORKLET === true || _Platform.Platform.OS === "web";
};
exports.isOnMainThread = isOnMainThread;
const drawAsPicture = (element, bounds) => {
  const recorder = _skia.Skia.PictureRecorder();
  const canvas = recorder.beginRecording(bounds);
  const root = new _Reconciler.SkiaSGRoot(_skia.Skia);
  root.render(element);
  root.drawOnCanvas(canvas);
  const picture = recorder.finishRecordingAsPicture();
  root.unmount();
  return picture;
};
exports.drawAsPicture = drawAsPicture;
const drawAsImage = (element, size) => {
  return drawAsImageFromPicture(drawAsPicture(element), size);
};
exports.drawAsImage = drawAsImage;
const drawAsImageFromPicture = (picture, size) => {
  "worklet";

  const surface = _skia.Skia.Surface.MakeOffscreen(size.width, size.height);
  const canvas = surface.getCanvas();
  canvas.drawPicture(picture);
  surface.flush();
  const image = surface.makeImageSnapshot();
  // If we are not on the main thread or if we are on Web, we need to make the image non-texture.
  if (!isOnMainThread() || _Platform.Platform.OS === "web") {
    return image.makeNonTextureImage();
  } else {
    return image;
  }
};
exports.drawAsImageFromPicture = drawAsImageFromPicture;
//# sourceMappingURL=Offscreen.js.map