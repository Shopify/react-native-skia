import { Host } from "./Host";
import { JsiSkTypeface } from "./JsiSkTypeface";
export class JsiSkTypefaceFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeFreeTypeFaceFromData(data) {
    const tf = this.CanvasKit.Typeface.MakeFreeTypeFaceFromData(JsiSkTypeface.fromValue(data));
    if (tf === null) {
      return null;
    }
    return new JsiSkTypeface(this.CanvasKit, tf);
  }
}
//# sourceMappingURL=JsiSkTypefaceFactory.js.map