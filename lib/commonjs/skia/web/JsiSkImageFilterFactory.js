"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkImageFilterFactory = void 0;
var _Host = require("./Host");
var _JsiSkImageFilter = require("./JsiSkImageFilter");
var _JsiSkColorFilter = require("./JsiSkColorFilter");
class JsiSkImageFilterFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeOffset(dx, dy, input) {
    const inputFilter = input === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(input);
    const filter = this.CanvasKit.ImageFilter.MakeOffset(dx, dy, inputFilter);
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeDisplacementMap(channelX, channelY, scale, in1, input) {
    const inputFilter = input === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(input);
    const filter = this.CanvasKit.ImageFilter.MakeDisplacementMap((0, _Host.getEnum)(this.CanvasKit, "ColorChannel", channelX), (0, _Host.getEnum)(this.CanvasKit, "ColorChannel", channelY), scale, _JsiSkImageFilter.JsiSkImageFilter.fromValue(in1), inputFilter);
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeShader(shader, _input) {
    const filter = this.CanvasKit.ImageFilter.MakeShader(_JsiSkImageFilter.JsiSkImageFilter.fromValue(shader));
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeBlur(sigmaX, sigmaY, mode, input) {
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, this.CanvasKit.ImageFilter.MakeBlur(sigmaX, sigmaY, (0, _Host.getEnum)(this.CanvasKit, "TileMode", mode), input === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(input)));
  }
  MakeColorFilter(cf, input) {
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, this.CanvasKit.ImageFilter.MakeColorFilter(_JsiSkColorFilter.JsiSkColorFilter.fromValue(cf), input === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(input)));
  }
  MakeCompose(outer, inner) {
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, this.CanvasKit.ImageFilter.MakeCompose(outer === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(outer), inner === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(inner)));
  }
  MakeDropShadow(dx, dy, sigmaX, sigmaY, color, input, cropRect) {
    const inputFilter = input === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(input);
    if (cropRect) {
      (0, _Host.throwNotImplementedOnRNWeb)();
    }
    const filter = this.CanvasKit.ImageFilter.MakeDropShadow(dx, dy, sigmaX, sigmaY, color, inputFilter);
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeDropShadowOnly(dx, dy, sigmaX, sigmaY, color, input, cropRect) {
    const inputFilter = input === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(input);
    if (cropRect) {
      (0, _Host.throwNotImplementedOnRNWeb)();
    }
    const filter = this.CanvasKit.ImageFilter.MakeDropShadowOnly(dx, dy, sigmaX, sigmaY, color, inputFilter);
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeErode(rx, ry, input, cropRect) {
    const inputFilter = input === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(input);
    if (cropRect) {
      (0, _Host.throwNotImplementedOnRNWeb)();
    }
    const filter = this.CanvasKit.ImageFilter.MakeErode(rx, ry, inputFilter);
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeDilate(rx, ry, input, cropRect) {
    const inputFilter = input === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(input);
    if (cropRect) {
      (0, _Host.throwNotImplementedOnRNWeb)();
    }
    const filter = this.CanvasKit.ImageFilter.MakeDilate(rx, ry, inputFilter);
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeBlend(mode, background, foreground, cropRect) {
    const inputFilter = foreground === null ? null : _JsiSkImageFilter.JsiSkImageFilter.fromValue(foreground);
    if (cropRect) {
      (0, _Host.throwNotImplementedOnRNWeb)();
    }
    const filter = this.CanvasKit.ImageFilter.MakeBlend((0, _Host.getEnum)(this.CanvasKit, "BlendMode", mode), _JsiSkImageFilter.JsiSkImageFilter.fromValue(background), inputFilter);
    return new _JsiSkImageFilter.JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeRuntimeShader(_builder, _childShaderName, _input) {
    return (0, _Host.throwNotImplementedOnRNWeb)();
  }
}
exports.JsiSkImageFilterFactory = JsiSkImageFilterFactory;
//# sourceMappingURL=JsiSkImageFilterFactory.js.map