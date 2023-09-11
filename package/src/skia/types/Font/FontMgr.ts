import type { SkJSIInstance } from "../JsiInstance";
import type { SkTypeface } from "../Typeface";

import type { FontStyle } from "./Font";

export interface SkFontMgr extends SkJSIInstance<"FontMgr"> {
  countFamilies(): number;
  getFamilyName(index: number): string;
  matchFamilyStyle(name: string, style: FontStyle): SkTypeface;
}
