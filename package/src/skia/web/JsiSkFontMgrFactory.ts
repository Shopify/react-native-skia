import type { CanvasKit } from "canvaskit-wasm";

import type { SkData, SkFontMgrFactory } from "../types";

import { Host } from "./Host";
import { JsiSkFontMgr } from "./JsiSkFontMgr";
import { JsiSkData } from "./JsiSkData";

export class JsiSkFontMgrFactory extends Host implements SkFontMgrFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  FromData(fonts: SkData[]) {
    const fontMgr = this.CanvasKit.FontMgr.FromData(
      ...fonts.map((font) => JsiSkData.fromValue<ArrayBuffer>(font))
    );
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
