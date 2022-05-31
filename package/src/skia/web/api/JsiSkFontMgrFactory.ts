import type { CanvasKit } from "canvaskit-wasm";

import type { FontMgr } from "../../types";
import type { FontMgrFactory } from "../../types/FontMgr/FontMgrFactory";

import { Host, NotImplementedOnRNWeb } from "./Host";

export class JsiSkFontMgrFactory extends Host implements FontMgrFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  RefDefault(): FontMgr {
    throw new NotImplementedOnRNWeb();
  }
}
