import type { CanvasKit } from "canvaskit-wasm";

import type { SkFontMgrFactory, SkFontMgr, WebFont } from "../types";

import { Host } from "./Host";
import { JsiSkFontMgr } from "./JsiSkFontMgr";

export class JsiSkFontMgrFactory extends Host implements SkFontMgrFactory {
  private static instance: null | SkFontMgr = null;

  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  loadFontsOnWeb(...fonts: WebFont[]) {
    JsiSkFontMgrFactory.instance = new JsiSkFontMgr(this.CanvasKit, fonts);
    return JsiSkFontMgrFactory.instance;
  }
  getInstance() {
    if (!JsiSkFontMgrFactory.instance) {
      throw new Error(
        `JsiFontManagerFactory hasn't been initialized.
use Skia.FontMgr.initializeWithDataOnWeb() to initialize the font manager`
      );
    }
    return JsiSkFontMgrFactory.instance;
  }
}
