import type { CanvasKit } from "canvaskit-wasm";

import type { SkFontMgrFactory, SkFontMgr } from "../types";

import { Host } from "./Host";
import { JsiSkFontMgr } from "./JsiSkFontMgr";

export class JsiSkFontMgrFactory extends Host implements SkFontMgrFactory {
  private static instance: null | SkFontMgr = null;

  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }
  MakeFromData(...buffers: ArrayBuffer[]) {
    if (JsiSkFontMgrFactory.instance !== null) {
      throw new Error(
        "JsiFontManagerFactory has been initialized already. use Skia.FontMgr.getInstance() instead"
      );
    }
    const fontMgr = this.CanvasKit.FontMgr.FromData(...buffers);
    if (!fontMgr) {
      throw new Error("Couldn't create FontMgr");
    }
    return new JsiSkFontMgr(this.CanvasKit, fontMgr);
  }
  getInstance() {
    if (!JsiSkFontMgrFactory.instance) {
      throw new Error(
        "JsiFontManagerFactory hasn't been initialized. use Skia.FontMgr.MakeFromData() to initialize the font manager"
      );
    }
    return JsiSkFontMgrFactory.instance;
  }
}
