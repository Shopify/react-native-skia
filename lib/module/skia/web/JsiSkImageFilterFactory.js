import { Host, throwNotImplementedOnRNWeb, getEnum } from "./Host";
import { JsiSkImageFilter } from "./JsiSkImageFilter";
import { JsiSkColorFilter } from "./JsiSkColorFilter";
export class JsiSkImageFilterFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeOffset(dx, dy, input) {
    const inputFilter = input === null ? null : JsiSkImageFilter.fromValue(input);
    const filter = this.CanvasKit.ImageFilter.MakeOffset(dx, dy, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeDisplacementMap(channelX, channelY, scale, in1, input) {
    const inputFilter = input === null ? null : JsiSkImageFilter.fromValue(input);
    const filter = this.CanvasKit.ImageFilter.MakeDisplacementMap(getEnum(this.CanvasKit, "ColorChannel", channelX), getEnum(this.CanvasKit, "ColorChannel", channelY), scale, JsiSkImageFilter.fromValue(in1), inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeShader(shader, _input) {
    const filter = this.CanvasKit.ImageFilter.MakeShader(JsiSkImageFilter.fromValue(shader));
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeBlur(sigmaX, sigmaY, mode, input) {
    return new JsiSkImageFilter(this.CanvasKit, this.CanvasKit.ImageFilter.MakeBlur(sigmaX, sigmaY, getEnum(this.CanvasKit, "TileMode", mode), input === null ? null : JsiSkImageFilter.fromValue(input)));
  }
  MakeColorFilter(cf, input) {
    return new JsiSkImageFilter(this.CanvasKit, this.CanvasKit.ImageFilter.MakeColorFilter(JsiSkColorFilter.fromValue(cf), input === null ? null : JsiSkImageFilter.fromValue(input)));
  }
  MakeCompose(outer, inner) {
    return new JsiSkImageFilter(this.CanvasKit, this.CanvasKit.ImageFilter.MakeCompose(outer === null ? null : JsiSkImageFilter.fromValue(outer), inner === null ? null : JsiSkImageFilter.fromValue(inner)));
  }
  MakeDropShadow(dx, dy, sigmaX, sigmaY, color, input, cropRect) {
    const inputFilter = input === null ? null : JsiSkImageFilter.fromValue(input);
    if (cropRect) {
      throwNotImplementedOnRNWeb();
    }
    const filter = this.CanvasKit.ImageFilter.MakeDropShadow(dx, dy, sigmaX, sigmaY, color, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeDropShadowOnly(dx, dy, sigmaX, sigmaY, color, input, cropRect) {
    const inputFilter = input === null ? null : JsiSkImageFilter.fromValue(input);
    if (cropRect) {
      throwNotImplementedOnRNWeb();
    }
    const filter = this.CanvasKit.ImageFilter.MakeDropShadowOnly(dx, dy, sigmaX, sigmaY, color, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeErode(rx, ry, input, cropRect) {
    const inputFilter = input === null ? null : JsiSkImageFilter.fromValue(input);
    if (cropRect) {
      throwNotImplementedOnRNWeb();
    }
    const filter = this.CanvasKit.ImageFilter.MakeErode(rx, ry, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeDilate(rx, ry, input, cropRect) {
    const inputFilter = input === null ? null : JsiSkImageFilter.fromValue(input);
    if (cropRect) {
      throwNotImplementedOnRNWeb();
    }
    const filter = this.CanvasKit.ImageFilter.MakeDilate(rx, ry, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeBlend(mode, background, foreground, cropRect) {
    const inputFilter = foreground === null ? null : JsiSkImageFilter.fromValue(foreground);
    if (cropRect) {
      throwNotImplementedOnRNWeb();
    }
    const filter = this.CanvasKit.ImageFilter.MakeBlend(getEnum(this.CanvasKit, "BlendMode", mode), JsiSkImageFilter.fromValue(background), inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }
  MakeRuntimeShader(_builder, _childShaderName, _input) {
    return throwNotImplementedOnRNWeb();
  }
}
//# sourceMappingURL=JsiSkImageFilterFactory.js.map