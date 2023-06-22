import type { CanvasKit } from "canvaskit-wasm";

import type { SkFontMgrFactory } from "../types";

import { Host } from "./Host";
import { JsiSkFontMgr } from "./JsiSkFontMgr";

export class JsiSkFontMgrFactory extends Host implements SkFontMgrFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  FromData(...fonts: ArrayBuffer[]) {
    const fontMgr = this.CanvasKit.FontMgr.FromData(...fonts);
    if (!fontMgr) {
      throw new Error("Couldn't create custom font manager");
    }
    return new JsiSkFontMgr(this.CanvasKit, fontMgr);
  }

  System() {
    const fontMgr = this.CanvasKit.FontMgr.FromData();
    if (!fontMgr) {
      throw new Error("Couldn't create system font manager");
    }
    return new JsiSkFontMgr(this.CanvasKit, fontMgr);
  }
}
