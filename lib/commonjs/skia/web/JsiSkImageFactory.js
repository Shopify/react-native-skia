"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkImageFactory = void 0;
var _types = require("../types");
var _Host = require("./Host");
var _JsiSkImage = require("./JsiSkImage");
var _JsiSkData = require("./JsiSkData");
class JsiSkImageFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeImageFromViewTag(viewTag) {
    const view = viewTag;
    // TODO: Implement screenshot from view in React JS
    console.log(view);
    return Promise.resolve(null);
  }
  MakeImageFromNativeBuffer(buffer, surface, image) {
    if (!(0, _types.isNativeBufferWeb)(buffer)) {
      throw new Error("Invalid NativeBuffer");
    }
    if (!surface) {
      let img;
      if (buffer instanceof HTMLImageElement || buffer instanceof HTMLVideoElement || buffer instanceof ImageBitmap) {
        img = this.CanvasKit.MakeLazyImageFromTextureSource(buffer);
      } else if (buffer instanceof _types.CanvasKitWebGLBuffer) {
        img = buffer.toImage();
      } else {
        img = this.CanvasKit.MakeImageFromCanvasImageSource(buffer);
      }
      return new _JsiSkImage.JsiSkImage(this.CanvasKit, img);
    } else if (!image) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const img = surface.makeImageFromTextureSource(buffer);
      return new _JsiSkImage.JsiSkImage(this.CanvasKit, img);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const img = surface.updateTextureFromSource(image, buffer);
      return new _JsiSkImage.JsiSkImage(this.CanvasKit, img);
    }
  }
  MakeImageFromEncoded(encoded) {
    const image = this.CanvasKit.MakeImageFromEncoded(_JsiSkData.JsiSkData.fromValue(encoded));
    if (image === null) {
      return null;
    }
    return new _JsiSkImage.JsiSkImage(this.CanvasKit, image);
  }
  MakeImageFromNativeTextureUnstable() {
    return (0, _Host.throwNotImplementedOnRNWeb)();
  }
  MakeImage(info, data, bytesPerRow) {
    // see toSkImageInfo() from canvaskit
    const image = this.CanvasKit.MakeImage({
      alphaType: (0, _Host.getEnum)(this.CanvasKit, "AlphaType", info.alphaType),
      colorSpace: this.CanvasKit.ColorSpace.SRGB,
      colorType: (0, _Host.getEnum)(this.CanvasKit, "ColorType", info.colorType),
      height: info.height,
      width: info.width
    }, _JsiSkData.JsiSkData.fromValue(data), bytesPerRow);
    if (image === null) {
      return null;
    }
    return new _JsiSkImage.JsiSkImage(this.CanvasKit, image);
  }
}
exports.JsiSkImageFactory = JsiSkImageFactory;
//# sourceMappingURL=JsiSkImageFactory.js.map