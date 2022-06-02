import type { CanvasKit } from "canvaskit-wasm";

import type { SkFontMgr } from "../../types";
import type { FontMgrFactory } from "../../types/FontMgr/FontMgrFactory";

import { Host } from "./Host";
import { JsiSkFontMgr } from "./JsiSkFontMgr";
import { Lato } from "./fonts/Lato";

export class JsiSkFontMgrFactory extends Host implements FontMgrFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  RefDefault(): SkFontMgr {
    // We leave the comment below to remind us that this is not implemented in CanvasKit
    // throw new NotImplementedOnRNWeb();
    return new JsiSkFontMgr(this.CanvasKit, [Lato]);
  }
}
