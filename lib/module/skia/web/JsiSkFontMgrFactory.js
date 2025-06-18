import { Host } from "./Host";
import { JsiSkFontMgr } from "./JsiSkFontMgr";
export class JsiSkFontMgrFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  System() {
    const fontMgr = this.CanvasKit.TypefaceFontProvider.Make();
    if (!fontMgr) {
      throw new Error("Couldn't create system font manager");
    }
    return new JsiSkFontMgr(this.CanvasKit, fontMgr);
  }
}
//# sourceMappingURL=JsiSkFontMgrFactory.js.map