import { Host } from "./Host";
import { JsiSkTypefaceFontProvider } from "./JsiSkTypefaceFontProvider";
export class JsiSkTypefaceFontProviderFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  Make() {
    const tf = this.CanvasKit.TypefaceFontProvider.Make();
    return new JsiSkTypefaceFontProvider(this.CanvasKit, tf);
  }
}
//# sourceMappingURL=JsiSkTypefaceFontProviderFactory.js.map