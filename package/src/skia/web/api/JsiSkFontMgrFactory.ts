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
    // We leave the comment below to remind us that this is not implemented in CanvasKit
    // throw new NotImplementedOnRNWeb();
    const font = require("./fonts/Roboto-Medium.ttf").default;
    const decoded = atob(font.substring(font.indexOf(",") + 1));
    const buffer = new Uint8Array(decoded.length);
    buffer.set(decoded.split("").map((c) => c.charCodeAt(0)));
    return new JsiSkFontMgr(this.CanvasKit, [new Uint8Array(buffer)]);
  }
}
