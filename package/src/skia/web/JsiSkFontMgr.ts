import type { CanvasKit } from "canvaskit-wasm";

import type { FontStyle, SkFontMgr, SkTypeface } from "../types";

import { HostObject } from "./Host";

export class JsiSkFontMgr
  extends HostObject<null, "FontMgr">
  implements SkFontMgr
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit, null, "FontMgr");
  }

  countFamilies() {
    return 0;
  }

  getFamilyName(_index: number) {
    return "";
  }

  matchFamilyStyle(
    _familyName: string,
    _fontStyle?: FontStyle
  ): SkTypeface | null {
    // We leave the comment below to remind us that this is not implemented in CanvasKit
    // throw new NotImplementedOnRNWeb();
    return null;
  }
}
