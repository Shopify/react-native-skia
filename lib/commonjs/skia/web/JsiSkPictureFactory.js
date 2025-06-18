"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkPictureFactory = void 0;
var _Host = require("./Host");
var _JsiSkPicture = require("./JsiSkPicture");
class JsiSkPictureFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakePicture(bytes) {
    const pic = this.CanvasKit.MakePicture(bytes);
    if (pic === null) {
      return null;
    }
    return new _JsiSkPicture.JsiSkPicture(this.CanvasKit, pic);
  }
}
exports.JsiSkPictureFactory = JsiSkPictureFactory;
//# sourceMappingURL=JsiSkPictureFactory.js.map