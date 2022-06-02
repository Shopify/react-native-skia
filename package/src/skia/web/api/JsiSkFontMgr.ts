import type { CanvasKit, FontMgr, Typeface } from "canvaskit-wasm";

import type { FontStyle, SkFontMgr, SkTypeface } from "../../types";

import { HostObject } from "./Host";
import { JsiSkTypeface } from "./JsiSkTypeface";

export class JsiSkFontMgr
  extends HostObject<FontMgr, "FontMgr">
  implements SkFontMgr
{
  // We keep track of the font as a workaround for matchFamilyStyle();
  private fonts: SkTypeface[];

  constructor(CanvasKit: CanvasKit, fonts: ArrayBuffer[]) {
    super(CanvasKit, CanvasKit.FontMgr.FromData(...fonts)!, "FontMgr");
    this.fonts = fonts
      .map((font) => CanvasKit.Typeface.MakeFreeTypeFaceFromData(font))
      .filter((tf): tf is Typeface => tf !== null)
      .map((tf) => new JsiSkTypeface(CanvasKit, tf));
  }

  countFamilies() {
    return this.ref.countFamilies();
  }

  getFamilyName(index: number) {
    return this.ref.getFamilyName(index);
  }

  matchFamilyStyle(
    _familyName: string,
    _fontStyle?: FontStyle
  ): SkTypeface | null {
    // We leave the comment below to remind us that this is not implemented in CanvasKit
    // throw new NotImplementedOnRNWeb();
    return this.fonts[0];
  }
}
