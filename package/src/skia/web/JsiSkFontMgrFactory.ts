import type { CanvasKit } from "canvaskit-wasm";

import type { SkData, FontMgrFactory } from "../types";

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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return new JsiSkFontMgr(this.CanvasKit, fontMgr);
  }
}
