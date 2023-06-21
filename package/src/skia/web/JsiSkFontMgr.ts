import type { CanvasKit, FontMgr } from "canvaskit-wasm";

import type { FontStyle, SkFontMgr, SkTypeface } from "../types";

import { HostObject } from "./Host";

export class JsiSkFontMgr
  extends HostObject<FontMgr, "FontMgr">
  implements SkFontMgr
{
  constructor(CanvasKit: CanvasKit, ref: FontMgr) {
    super(CanvasKit, ref, "FontMgr");
  }
  dispose() {
    this.ref.delete();
  }
  countFamilies() {
    return this.ref.countFamilies();
  }
  getFamilyName(index: number) {
    return this.ref.getFamilyName(index);
  }
  matchFamilyStyle(_name: string, _style: FontStyle): SkTypeface {
    throw new Error("Method not implemented.");
  }
}
