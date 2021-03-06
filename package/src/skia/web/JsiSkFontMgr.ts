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
    console.warn(
      "countFamilies() is deprecated. It returns 0 on React Native Web"
    );
    return 0;
  }

  getFamilyName(_index: number) {
    console.warn(
      "getFamilyName() is deprecated. It returns an empty string on React Native Web"
    );
    return "";
  }

  matchFamilyStyle(
    _familyName: string,
    _fontStyle?: FontStyle
  ): SkTypeface | null {
    console.warn(
      "matchFamilyStyle() is deprecated. It returns null on React Native Web"
    );
    return null;
  }
}
