import type { CanvasKit, FontMgr } from "canvaskit-wasm";

import type { FontStyle, SkFontMgr, SkFontStyleSet, SkTypeface } from "../types";

import { HostObject, throwNotImplementedOnRNWeb } from "./Host";

export class JsiSkFontMgr
  extends HostObject<FontMgr, "FontMgr">
  implements SkFontMgr
{
  constructor(CanvasKit: CanvasKit, ref: FontMgr) {
    super(CanvasKit, ref, "FontMgr");
  }

  dispose() {
    this[Symbol.dispose]();
  }
  countFamilies() {
    return this.ref.countFamilies();
  }
  getFamilyName(index: number) {
    return this.ref.getFamilyName(index);
  }
  createStyleSet(_index: number): SkFontStyleSet | null {
    return throwNotImplementedOnRNWeb<SkFontStyleSet | null>();
  }
  matchFamily(_name: string): SkFontStyleSet | null {
    return throwNotImplementedOnRNWeb<SkFontStyleSet | null>();
  }
  matchFamilyStyle(_familyName: string, _fontStyle: FontStyle) {
    return throwNotImplementedOnRNWeb<SkTypeface>();
  }
}
