import type { SkFontMgr } from "../Font";
import type { SkTypeface } from "../Typeface";

export interface SkTypefaceFontProvider extends SkFontMgr {
  /**
   * Registers a given typeface with the given family name.
   * @param typeface - Typeface.
   * @param family
   */
  registerFont(typeface: SkTypeface, familyName: string): void;
}
