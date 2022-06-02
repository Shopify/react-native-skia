/*global atob*/
import type { CanvasKit } from "canvaskit-wasm";

import type { SkFontMgr } from "../../types";
import type { FontMgrFactory } from "../../types/FontMgr/FontMgrFactory";

import { Host } from "./Host";
import { JsiSkFontMgr } from "./JsiSkFontMgr";

export class JsiSkFontMgrFactory extends Host implements FontMgrFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  RefDefault(): SkFontMgr {
    return new JsiSkFontMgr(this.CanvasKit);
  }
}
