import { getEnum, Host } from "./Host";
import { JsiSkColorFilter } from "./JsiSkColorFilter";
export class JsiSkColorFilterFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeMatrix(cMatrix) {
    return new JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeMatrix(cMatrix));
  }
  MakeBlend(color, mode) {
    return new JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeBlend(color, getEnum(this.CanvasKit, "BlendMode", mode)));
  }
  MakeCompose(outer, inner) {
    return new JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeCompose(JsiSkColorFilter.fromValue(outer), JsiSkColorFilter.fromValue(inner)));
  }
  MakeLerp(t, dst, src) {
    return new JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeLerp(t, JsiSkColorFilter.fromValue(dst), JsiSkColorFilter.fromValue(src)));
  }
  MakeLinearToSRGBGamma() {
    return new JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeLinearToSRGBGamma());
  }
  MakeSRGBToLinearGamma() {
    return new JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeSRGBToLinearGamma());
  }
  MakeLumaColorFilter() {
    return new JsiSkColorFilter(this.CanvasKit, this.CanvasKit.ColorFilter.MakeLuma());
  }
}
//# sourceMappingURL=JsiSkColorFilterFactory.js.map