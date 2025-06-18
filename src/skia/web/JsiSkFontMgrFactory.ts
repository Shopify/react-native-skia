import type { CanvasKit } from "canvaskit-wasm";

import type { FontMgrFactory } from "../types";

import { Host } from "./Host";
import { JsiSkFontMgr } from "./JsiSkFontMgr";

export class JsiSkFontMgrFactory extends Host implements FontMgrFactory {
  constructor(CanvasKit: CanvasKit) {
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
