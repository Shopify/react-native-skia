import type { CanvasKit, FontMgr } from "canvaskit-wasm";

import { JsiSkTypeface } from "./JsiSkTypeface";
import type { FontStyle, SkFontMgr, SkTypeface } from "../types";

import { HostObject, optEnum } from "./Host";

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
  matchFamilyStyle(name: string, style: FontStyle): SkTypeface | null {
    const fontStyles = {
      weight: optEnum(style.weight),
      width: optEnum(style.width),
      slant: optEnum(style.slant),
    };

    const tf = this.ref.matchFamilyStyle(name, fontStyles);
    if (tf == null) {
      return null;
    }
    return new JsiSkTypeface(this.CanvasKit, tf);
  }
}
