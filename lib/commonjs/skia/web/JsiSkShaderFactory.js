"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkShaderFactory = void 0;
var _Host = require("./Host");
var _JsiSkMatrix = require("./JsiSkMatrix");
var _JsiSkPoint = require("./JsiSkPoint");
var _JsiSkShader = require("./JsiSkShader");
class JsiSkShaderFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeLinearGradient(start, end, colors, pos, mode, localMatrix, flags) {
    return new _JsiSkShader.JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeLinearGradient(_JsiSkPoint.JsiSkPoint.fromValue(start), _JsiSkPoint.JsiSkPoint.fromValue(end), colors, pos, (0, _Host.getEnum)(this.CanvasKit, "TileMode", mode), localMatrix === undefined ? undefined : _JsiSkMatrix.JsiSkMatrix.fromValue(localMatrix), flags));
  }
  MakeRadialGradient(center, radius, colors, pos, mode, localMatrix, flags) {
    return new _JsiSkShader.JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeRadialGradient(_JsiSkPoint.JsiSkPoint.fromValue(center), radius, colors, pos, (0, _Host.getEnum)(this.CanvasKit, "TileMode", mode), localMatrix === undefined ? undefined : _JsiSkMatrix.JsiSkMatrix.fromValue(localMatrix), flags));
  }
  MakeTwoPointConicalGradient(start, startRadius, end, endRadius, colors, pos, mode, localMatrix, flags) {
    return new _JsiSkShader.JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeTwoPointConicalGradient(_JsiSkPoint.JsiSkPoint.fromValue(start), startRadius, _JsiSkPoint.JsiSkPoint.fromValue(end), endRadius, colors, pos, (0, _Host.getEnum)(this.CanvasKit, "TileMode", mode), localMatrix === undefined ? undefined : _JsiSkMatrix.JsiSkMatrix.fromValue(localMatrix), flags));
  }
  MakeSweepGradient(cx, cy, colors, pos, mode, localMatrix, flags, startAngleInDegrees, endAngleInDegrees) {
    return new _JsiSkShader.JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeSweepGradient(cx, cy, colors, pos, (0, _Host.getEnum)(this.CanvasKit, "TileMode", mode), localMatrix === undefined || localMatrix === null ? undefined : _JsiSkMatrix.JsiSkMatrix.fromValue(localMatrix), flags, startAngleInDegrees, endAngleInDegrees));
  }
  MakeTurbulence(baseFreqX, baseFreqY, octaves, seed, tileW, tileH) {
    return new _JsiSkShader.JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeTurbulence(baseFreqX, baseFreqY, octaves, seed, tileW, tileH));
  }
  MakeFractalNoise(baseFreqX, baseFreqY, octaves, seed, tileW, tileH) {
    return new _JsiSkShader.JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeFractalNoise(baseFreqX, baseFreqY, octaves, seed, tileW, tileH));
  }
  MakeBlend(mode, one, two) {
    return new _JsiSkShader.JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeBlend((0, _Host.getEnum)(this.CanvasKit, "BlendMode", mode), _JsiSkShader.JsiSkShader.fromValue(one), _JsiSkShader.JsiSkShader.fromValue(two)));
  }
  MakeColor(color) {
    return new _JsiSkShader.JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeColor(color, this.CanvasKit.ColorSpace.SRGB));
  }
}
exports.JsiSkShaderFactory = JsiSkShaderFactory;
//# sourceMappingURL=JsiSkShaderFactory.js.map