import { Host, getEnum } from "./Host";
import { JsiSkMatrix } from "./JsiSkMatrix";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkShader } from "./JsiSkShader";
export class JsiSkShaderFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeLinearGradient(start, end, colors, pos, mode, localMatrix, flags) {
    return new JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeLinearGradient(JsiSkPoint.fromValue(start), JsiSkPoint.fromValue(end), colors, pos, getEnum(this.CanvasKit, "TileMode", mode), localMatrix === undefined ? undefined : JsiSkMatrix.fromValue(localMatrix), flags));
  }
  MakeRadialGradient(center, radius, colors, pos, mode, localMatrix, flags) {
    return new JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeRadialGradient(JsiSkPoint.fromValue(center), radius, colors, pos, getEnum(this.CanvasKit, "TileMode", mode), localMatrix === undefined ? undefined : JsiSkMatrix.fromValue(localMatrix), flags));
  }
  MakeTwoPointConicalGradient(start, startRadius, end, endRadius, colors, pos, mode, localMatrix, flags) {
    return new JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeTwoPointConicalGradient(JsiSkPoint.fromValue(start), startRadius, JsiSkPoint.fromValue(end), endRadius, colors, pos, getEnum(this.CanvasKit, "TileMode", mode), localMatrix === undefined ? undefined : JsiSkMatrix.fromValue(localMatrix), flags));
  }
  MakeSweepGradient(cx, cy, colors, pos, mode, localMatrix, flags, startAngleInDegrees, endAngleInDegrees) {
    return new JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeSweepGradient(cx, cy, colors, pos, getEnum(this.CanvasKit, "TileMode", mode), localMatrix === undefined || localMatrix === null ? undefined : JsiSkMatrix.fromValue(localMatrix), flags, startAngleInDegrees, endAngleInDegrees));
  }
  MakeTurbulence(baseFreqX, baseFreqY, octaves, seed, tileW, tileH) {
    return new JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeTurbulence(baseFreqX, baseFreqY, octaves, seed, tileW, tileH));
  }
  MakeFractalNoise(baseFreqX, baseFreqY, octaves, seed, tileW, tileH) {
    return new JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeFractalNoise(baseFreqX, baseFreqY, octaves, seed, tileW, tileH));
  }
  MakeBlend(mode, one, two) {
    return new JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeBlend(getEnum(this.CanvasKit, "BlendMode", mode), JsiSkShader.fromValue(one), JsiSkShader.fromValue(two)));
  }
  MakeColor(color) {
    return new JsiSkShader(this.CanvasKit, this.CanvasKit.Shader.MakeColor(color, this.CanvasKit.ColorSpace.SRGB));
  }
}
//# sourceMappingURL=JsiSkShaderFactory.js.map