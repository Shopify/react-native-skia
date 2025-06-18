"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkAnimatedImageFactory = void 0;
var _Host = require("./Host");
var _JsiSkData = require("./JsiSkData");
var _JsiSkAnimatedImage = require("./JsiSkAnimatedImage");
class JsiSkAnimatedImageFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeAnimatedImageFromEncoded(encoded) {
    const image = this.CanvasKit.MakeAnimatedImageFromEncoded(_JsiSkData.JsiSkData.fromValue(encoded));
    if (image === null) {
      return null;
    }
    return new _JsiSkAnimatedImage.JsiSkAnimatedImage(this.CanvasKit, image);
  }
}
exports.JsiSkAnimatedImageFactory = JsiSkAnimatedImageFactory;
//# sourceMappingURL=JsiSkAnimatedImageFactory.js.map